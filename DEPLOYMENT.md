# GoTryke Production Deployment Guide - Supabase Auth Migration

## Pre-Deployment Checklist

### 1. Supabase Project Setup

#### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create new project
2. Choose region (preferably Singapore for Philippines users)
3. Set strong database password and note it down
4. Wait for project initialization (2-3 minutes)

#### 1.2 Configure Authentication
1. Go to Authentication → Settings in Supabase dashboard
2. Enable "Email auth" (required for phone auth workflow)
3. Disable email confirmations (we use SMS OTP only)
4. Set JWT expiry to 3600 (1 hour)
5. Enable "Refresh token rotation"

### 2. Environment Configuration

#### Required Environment Variables (Supabase Migration)
Create `.env.production` with the following configuration:

```bash
# Supabase Configuration (Primary)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-from-dashboard
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-from-dashboard

# SMS Providers (Required)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_VERIFY_SERVICE_SID=VAxxxxxxxxxxxxxxxxx
TWILIO_FROM_PHONE=+1234567890
SEMAPHORE_API_KEY=your-semaphore-api-key
SEMAPHORE_SENDER_NAME=GoTryke

# SMS Provider Selection
SMS_PROVIDER=semaphore  # Use 'semaphore' for Philippines, 'twilio' for international
USE_REAL_SMS=true

# Security Keys (Critical)
APP_SECRET_KEY=your-32-byte-secret-for-pin-encryption
JWT_SECRET_KEY=your-jwt-secret-for-sessions

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
NODE_ENV=production

# Legacy Firebase (for migration only)
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-legacy-firebase-project
FIREBASE_ADMIN_SERVICE_ACCOUNT=path-to-service-account.json

# Maps
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your-production-mapbox-token
```

**Critical Configuration Items:**
- [ ] Generate new secrets: `openssl rand -base64 64` for both APP_SECRET_KEY and JWT_SECRET_KEY
- [ ] Set up production Supabase project with proper region
- [ ] Configure SMS accounts (Semaphore for PH, Twilio for international)
- [ ] Set proper CORS origins in Supabase dashboard
- [ ] Configure monitoring and alerting in Supabase

#### Security Considerations
- [ ] All secrets are unique and secure (not development values)
- [ ] APP_SECRET_KEY and JWT_SECRET_KEY are cryptographically secure (64+ characters)
- [ ] Supabase RLS policies are properly configured
- [ ] SMS provider accounts have proper rate limits configured
- [ ] SSL/TLS certificates are valid
- [ ] Security headers are enabled
- [ ] Database connection uses SSL (enabled by default in Supabase)

### 3. Database Setup (PostgreSQL + Supabase)

#### 3.1 Run Database Schema
Execute the complete schema from `Auth-PM.md` in Supabase SQL Editor:

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create user roles enum
CREATE TYPE user_role AS ENUM ('admin', 'dispatcher', 'guide', 'passenger', 'rider');

-- Create user profiles table with RLS
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'passenger',
    pin_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    last_login TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies (see Auth-PM.md for complete policies)
```

#### 3.2 Database Indexes
Create the following indexes in Supabase SQL Editor:

```sql
-- Essential indexes for performance
CREATE INDEX idx_profiles_phone ON public.profiles(phone);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_active ON public.profiles(is_active);
CREATE INDEX idx_phone_verifications_phone ON public.phone_verifications(phone);
CREATE INDEX idx_phone_verifications_expires ON public.phone_verifications(expires_at);
CREATE INDEX idx_security_logs_timestamp ON public.security_logs(timestamp DESC);
CREATE INDEX idx_rate_limits_identifier ON public.rate_limits(identifier, window_start);
```

#### 3.3 Test Database Connection
```bash
# Test connection with service role key
curl -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
     -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
     "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/profiles?select=count"
