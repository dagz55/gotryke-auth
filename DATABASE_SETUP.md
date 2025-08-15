# Database Setup for GoTryke v2.2.0

**Latest Updates**: Enhanced with 6-digit PIN security, admin settings management, and complete Supabase integration.

## Required Tables

### 1. profiles (Already exists)
This table stores user profile information and is already set up.

### 2. app_settings (New - Required)
Run this SQL in your Supabase SQL editor:

```sql
-- Create app_settings table for storing application configuration
CREATE TABLE IF NOT EXISTS app_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(50) NOT NULL UNIQUE,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on type for faster lookups
CREATE INDEX IF NOT EXISTS idx_app_settings_type ON app_settings(type);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_app_settings_updated_at 
  BEFORE UPDATE ON app_settings 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings
INSERT INTO app_settings (type, data) VALUES 
  ('map', '{"provider": "mapbox", "apiKey": ""}'),
  ('payment', '{"gateway": "paymongo", "publicKey": "", "secretKey": ""}'),
  ('surge', '{"surgeEnabled": true, "defaultMultiplier": 1.5, "rules": []}')
ON CONFLICT (type) DO NOTHING;

-- Enable RLS
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for authenticated users" ON app_settings
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable write access for service role" ON app_settings
  FOR ALL USING (auth.role() = 'service_role');
```

## Environment Variables Required

Make sure these are set in your `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Mapbox (for maps)
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token

# Twilio (for SMS)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_VERIFY_SERVICE_SID=your_verify_service_sid

# App Secret
APP_SECRET_KEY=your_secret_key_for_hashing
```

## Component Status (v2.2.0)

All components have been updated to use Supabase with latest enhancements:

- ✅ **Admin Panel** - Enhanced with reports, project planning, documentation, and settings management
- ✅ **Authentication** - Upgraded to 6-digit PIN security with improved validation
- ✅ **Dispatcher Interface** - Role-based access with live mapping integration
- ✅ **Rider Management** - Advanced data tables with filtering and management tools
- ✅ **Dashboard** - Real-time stats and metrics with responsive design
- ✅ **Middleware** - Enhanced session handling with proper role validation
- ✅ **Settings System** - Complete app_settings table for configuration management

## Next Steps

1. Run the SQL above in Supabase
2. Update your environment variables
3. Test the admin panel functionality
4. Verify user management works properly