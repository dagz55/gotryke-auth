# Supabase Auth Migration Project Management

## Overview
This document outlines the comprehensive migration from Firebase Auth to Supabase Auth with mobile phone-only authentication using Twilio SMS OTP verification for the GoTryke transportation management application.

## Project Scope
Implement Supabase Auth with SMS OTP verification while maintaining:
- Phone-only authentication (no email required)
- SMS OTP verification via Twilio
- PIN-based secondary authentication
- Role-based access control (Admin, Dispatcher, Guide, Passenger, Rider)
- Protected routes under `(app)` route group
- Secure session management
- Production-ready implementation

## Architecture Overview

### Authentication Flow
1. **Phone Number Entry**: User enters mobile phone number
2. **SMS OTP Delivery**: Twilio sends 6-digit OTP via SMS
3. **OTP Verification**: User enters OTP to verify phone ownership
4. **PIN Setup/Entry**: For new users, set PIN; existing users enter PIN
5. **Role Assignment**: Assign or verify user role
6. **Session Creation**: Create secure Supabase session with JWT

### Key Components
- **Supabase Auth**: Core authentication service
- **Twilio Verify API**: SMS OTP delivery and verification
- **PostgreSQL**: User profiles and role management
- **Row Level Security (RLS)**: Database-level access control
- **JWT Tokens**: Secure session management

## Phase 1: Supabase Project Setup

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create new project
2. Choose region (preferably Singapore for Philippines users)
3. Set strong database password
4. Wait for project initialization

### 1.2 Configure Auth Settings
In Supabase Dashboard → Authentication → Settings:

```sql
-- Enable phone authentication
UPDATE auth.config 
SET phone_autoconfirm_enabled = false,
    phone_confirmation_template = 'Your GoTryke verification code is: {{ .Code }}'
WHERE id = 'phone';

-- Set session settings
UPDATE auth.config 
SET jwt_expiry = 3600,  -- 1 hour
    refresh_token_rotation_enabled = true,
    security_update_password_require_reauthentication = true;
```

### 1.3 Environment Variables
Update `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Twilio Configuration
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_VERIFY_SERVICE_SID=your-verify-service-sid
TWILIO_FROM_PHONE=+1234567890

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:9002
APP_SECRET_KEY=your-secret-key-for-pin-encryption
```

### 1.4 Database Schema
Run the following SQL in Supabase SQL Editor:

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create user roles enum
CREATE TYPE user_role AS ENUM ('admin', 'dispatcher', 'guide', 'passenger', 'rider');

-- Create user profiles table
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'passenger',
    pin_hash VARCHAR(255) NOT NULL, -- Encrypted PIN
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    last_login TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (id)
);

-- Create phone verification attempts table
CREATE TABLE public.phone_verifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    phone VARCHAR(20) NOT NULL,
    verification_sid VARCHAR(255) NOT NULL, -- Twilio verification SID
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX idx_profiles_phone ON public.profiles(phone);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_phone_verifications_phone ON public.phone_verifications(phone);
CREATE INDEX idx_phone_verifications_sid ON public.phone_verifications(verification_sid);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phone_verifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Dispatchers can view relevant profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'dispatcher')
        )
    );

-- Create RLS policies for phone verifications
CREATE POLICY "Allow insert phone verifications" ON public.phone_verifications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow select own phone verifications" ON public.phone_verifications
    FOR SELECT USING (true); -- Temporary for development

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for profiles updated_at
CREATE TRIGGER on_profiles_updated
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, phone, name, role, pin_hash)
    VALUES (
        NEW.id,
        COALESCE(NEW.phone, ''),
        COALESCE(NEW.raw_user_meta_data->>'name', 'Unknown'),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'passenger'),
        COALESCE(NEW.raw_user_meta_data->>'pin_hash', '')
    );
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

## Phase 2: Implementation Files

The following files will be created with production-ready code:

### Dependencies Already Installed
✅ @supabase/supabase-js (2.43.5)
✅ @supabase/ssr (0.6.1)  
✅ twilio (4.19.0)

### Additional Dependencies to Install
```bash
npm install bcrypt @types/bcrypt
```

### Files to Create
1. `/src/lib/supabase-client.ts` - Supabase client configuration
2. `/src/lib/supabase-auth.ts` - Authentication functions with SMS OTP
3. `/src/contexts/supabase-auth-context.tsx` - Auth context for SMS OTP flow
4. `/src/middleware/supabase-middleware.ts` - Route protection middleware
5. `/scripts/migrate-users.js` - User migration script from Firebase

## Phase 3: Security Best Practices

### 3.1 Environment Security
- Store all sensitive keys in environment variables
- Use different Twilio accounts for dev/staging/production
- Rotate API keys regularly
- Enable Supabase audit logging

### 3.2 Rate Limiting
- Implement rate limiting for SMS sending (3 attempts per 15 minutes)
- Add CAPTCHA for repeated failed attempts
- Monitor and alert on suspicious patterns

### 3.3 PIN Security
- Use bcrypt with salt rounds ≥12 for PIN hashing
- Enforce PIN complexity (no sequential numbers, birthdates)
- Implement PIN lockout after failed attempts
- Force PIN rotation every 90 days

### 3.4 Session Security
- Set appropriate JWT expiration (1 hour)
- Enable refresh token rotation
- Clear sessions on password/PIN change
- Implement device tracking

