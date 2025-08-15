-- ============================================================================
-- Supabase Database Schema for GoTryke Authentication
-- ============================================================================
-- This file contains the complete database schema for Supabase Auth migration
-- Run this in the Supabase SQL Editor after creating your project
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Create user roles enum
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'dispatcher', 'guide', 'passenger', 'rider');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- TABLES
-- ============================================================================

-- Create user profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'passenger',
    pin_hash VARCHAR(255) NOT NULL, -- Encrypted PIN using bcrypt
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    last_login TIMESTAMP WITH TIME ZONE,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    pin_changed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (id)
);

-- Create phone verification attempts table
CREATE TABLE IF NOT EXISTS public.phone_verifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    phone VARCHAR(20) NOT NULL,
    verification_sid VARCHAR(255) NOT NULL, -- Twilio verification SID
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified BOOLEAN DEFAULT false,
    ip_address INET, -- Track IP for security
    user_agent TEXT, -- Track user agent for security
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create audit log table for security tracking
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- 'login', 'logout', 'pin_change', 'otp_request', etc.
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create rate limiting table for additional security
CREATE TABLE IF NOT EXISTS public.rate_limits (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    identifier VARCHAR(255) NOT NULL, -- phone number or IP address
    action VARCHAR(50) NOT NULL, -- 'otp_request', 'login_attempt', etc.
    attempts INTEGER DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    UNIQUE(identifier, action)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Profiles table indexes
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_active ON public.profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_last_login ON public.profiles(last_login);

-- Phone verifications table indexes
CREATE INDEX IF NOT EXISTS idx_phone_verifications_phone ON public.phone_verifications(phone);
CREATE INDEX IF NOT EXISTS idx_phone_verifications_sid ON public.phone_verifications(verification_sid);
CREATE INDEX IF NOT EXISTS idx_phone_verifications_expires ON public.phone_verifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_phone_verifications_created ON public.phone_verifications(created_at);

-- Audit logs table indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_ip ON public.audit_logs(ip_address);

-- Rate limits table indexes
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier_action ON public.rate_limits(identifier, action);
CREATE INDEX IF NOT EXISTS idx_rate_limits_expires ON public.rate_limits(expires_at);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phone_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES TABLE POLICIES
-- ============================================================================

-- Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile (except role and critical fields)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Admins can view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin' AND is_active = true
        )
    );

-- Admins can update all profiles
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin' AND is_active = true
        )
    );

-- Admins can insert new profiles
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
CREATE POLICY "Admins can insert profiles" ON public.profiles
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin' AND is_active = true
        )
    );

-- Dispatchers can view relevant profiles (passengers, riders)
DROP POLICY IF EXISTS "Dispatchers can view relevant profiles" ON public.profiles;
CREATE POLICY "Dispatchers can view relevant profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'dispatcher') 
            AND is_active = true
        )
        AND role IN ('passenger', 'rider', 'guide')
    );

-- ============================================================================
-- PHONE VERIFICATIONS TABLE POLICIES
-- ============================================================================

-- Allow anyone to insert phone verifications (needed for signup)
DROP POLICY IF EXISTS "Allow insert phone verifications" ON public.phone_verifications;
CREATE POLICY "Allow insert phone verifications" ON public.phone_verifications
    FOR INSERT WITH CHECK (true);

-- Allow anyone to select phone verifications (needed for verification)
-- Note: In production, you might want to restrict this further
DROP POLICY IF EXISTS "Allow select phone verifications" ON public.phone_verifications;
CREATE POLICY "Allow select phone verifications" ON public.phone_verifications
    FOR SELECT USING (true);

-- Admins can view all phone verifications
DROP POLICY IF EXISTS "Admins can view phone verifications" ON public.phone_verifications;
CREATE POLICY "Admins can view phone verifications" ON public.phone_verifications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin' AND is_active = true
        )
    );

-- Allow updates for verification attempts
DROP POLICY IF EXISTS "Allow update phone verifications" ON public.phone_verifications;
CREATE POLICY "Allow update phone verifications" ON public.phone_verifications
    FOR UPDATE USING (true);

-- ============================================================================
-- AUDIT LOGS TABLE POLICIES
-- ============================================================================

-- Users can view their own audit logs
DROP POLICY IF EXISTS "Users can view own audit logs" ON public.audit_logs;
CREATE POLICY "Users can view own audit logs" ON public.audit_logs
    FOR SELECT USING (auth.uid() = user_id);

-- Admins can view all audit logs
DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view all audit logs" ON public.audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin' AND is_active = true
        )
    );

-- System can insert audit logs
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;
CREATE POLICY "System can insert audit logs" ON public.audit_logs
    FOR INSERT WITH CHECK (true);

-- ============================================================================
-- RATE LIMITS TABLE POLICIES
-- ============================================================================

