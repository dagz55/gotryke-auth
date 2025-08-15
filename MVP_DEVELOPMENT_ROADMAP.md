# GoTryke MVP Development Roadmap
## Core Booking Flow & Communication Features

**Version**: 2.3.0 MVP  
**Timeline**: 2-3 weeks  
**Priority**: Critical for actual ride operations

---

## 🎯 Current State Analysis

### ✅ What's Already Built
- **Authentication System**: Complete 6-digit PIN system with Supabase
- **User Management**: Admin dashboard with role-based access control
- **Database Foundation**: Robust PostgreSQL schema with RLS
- **UI Components**: Comprehensive Shadcn UI component library
- **Real-time Infrastructure**: Supabase Realtime already available
- **Maps Integration**: Mapbox GL JS ready for implementation
- **Test Accounts**: 6 functional test accounts (3 passengers, 3 riders)

### ❌ Critical Missing Components
- **No booking/ride request system**
- **No real-time ride matching**
- **No location tracking**
- **No rider-passenger communication**
- **No trip status management**
- **No payment processing**

---

## 🏗️ MVP Architecture Requirements

### Database Schema Additions
**New Tables Needed:**
```sql
-- Ride requests from passengers
rides_requests (
  id, passenger_id, pickup_location, dropoff_location, 
  status, created_at, estimated_fare
)

-- Active rides
rides (
  id, request_id, rider_id, passenger_id, status, 
  start_time, end_time, actual_fare, route_data
)

-- Real-time locations
user_locations (
  user_id, latitude, longitude, updated_at, is_active
)

-- Trip communications
trip_messages (
  id, ride_id, sender_id, message, type, created_at
)
```

---

## 📋 Phase 1: Core Booking System (Week 1)

### 1.1 Database Setup
- [ ] Create ride_requests table
- [ ] Create rides table 
- [ ] Create user_locations table
- [ ] Set up RLS policies for ride data
- [ ] Create database functions for ride matching

### 1.2 Passenger Booking Interface
- [ ] **Booking Form Component**
  - Location picker with Mapbox autocomplete
  - Pickup/dropoff address selection
  - Fare estimation display
  - Request ride button
  
- [ ] **Ride Status Component**
  - Real-time status tracking
  - ETA display
  - Rider information (when matched)
  - Trip progress indicator

### 1.3 Rider Request Management
- [ ] **Available Rides List**
  - Real-time ride requests feed
  - Distance/proximity filtering
  - Accept/decline functionality
  - Fare information display

- [ ] **Active Ride Dashboard**
  - Current ride details
  - Navigation integration
  - Passenger contact info
  - Status update controls

### 1.4 Basic API Endpoints
```typescript
// /api/rides/request - Create ride request
// /api/rides/accept - Rider accepts request
// /api/rides/status - Update ride status
// /api/rides/location - Update location
```

---

## 📋 Phase 2: Real-time Communication (Week 2)

### 2.1 Location Tracking System
- [ ] **Real-time Location Updates**
  - Background location service for riders
  - Live location sharing during rides
  - Location history for completed trips
  - Privacy controls for off-duty riders

### 2.2 Ride Matching Engine
- [ ] **Automated Matching Logic**
  - Distance-based rider selection
  - Availability status checking
  - Queue management for multiple requests
  - Fallback to manual dispatch

### 2.3 Live Communication Features
- [ ] **Trip Chat System**
  - In-ride messaging between passenger/rider
  - Predefined quick messages
  - Emergency contact integration
  - Message history per trip

### 2.4 Real-time Status Updates
- [ ] **Supabase Realtime Integration**
  - Live ride status broadcasting
  - Location updates streaming
  - Notification system setup
  - Connection state management

---

## 📋 Phase 3: Essential Trip Management (Week 3)

### 3.1 Trip Lifecycle Management
- [ ] **Status Flow Implementation**
  ```
  requested → matched → pickup → in_progress → completed
  ```