## Phase 4: Testing Procedures

### 4.1 Unit Tests
```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom

# Run tests
npm run test
```

### 4.2 Integration Tests
1. **SMS OTP Flow**
   - Send OTP to valid phone number
   - Verify OTP with correct/incorrect codes
   - Test rate limiting
   - Test expiration

2. **Authentication Flow**
   - New user registration
   - Existing user login
   - PIN validation
   - Role-based access

3. **Session Management**
   - Token refresh
   - Session expiration
   - Logout functionality

### 4.3 Security Tests
1. **SQL Injection**: Test RLS policies
2. **Rate Limiting**: Verify SMS and login limits
3. **JWT Security**: Test token validation
4. **Role Escalation**: Verify access controls

## Phase 5: Deployment Checklist

### 5.1 Pre-deployment
- [ ] All environment variables configured
- [ ] Database schema deployed
- [ ] RLS policies tested
- [ ] Twilio account configured with proper limits
- [ ] SSL certificates in place

### 5.2 Deployment
- [ ] Deploy to staging environment
- [ ] Run migration script in staging
- [ ] Perform end-to-end testing
- [ ] Deploy to production
- [ ] Run production migration during maintenance window

### 5.3 Post-deployment
- [ ] Monitor error logs
- [ ] Check SMS delivery rates
- [ ] Verify user login success rates
- [ ] Monitor database performance
- [ ] Set up alerts for critical failures

## Migration Risks and Mitigation

### High-Risk Areas
1. **User Disruption**: Implement gradual migration with rollback capability
2. **SMS Delivery**: Use Twilio's high-availability infrastructure with fallback
3. **PIN Security**: Implement secure hashing and rate limiting
4. **Session Continuity**: Maintain sessions during migration window
5. **Data Integrity**: Validate all migrated data with checksums

### Mitigation Strategies
- **Blue-Green Deployment**: Run both systems parallel during transition
- **Feature Flags**: Control rollout with feature toggles
- **Monitoring**: Real-time alerts for critical failures
- **Backup Plan**: Automated rollback procedures

## Rollback Plan

### Immediate Rollback (< 1 hour)
1. Switch DNS back to Firebase Auth endpoints
2. Restore Firebase Auth in application code
3. Notify users of temporary service restoration

### Data Recovery
1. Export user data from Supabase if needed
2. Restore Firebase user sessions
3. Sync any data created during migration

### Communication Plan
- **Internal**: Slack alerts to dev team
- **External**: SMS notifications to affected users
- **Status Page**: Real-time updates on gotryke.com/status

## Implementation Timeline

### Week 1: Setup and Configuration
- Day 1-2: Supabase project setup and database schema
- Day 3-4: Twilio configuration and testing
- Day 5: Environment setup and deployment pipeline

### Week 2: Core Implementation
- Day 1-2: Authentication functions and SMS OTP
- Day 3-4: Auth context and middleware
- Day 5: User interface updates

### Week 3: Migration and Testing
- Day 1-2: Migration script development
- Day 3-4: Staging environment testing
- Day 5: Security audit and penetration testing

### Week 4: Production Deployment
- Day 1-2: Production deployment and user migration
- Day 3-4: Monitoring and issue resolution
- Day 5: Documentation and team training

## Success Metrics

### Technical Metrics
- SMS delivery rate > 99%
- OTP verification success rate > 95%
- Authentication response time < 500ms
- Zero security incidents

### Business Metrics
- User login success rate > 98%
- Support ticket volume < 5% increase
- User retention maintained
- Zero data loss incidents

## Troubleshooting Guide

### Common Issues

1. **SMS Not Received**
   - Check Twilio account balance
   - Verify phone number format
   - Check carrier blocking
   - Review Twilio delivery logs

2. **OTP Verification Fails**
   - Check code expiration
   - Verify rate limiting isn't triggered
   - Ensure proper phone number formatting

3. **PIN Login Issues**
   - Verify PIN hashing consistency
   - Check user account status
   - Review failed attempt limits

4. **Session Problems**
   - Check JWT expiration settings
   - Verify cookie configuration
   - Review middleware logic

### Support Contacts
- **Supabase Support**: https://supabase.com/support
- **Twilio Support**: https://support.twilio.com
- **Development Team**: [Your team contact info]

## Maintenance Schedule

### Daily
- Monitor error rates and SMS delivery
- Check system performance metrics

### Weekly
- Review security logs
- Update rate limiting thresholds if needed
- Clean up expired verification records

### Monthly
- Rotate API keys
- Review user access patterns
- Update dependencies
- Audit user roles and permissions

### Quarterly
- Security audit
- Performance optimization
- Review and update documentation
- Test disaster recovery procedures

## Post-Implementation Support

### 24/7 Monitoring
- **Week 1**: Full development team on-call
- **Week 2-4**: Reduced on-call rotation
- **Month 2+**: Standard monitoring

### User Support
- Dedicated support channel for migration issues
- FAQ documentation for common problems
- Video tutorials for new authentication flow
- Multi-language support (English, Filipino)

### Performance Optimization
- Database query optimization
- SMS delivery route optimization
- CDN configuration for global users
- Caching strategy implementation

This comprehensive implementation ensures a secure, scalable, and user-friendly migration from Firebase Auth to Supabase Auth with SMS OTP verification using Twilio.