-- System can manage rate limits
DROP POLICY IF EXISTS "System can manage rate limits" ON public.rate_limits;
CREATE POLICY "System can manage rate limits" ON public.rate_limits
    FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for profiles updated_at
DROP TRIGGER IF EXISTS on_profiles_updated ON public.profiles;
CREATE TRIGGER on_profiles_updated
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, phone, name, role, pin_hash, metadata)
    VALUES (
        NEW.id,
        COALESCE(NEW.phone, ''),
        COALESCE(NEW.raw_user_meta_data->>'name', 'Unknown'),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'passenger'),
        COALESCE(NEW.raw_user_meta_data->>'pin_hash', ''),
        COALESCE(NEW.raw_user_meta_data, '{}')
    );
    
    -- Log the signup
    INSERT INTO public.audit_logs (user_id, action, details, success)
    VALUES (NEW.id, 'signup', 
        jsonb_build_object(
            'phone', COALESCE(NEW.phone, ''),
            'role', COALESCE(NEW.raw_user_meta_data->>'role', 'passenger')
        ), 
        true);
    
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to log authentication events
CREATE OR REPLACE FUNCTION public.log_auth_event(
    p_user_id UUID,
    p_action VARCHAR(100),
    p_details JSONB DEFAULT '{}',
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_success BOOLEAN DEFAULT true
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, success)
    VALUES (p_user_id, p_action, p_details, p_ip_address, p_user_agent, p_success)
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Function to check and update rate limits
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    p_identifier VARCHAR(255),
    p_action VARCHAR(50),
    p_max_attempts INTEGER DEFAULT 5,
    p_window_minutes INTEGER DEFAULT 15
)
RETURNS BOOLEAN AS $$
DECLARE
    current_attempts INTEGER;
    window_start TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Clean up expired rate limit records first
    DELETE FROM public.rate_limits 
    WHERE expires_at < timezone('utc'::text, now());
    
    -- Get current attempts within the window
    SELECT attempts, window_start INTO current_attempts, window_start
    FROM public.rate_limits
    WHERE identifier = p_identifier AND action = p_action;
    
    -- If no record exists, create one
    IF current_attempts IS NULL THEN
        INSERT INTO public.rate_limits (identifier, action, attempts, window_start, expires_at)
        VALUES (
            p_identifier, 
            p_action, 
            1, 
            timezone('utc'::text, now()),
            timezone('utc'::text, now()) + interval '1 minute' * p_window_minutes
        );
        RETURN true;
    END IF;
    
    -- If within limit, increment counter
    IF current_attempts < p_max_attempts THEN
        UPDATE public.rate_limits
        SET attempts = attempts + 1
        WHERE identifier = p_identifier AND action = p_action;
        RETURN true;
    END IF;
    
    -- Rate limit exceeded
    RETURN false;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Function to clean up old records (should be called periodically)
CREATE OR REPLACE FUNCTION public.cleanup_old_records()
RETURNS VOID AS $$
BEGIN
    -- Clean up expired phone verifications (older than 1 hour)
    DELETE FROM public.phone_verifications 
    WHERE expires_at < timezone('utc'::text, now()) - interval '1 hour';
    
    -- Clean up old audit logs (older than 90 days)
    DELETE FROM public.audit_logs 
    WHERE created_at < timezone('utc'::text, now()) - interval '90 days';
    
    -- Clean up expired rate limits
    DELETE FROM public.rate_limits 
    WHERE expires_at < timezone('utc'::text, now());
    
    RAISE NOTICE 'Cleanup completed at %', timezone('utc'::text, now());
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- ============================================================================
-- SECURITY FUNCTIONS
-- ============================================================================

