"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth-context";
import { 
  MapPin, 
  Clock, 
  User, 
  Phone, 
  DollarSign, 
  Navigation,
  CheckCircle,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Car,
  Battery,
  Signal
} from "lucide-react";
import { LocationTracker } from "./components/location-tracker";
import { RideCommunication } from "./components/ride-communication";

interface RideRequest {
  id: string;
  passenger_name: string;
  pickup_location: string;
  destination: string;
  distance: string;
  estimated_fare: number;
  created_at: string;
  urgency: 'normal' | 'urgent';
}

interface TripStatus {
  id: string;
  status: 'waiting' | 'en_route' | 'arrived' | 'in_progress' | 'completed';
  passenger_name: string;
  pickup_location: string;
  destination: string;
  fare: number;
  start_time: string;
}

export default function TriderDashboard() {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [currentTrip, setCurrentTrip] = useState<TripStatus | null>(null);
  const [rideRequests, setRideRequests] = useState<RideRequest[]>([]);
  const [earnings, setEarnings] = useState({ today: 850, week: 4200, month: 18500 });
  const [stats, setStats] = useState({ 
    tripsToday: 12, 
    rating: 4.8, 
    completionRate: 96,
    batteryLevel: 85,
    signalStrength: 4
  });

  // Mock data for demonstration
  useEffect(() => {
    if (isOnline) {
      const mockRequests: RideRequest[] = [
        {
          id: "req_1",
          passenger_name: "Maria Santos",
          pickup_location: "SM City Baguio",
          destination: "Session Road",
          distance: "2.3 km",
          estimated_fare: 45,
          created_at: new Date().toISOString(),
          urgency: 'normal'
        },
        {
          id: "req_2", 
          passenger_name: "John Dela Cruz",
          pickup_location: "Burnham Park",
          destination: "University of Baguio",
          distance: "1.8 km",
          estimated_fare: 35,
          created_at: new Date(Date.now() - 2 * 60000).toISOString(),
          urgency: 'urgent'
        }
      ];
      setRideRequests(mockRequests);
    } else {
      setRideRequests([]);
    }
  }, [isOnline]);

  const acceptRide = (requestId: string) => {
    const request = rideRequests.find(r => r.id === requestId);
    if (request) {
      setCurrentTrip({
        id: request.id,
        status: 'waiting',
        passenger_name: request.passenger_name,
        pickup_location: request.pickup_location,
        destination: request.destination,
        fare: request.estimated_fare,
        start_time: new Date().toISOString()
      });
      setRideRequests(prev => prev.filter(r => r.id !== requestId));
    }
  };

  const updateTripStatus = (newStatus: TripStatus['status']) => {
    if (currentTrip) {
      setCurrentTrip({ ...currentTrip, status: newStatus });
      
      if (newStatus === 'completed') {
        setEarnings(prev => ({
          ...prev,
          today: prev.today + currentTrip.fare
        }));
        setStats(prev => ({
          ...prev,
          tripsToday: prev.tripsToday + 1
        }));
        setCurrentTrip(null);
      }
    }
  };

  const getStatusColor = (status: TripStatus['status']) => {
    switch (status) {
      case 'waiting': return 'bg-yellow-500';
      case 'en_route': return 'bg-blue-500';
      case 'arrived': return 'bg-green-500';
      case 'in_progress': return 'bg-purple-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: TripStatus['status']) => {
    switch (status) {
      case 'waiting': return 'Going to Pickup';
      case 'en_route': return 'En Route to Pickup';
      case 'arrived': return 'Arrived at Pickup';
      case 'in_progress': return 'Trip in Progress';
      case 'completed': return 'Trip Completed';
      default: return 'Unknown';
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Trider Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back, {user?.user_metadata?.full_name || 'Trider'}!
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Signal & Battery Status */}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Signal className="h-4 w-4" />
            <span>{stats.signalStrength}/5</span>
            <Battery className="h-4 w-4" />
            <span>{stats.batteryLevel}%</span>
          </div>
          
          {/* Online/Offline Toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Offline</span>
            <Switch 
              checked={isOnline} 
              onCheckedChange={setIsOnline}
              disabled={!!currentTrip}
            />
            <span className="text-sm font-medium">Online</span>
          </div>
          
          <Badge variant={isOnline ? "default" : "secondary"} className="px-3 py-1">
            {isOnline ? "🟢 Available" : "🔴 Offline"}
          </Badge>
        </div>
      </div>

      {/* Current Trip Status */}
      {currentTrip && (
        <Card className="border-2 border-primary">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Current Trip</CardTitle>
              <Badge className={`${getStatusColor(currentTrip.status)} text-white`}>
                {getStatusText(currentTrip.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{currentTrip.passenger_name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{currentTrip.pickup_location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Navigation className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{currentTrip.destination}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">₱{currentTrip.fare}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Started: {new Date(currentTrip.start_time).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Trip Action Buttons */}
            <div className="flex space-x-2 pt-2">
              {currentTrip.status === 'waiting' && (
                <Button onClick={() => updateTripStatus('arrived')} className="flex-1">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Arrived at Pickup
                </Button>
              )}
              {currentTrip.status === 'arrived' && (
                <Button onClick={() => updateTripStatus('in_progress')} className="flex-1">
                  <Car className="h-4 w-4 mr-2" />
                  Start Trip
                </Button>
              )}
              {currentTrip.status === 'in_progress' && (
                <Button onClick={() => updateTripStatus('completed')} className="flex-1">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Trip
                </Button>
              )}
              <Button variant="outline" size="sm">
                <Phone className="h-4 w-4 mr-2" />
                Call
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Location Tracker */}
      <LocationTracker 
        isOnline={isOnline} 
        onLocationUpdate={(location) => console.log('Location updated:', location)}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₱{earnings.today}</div>
            <p className="text-xs text-muted-foreground">
              {stats.tripsToday} trips completed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rating}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completionRate}% completion rate
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₱{earnings.week}</div>
            <p className="text-xs text-muted-foreground">
              42 trips this week
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₱{earnings.month}</div>
            <p className="text-xs text-muted-foreground">
              168 trips this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Communication Panel - Show during active trip */}
      {currentTrip && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RideCommunication
            passengerName={currentTrip.passenger_name}
            tripId={currentTrip.id}
            onSendMessage={(message) => console.log('Message sent:', message)}
            onCall={() => console.log('Calling passenger...')}
          />
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Trip Navigation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full" variant="outline">
                    <Navigation className="h-4 w-4 mr-2" />
                    Open in Maps
                  </Button>
                  <Button className="w-full" variant="outline">
                    <MapPin className="h-4 w-4 mr-2" />
                    Share My Location
                  </Button>
                  <Button className="w-full" variant="outline">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Report Issue
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Ride Requests */}
      {isOnline && !currentTrip && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Available Ride Requests</span>
              {rideRequests.length > 0 && (
                <Badge variant="secondary">{rideRequests.length}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rideRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Car className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No ride requests available</p>
                <p className="text-sm">Stay online to receive new requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {rideRequests.map((request) => (
                  <Card key={request.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {request.passenger_name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{request.passenger_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(request.created_at).toLocaleTimeString()} ago
                              </p>
                            </div>
                            {request.urgency === 'urgent' && (
                              <Badge variant="destructive" className="text-xs">URGENT</Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-green-600" />
                              <span>{request.pickup_location}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Navigation className="h-4 w-4 text-red-600" />
                              <span>{request.destination}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="text-muted-foreground">{request.distance}</span>
                            <span className="font-medium text-green-600">₱{request.estimated_fare}</span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2 ml-4">
                          <Button 
                            size="sm" 
                            onClick={() => acceptRide(request.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                          <Button variant="outline" size="sm">
                            <XCircle className="h-4 w-4 mr-1" />
                            Decline
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Offline Message */}
      {!isOnline && !currentTrip && (
        <Card className="border-dashed">
          <CardContent className="text-center py-12">
            <Car className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">You&apos;re Currently Offline</h3>
            <p className="text-muted-foreground mb-4">
              Toggle the switch above to go online and start receiving ride requests
            </p>
            <Button onClick={() => setIsOnline(true)} disabled={!!currentTrip}>
              Go Online
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}