```

### 4. SMS Configuration

#### 4.1 Semaphore SMS Setup (Philippines)
1. Create production account at [semaphore.co](https://semaphore.co)
2. Add credits (minimum 100 PHP recommended)
3. Get production API key from dashboard
4. Register "GoTryke" as sender name (optional but recommended)
5. Test SMS delivery: 
```bash
curl -X POST https://semaphore.co/api/v4/messages \
-H "Authorization: your-production-api-key" \
-H "Content-Type: application/json" \
-d '{
  "message": "Your GoTryke verification code is: 123456",
  "number": "09171841002",
  "sender_name": "GoTryke"
}'
```

#### 4.2 Twilio Setup (International Fallback)
1. Upgrade Twilio account to paid tier
2. Purchase a phone number for SMS sending
3. Configure Verify Service in Twilio Console
4. Test international SMS delivery

#### 4.3 SMS Provider Testing
```bash
# Test both providers before deployment
npm run dev
# Then test SMS endpoints with real phone numbers
curl -X POST http://localhost:9002/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"9171841002","name":"Test User","role":"passenger"}'
```

### 5. Security Hardening

#### SSL/TLS Configuration
- [ ] Valid SSL certificate installed
- [ ] HTTPS redirect enabled
- [ ] HSTS headers configured
- [ ] Certificate auto-renewal set up

#### Rate Limiting
Production rate limits are configured as:
- **Sign-in attempts**: 5 attempts per 15 minutes, 1-hour block
- **OTP requests**: 3 attempts per 10 minutes, 30-minute block  
- **PIN reset**: 3 attempts per hour, 2-hour block

#### Session Security
- [ ] Secure session cookies (httpOnly, secure, sameSite)
- [ ] Session timeout properly configured
- [ ] Concurrent session limits enforced

### 6. Monitoring and Alerting

#### Health Checks
Set up monitoring for:
- [ ] Application uptime
- [ ] Authentication endpoint response times
- [ ] Database connection health
- [ ] SMS service availability

#### Security Monitoring
- [ ] Failed authentication attempts
- [ ] Rate limit violations
- [ ] Suspicious activity patterns
- [ ] System configuration errors

#### Log Management
- [ ] Centralized logging configured
- [ ] Log retention policies set
- [ ] Sensitive data sanitized in logs

### 7. User Migration from Firebase

#### 7.1 Pre-migration Preparation
```bash
# Backup Firebase users (run this script)
node scripts/backup-firebase-users.js

# Verify Supabase setup
node scripts/verify-supabase-setup.js

# Run migration in dry-run mode
node scripts/migrate-users.js --dry-run
```

#### 7.2 Execute Migration
```bash
# Run actual migration (monitor closely)
node scripts/migrate-users.js --production

# Verify migration results
node scripts/verify-migration.js
```

## Deployment Steps

### 1. Build and Test (Updated for Supabase)

```bash
# Install dependencies (including Supabase)
npm ci

# Install additional Supabase dependencies if not in package.json
npm install @supabase/supabase-js @supabase/ssr bcrypt @types/bcrypt jose

# Run type checking
npm run typecheck

# Run linting
npm run lint

# Test Supabase connection
node -e "console.log('Testing Supabase:', process.env.NEXT_PUBLIC_SUPABASE_URL)"

# Build for production
npm run build

# Test the build
npm start
```

### 2. Deploy to Production

#### Using Vercel (Recommended for Supabase)
```bash
# Deploy to Vercel
vercel --prod

# Set Supabase environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production

# Set SMS environment variables
vercel env add SMS_PROVIDER production
vercel env add SEMAPHORE_API_KEY production
vercel env add TWILIO_ACCOUNT_SID production
vercel env add TWILIO_AUTH_TOKEN production

# Set security keys
vercel env add APP_SECRET_KEY production
vercel env add JWT_SECRET_KEY production

# Set app configuration
vercel env add NEXT_PUBLIC_APP_URL production
vercel env add USE_REAL_SMS production
```

#### Using Docker
```bash
# Build Docker image
docker build -t gotryke-auth:latest .

# Run with environment file
docker run -d \
  --name gotryke-auth \
  --env-file .env.production \
  -p 3000:3000 \
  gotryke-auth:latest