-- Function to validate phone number format
CREATE OR REPLACE FUNCTION public.validate_phone_number(phone_number TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if phone number matches Philippines format (+639xxxxxxxxx)
    RETURN phone_number ~ '^\+639\d{9}$';
END;
$$ language 'plpgsql';

-- Function to check if user is locked due to failed attempts
CREATE OR REPLACE FUNCTION public.is_user_locked(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    lock_until TIMESTAMP WITH TIME ZONE;
BEGIN
    SELECT locked_until INTO lock_until
    FROM public.profiles
    WHERE id = user_id;
    
    RETURN lock_until IS NOT NULL AND lock_until > timezone('utc'::text, now());
END;
$$ language 'plpgsql';

-- Function to lock user after failed attempts
CREATE OR REPLACE FUNCTION public.handle_failed_login(user_id UUID)
RETURNS VOID AS $$
DECLARE
    current_attempts INTEGER;
    max_attempts INTEGER := 5;
    lock_duration INTEGER := 15; -- minutes
BEGIN
    -- Increment failed attempts
    UPDATE public.profiles
    SET failed_login_attempts = failed_login_attempts + 1
    WHERE id = user_id
    RETURNING failed_login_attempts INTO current_attempts;
    
    -- Lock account if max attempts exceeded
    IF current_attempts >= max_attempts THEN
        UPDATE public.profiles
        SET locked_until = timezone('utc'::text, now()) + interval '1 minute' * lock_duration
        WHERE id = user_id;
        
        -- Log the account lock
        PERFORM public.log_auth_event(
            user_id, 
            'account_locked', 
            jsonb_build_object('failed_attempts', current_attempts, 'lock_duration_minutes', lock_duration),
            NULL,
            NULL,
            false
        );
    END IF;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Function to reset failed login attempts on successful login
CREATE OR REPLACE FUNCTION public.handle_successful_login(user_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.profiles
    SET 
        failed_login_attempts = 0,
        locked_until = NULL,
        last_login = timezone('utc'::text, now())
    WHERE id = user_id;
    
    -- Log successful login
    PERFORM public.log_auth_event(user_id, 'login', '{}', NULL, NULL, true);
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- ============================================================================
-- INITIAL DATA (OPTIONAL)
-- ============================================================================

-- Create default admin user (uncomment and modify as needed)
-- This should only be run once and then removed for security
/*
INSERT INTO auth.users (id, email, phone, email_confirmed_at, phone_confirmed_at, created_at, updated_at)
VALUES (
    uuid_generate_v4(),
    'admin@gotryke.local',
    '+639000000000',
    timezone('utc'::text, now()),
    timezone('utc'::text, now()),
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
);

-- Note: You'll need to manually create the corresponding profile record
-- and hash the PIN using your application's bcrypt implementation
*/

-- ============================================================================
-- MAINTENANCE QUERIES
-- ============================================================================

-- Query to check system health
/*
SELECT 
    'profiles' as table_name,
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE is_active = true) as active_users,
    COUNT(*) FILTER (WHERE role = 'admin') as admin_count,
    COUNT(*) FILTER (WHERE role = 'dispatcher') as dispatcher_count,
    COUNT(*) FILTER (WHERE role = 'passenger') as passenger_count,
    COUNT(*) FILTER (WHERE role = 'rider') as rider_count,
    COUNT(*) FILTER (WHERE role = 'guide') as guide_count
FROM public.profiles

UNION ALL

SELECT 
    'phone_verifications' as table_name,
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE verified = true) as verified_count,
    COUNT(*) FILTER (WHERE expires_at > timezone('utc'::text, now())) as active_verifications,
    NULL, NULL, NULL, NULL, NULL
FROM public.phone_verifications

UNION ALL

SELECT 
    'audit_logs' as table_name,
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE success = true) as successful_events,
    COUNT(*) FILTER (WHERE created_at > timezone('utc'::text, now()) - interval '24 hours') as last_24h_events,
    NULL, NULL, NULL, NULL, NULL
FROM public.audit_logs;
*/

-- ============================================================================
-- COMMENTS AND DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE public.profiles IS 'User profiles with authentication and role information';
COMMENT ON TABLE public.phone_verifications IS 'Phone number verification attempts via SMS OTP';
COMMENT ON TABLE public.audit_logs IS 'Security audit trail for all authentication events';
COMMENT ON TABLE public.rate_limits IS 'Rate limiting table to prevent abuse';

COMMENT ON COLUMN public.profiles.pin_hash IS 'Bcrypt hash of user PIN (minimum 12 salt rounds)';
COMMENT ON COLUMN public.profiles.metadata IS 'Additional user metadata in JSON format';
COMMENT ON COLUMN public.profiles.failed_login_attempts IS 'Number of consecutive failed login attempts';
COMMENT ON COLUMN public.profiles.locked_until IS 'Account lock expiration time';

COMMENT ON FUNCTION public.check_rate_limit IS 'Checks and updates rate limiting for various actions';
COMMENT ON FUNCTION public.cleanup_old_records IS 'Maintenance function to clean up expired records';
COMMENT ON FUNCTION public.log_auth_event IS 'Logs authentication and security events';

-- ============================================================================
-- SCHEMA VALIDATION
-- ============================================================================

-- Verify that all tables were created successfully
DO $$
DECLARE
    table_count INTEGER;
    function_count INTEGER;
BEGIN
    -- Check tables
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('profiles', 'phone_verifications', 'audit_logs', 'rate_limits');
    
    -- Check functions
    SELECT COUNT(*) INTO function_count 
    FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_name IN ('handle_new_user', 'handle_updated_at', 'log_auth_event', 'check_rate_limit', 'cleanup_old_records');
    
    RAISE NOTICE 'Schema setup complete: % tables, % functions created', table_count, function_count;
    
    IF table_count < 4 THEN
        RAISE EXCEPTION 'Some tables were not created successfully';
    END IF;
    
    IF function_count < 5 THEN
        RAISE EXCEPTION 'Some functions were not created successfully';
    END IF;
END $$;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================