- [ ] **Cancellation Handling**
- [ ] **No-show Management**
- [ ] **Emergency Procedures**

### 3.2 Basic Payment Integration
- [ ] **Fare Calculation**
  - Distance-based pricing
  - Time-based surcharges
  - Basic surge pricing
  - Payment method selection

### 3.3 Dispatcher Override System
- [ ] **Manual Dispatch Interface**
  - View unmatched requests
  - Manually assign riders
  - Monitor active rides
  - Emergency intervention tools

---

## 🛠️ Technical Implementation Details

### Real-time Architecture
```typescript
// Supabase Realtime channels for:
- `ride_requests:*` - New ride requests
- `rides:rider_id=X` - Rider-specific updates
- `user_locations:*` - Live location tracking
- `trip_messages:ride_id=X` - In-trip communication
```

### Core React Hooks
```typescript
// Custom hooks needed:
useRideRequests() // Subscribe to available rides
useActiveRide() // Track current ride status
useLocationTracking() // Manage location updates
useTripChat() // Handle in-ride messaging
```

### API Route Structure
```
/api/rides/
├── request/route.ts     # POST - Create ride request
├── accept/route.ts      # POST - Accept ride request
├── status/route.ts      # PATCH - Update ride status
├── location/route.ts    # POST - Update user location
├── cancel/route.ts      # POST - Cancel ride
└── messages/route.ts    # GET/POST - Trip messages
```

---

## 🚀 Implementation Strategy

### Week 1 Focus: Basic Booking
1. **Start with passenger side** - booking form and status display
2. **Add rider acceptance** - simple list view with accept buttons
3. **Basic status tracking** - manual status updates
4. **Test with dummy data** before real-time implementation

### Week 2 Focus: Real-time Features  
1. **Implement location tracking** for riders
2. **Add Supabase Realtime** subscriptions
3. **Build ride matching** logic
4. **Create communication** channels

### Week 3 Focus: Polish & Integration
1. **Complete trip lifecycle** management
2. **Add dispatcher tools** for oversight
3. **Implement basic payments** calculation
4. **Comprehensive testing** with real scenarios

---

## 🧪 Testing Strategy

### Manual Testing Scenarios
Using the existing test accounts:
- **Passenger books ride** → **Rider accepts** → **Complete trip**
- **Multiple riders** competing for same request
- **Location tracking** during active ride
- **Communication** between passenger/rider
- **Cancellation** scenarios
- **Dispatcher intervention** when needed

### Success Metrics
- [ ] Passenger can book a ride in <30 seconds
- [ ] Rider receives request within 5 seconds
- [ ] Location updates every 5-10 seconds during trips
- [ ] Messages delivered in real-time
- [ ] Complete trip lifecycle works end-to-end

---

## 📊 MVP Success Criteria

**Core Functionality:**
1. ✅ Passenger can request a ride with pickup/dropoff
2. ✅ Available riders receive real-time notifications
3. ✅ Rider can accept/decline ride requests
4. ✅ Live location tracking during trips
5. ✅ Basic in-trip communication
6. ✅ Trip status management (pickup → dropoff → complete)
7. ✅ Dispatcher can monitor and intervene

**Technical Requirements:**
- Real-time updates <5 second latency
- 99% uptime for booking system
- Location accuracy within 10 meters
- Support for 10+ concurrent rides

---

## 🔄 Post-MVP Enhancements (v2.4.0)

**Advanced Features for Later:**
- Payment gateway integration (PayMongo)
- Advanced surge pricing algorithms
- Route optimization
- Rider ratings system
- Trip history and analytics
- Push notifications
- Mobile app development

---

## 🎯 Next Steps

1. **Create database migrations** for new tables
2. **Set up Supabase Realtime** configuration
3. **Build passenger booking interface** first
4. **Test with existing test accounts**
5. **Iterate rapidly** with user feedback

**This roadmap prioritizes getting actual ride operations working over advanced features, ensuring a functional transportation platform that can serve real users.**