```

#### Using PM2 (Node.js)
```bash
# Start with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup
```

### 3. Post-Deployment Verification

#### Authentication Flow Testing (Supabase)
- [ ] SMS OTP delivery functional (test with real Philippine numbers)
- [ ] OTP verification creates Supabase user correctly
- [ ] PIN creation and validation works
- [ ] Sign-in with phone + PIN works
- [ ] PIN reset flow with SMS verification functional
- [ ] Rate limiting is active (test by exceeding limits)
- [ ] Supabase session management working
- [ ] RLS policies enforced (test unauthorized access)
- [ ] User migration from Firebase completed successfully

#### Security Testing (Supabase + SMS)
- [ ] HTTPS redirects working
- [ ] Security headers present
- [ ] SMS rate limiting blocks excessive requests (3/15min)
- [ ] Login rate limiting blocks brute force (5/15min)
- [ ] Invalid Supabase tokens properly rejected
- [ ] RLS policies prevent unauthorized data access
- [ ] PIN hashing working with bcrypt (12+ salt rounds)
- [ ] CORS policy enforced in Supabase
- [ ] Emergency lockdown procedure working

#### Performance Testing (PostgreSQL + Supabase)
- [ ] SMS delivery response times < 5 seconds
- [ ] Database queries optimized with proper indexes
- [ ] Supabase connection pooling working
- [ ] RLS policy performance acceptable
- [ ] Static assets properly cached
- [ ] CDN configuration working
- [ ] Phone number lookup performance < 500ms

### 4. Maintenance Tasks

#### Daily Tasks
- [ ] Monitor security logs for anomalies
- [ ] Check system health metrics
- [ ] Review error rates and alerts

#### Weekly Tasks  
- [ ] Clean up expired sessions and rate limits
- [ ] Review security statistics
- [ ] Update dependencies if needed

#### Monthly Tasks
- [ ] Security audit of authentication flows
- [ ] Performance optimization review
- [ ] Backup and disaster recovery testing

## Rollback Plan (Supabase Migration)

### Emergency Rollback to Firebase
If critical Supabase issues are detected:

1. **Immediate Response**
   ```bash
   # Switch environment to Firebase fallback
   vercel env add USE_SUPABASE false production
   vercel env add USE_FIREBASE true production
   
   # Redeploy with Firebase fallback
   vercel --prod
   ```

2. **Database Rollback**
   - Restore Firebase Auth if needed
   - Revert users to Firebase from backup
   - Switch authentication endpoints back to Firebase
   - Restore Firestore security rules

3. **Communication**
   - Notify users of temporary service interruption
   - Update status page
   - Investigate and document issues

### Incident Response (Supabase)
For security incidents:
1. Execute emergency lockdown via admin endpoint
2. Revoke all active Supabase sessions
3. Temporarily disable SMS sending to prevent abuse
4. Review PostgreSQL security logs for breach indicators
5. Check SMS delivery logs for suspicious patterns
6. Contact Supabase support and SMS provider support
7. Prepare incident report with database audit trail

## Performance Optimization

### CDN Configuration
Static assets should be served via CDN:
- [ ] Images optimized and cached
- [ ] JavaScript/CSS bundled and minified
- [ ] Cache headers properly configured

### Database Optimization (PostgreSQL)
- [ ] PostgreSQL indexes created for phone lookups
- [ ] RLS policies optimized for performance
- [ ] Supabase connection pooling configured
- [ ] Query patterns optimized for phone auth
- [ ] Automated backup strategy via Supabase
- [ ] Audit log retention policies configured

## Compliance and Security (Enhanced for SMS Auth)

### Data Privacy
- [ ] User data encryption at rest and in transit (Supabase default)
- [ ] Phone number PII handling compliance
- [ ] SMS content does not contain sensitive data
- [ ] Data retention policies implemented in PostgreSQL
- [ ] User data deletion procedures (GDPR compliance)
- [ ] SMS provider data handling agreements reviewed

### Audit Requirements (PostgreSQL + SMS)
- [ ] Security event logging enabled in PostgreSQL
- [ ] SMS delivery logs maintained for compliance
- [ ] Access logs maintained with RLS audit trail
- [ ] User migration audit trail documented
- [ ] Change management documented
- [ ] Regular security assessments scheduled
- [ ] Phone number verification audit logs

## Support and Maintenance

### Documentation (Updated for Supabase)
- [ ] Supabase API documentation updated
- [ ] SMS integration procedures documented
- [ ] RLS security procedures documented
- [ ] User migration procedures documented
- [ ] Incident response plan updated for Supabase
- [ ] Team training on Supabase auth completed
- [ ] Emergency rollback procedures tested

### Backup and Recovery (Supabase + Migration)
- [ ] Automated daily Supabase backups
- [ ] Firebase backup maintained during transition
- [ ] User migration backup created and tested
- [ ] PostgreSQL backup restoration tested
- [ ] SMS delivery history backup
- [ ] Disaster recovery plan documented
- [ ] RTO/RPO targets defined (< 4 hours recovery)

---

## Emergency Contacts

- **Technical Lead**: [contact information]
- **Security Team**: [contact information]  
- **Infrastructure Team**: [contact information]
- **On-call Support**: [contact information]

## Additional Resources

### Supabase Resources
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)

### SMS Provider Resources
- [Semaphore SMS API Documentation](https://semaphore.co/docs)
- [Twilio Verify API Documentation](https://www.twilio.com/docs/verify/api)
- [Philippines SMS Regulations](https://ntc.gov.ph/)

### Security & Deployment
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Security Best Practices](https://owasp.org/www-project-top-ten/)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/security.html)
- [bcrypt Security Guide](https://github.com/kelektiv/node.bcrypt.js#security-issues-and-concerns)