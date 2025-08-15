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