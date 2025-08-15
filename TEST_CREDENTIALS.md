# GoTryke v2.2.0 - Test Account Credentials

**Created**: August 14, 2025  
**Purpose**: Dummy accounts for testing authentication and role-based functionality  
**Login URL**: http://localhost:9002

## 🧪 How to Test

1. **Go to**: http://localhost:9002
2. **Enter phone number** (without +63 prefix)
3. **Enter 6-digit PIN** when prompted
4. **Verify role-based dashboard access**

## 👥 PASSENGER TEST ACCOUNTS

### Account 1: Maria Santos
- **Phone**: `9171234567`
- **PIN**: `123456`
- **Role**: Passenger
- **Status**: Active ✅

### Account 2: Juan Dela Cruz
- **Phone**: `9181234568`
- **PIN**: `234567`
- **Role**: Passenger
- **Status**: Active ✅

### Account 3: Ana Reyes
- **Phone**: `9191234569`
- **PIN**: `345678`
- **Role**: Passenger
- **Status**: Active ✅

## 🚗 RIDER TEST ACCOUNTS

### Account 4: Pedro Garcia
- **Phone**: `9201234570`
- **PIN**: `456789`
- **Role**: Rider
- **Status**: Active ✅

### Account 5: Roberto Mendoza
- **Phone**: `9211234571`
- **PIN**: `567890`
- **Role**: Rider
- **Status**: Active ✅

### Account 6: Carlos Villanueva
- **Phone**: `9221234572`
- **PIN**: `678901`
- **Role**: Rider
- **Status**: Active ✅

## 🎯 Test Scenarios

### Authentication Testing
- [x] **6-Digit PIN Security**: All accounts use new 6-digit PIN system
- [x] **Phone Number Login**: Test with Philippine mobile numbers
- [x] **Role Verification**: Confirm proper role assignment

### Dashboard Testing
- [ ] **Passenger Dashboard**: Login as passenger and verify dashboard access
- [ ] **Rider Dashboard**: Login as rider and verify dashboard access
- [ ] **Role-Based Routing**: Confirm users are directed to correct dashboards
- [ ] **Navigation Access**: Test sidebar navigation based on role permissions

### Functionality Testing
- [ ] **Profile Data**: Verify user profile information displays correctly
- [ ] **Role Restrictions**: Confirm users can only access their role's features
- [ ] **Session Management**: Test logout and session persistence
- [ ] **PIN Update**: Test PIN change functionality

## 📊 Database Status

✅ **All accounts verified in database**  
✅ **6-digit PINs properly stored**  
✅ **Role assignments confirmed**  
✅ **Active status enabled**

## 🔧 Technical Notes

- **Authentication Method**: SMS OTP bypassed for testing
- **PIN Format**: 6 digits (enhanced security from v2.2.0)
- **Database**: Supabase with profiles table
- **Framework**: Next.js 15.3.3 with App Router

## 🚨 Important Reminders

1. **Development Only**: These are test accounts for development environment
2. **No Real Data**: Do not use for production testing
3. **Clean Up**: Remove these accounts before production deployment
4. **Security**: PINs are simple for testing - use complex PINs in production

---

**Created for GoTryke v2.2.0 testing**  
**Last Updated**: August 14, 2025