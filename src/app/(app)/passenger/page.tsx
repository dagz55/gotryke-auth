"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  MapPin, 
  Search, 
  Clock, 
  Star, 
  Phone, 
  MessageSquare, 
  CreditCard, 
  History, 
  Settings,
  Navigation,
  Users,
  Car,
  Timer,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Mock data for MVP demonstration
const mockRides = [
  {
    id: "RIDE-001",
    date: "2025-01-14",
    time: "08:30 AM",
    from: "SM City Cebu",
    to: "IT Park",
    rider: "Juan Santos",
    fare: "₱45.00",
    status: "completed",
    rating: 5
  },
  {
    id: "RIDE-002", 
    date: "2025-01-13",
    time: "06:15 PM",
    from: "Ayala Center",
    to: "Lahug",
    rider: "Maria Garcia",
    fare: "₱38.00",
    status: "completed",
    rating: 4
  },
  {
    id: "RIDE-003",
    date: "2025-01-12", 
    time: "02:45 PM",
    from: "University of Cebu",
    to: "Colon Street",
    rider: "Pedro Reyes",
    fare: "₱25.00",
    status: "cancelled",
    rating: null
  }
]

const mockAvailableRiders = [
  {
    id: "RIDER-001",
    name: "Juan Santos",
    rating: 4.8,
    distance: "0.2 km",
    eta: "3 mins",
    vehicleType: "Motorcycle",
    licensePlate: "ABC-123"
  },
  {
    id: "RIDER-002",
    name: "Maria Garcia", 
    rating: 4.9,
    distance: "0.5 km",
    eta: "5 mins",
    vehicleType: "Tricycle",
    licensePlate: "XYZ-789"
  },
  {
    id: "RIDER-003",
    name: "Pedro Reyes",
    rating: 4.7,
    distance: "0.8 km", 
    eta: "7 mins",
    vehicleType: "Motorcycle",
    licensePlate: "DEF-456"
  }
]

export default function PassengerPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = React.useState("book-ride")
  const [pickupLocation, setPickupLocation] = React.useState("")
  const [destination, setDestination] = React.useState("")
  const [selectedRider, setSelectedRider] = React.useState<string | null>(null)
  const [bookingStep, setBookingStep] = React.useState(1)

  const handleBookRide = () => {
    if (!pickupLocation || !destination) {
      toast({
        title: "Missing Information",
        description: "Please enter both pickup and destination locations.",
        variant: "destructive"
      })
      return
    }
    setBookingStep(2)
  }

  const handleSelectRider = (riderId: string) => {
    setSelectedRider(riderId)
    setBookingStep(3)
    toast({
      title: "Ride Booked!",
      description: "Your ride has been booked successfully. The rider will contact you shortly.",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>
      case "cancelled":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>
      case "ongoing":
        return <Badge variant="secondary"><Timer className="w-3 h-3 mr-1" />Ongoing</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Passenger Dashboard</h2>
          <p className="text-muted-foreground">
            Book rides, track your trips, and manage your transportation needs.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="book-ride">
            <Car className="w-4 h-4 mr-2" />
            Book Ride
          </TabsTrigger>
          <TabsTrigger value="ride-history">
            <History className="w-4 h-4 mr-2" />
            Ride History
          </TabsTrigger>
          <TabsTrigger value="profile">
            <Settings className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="payment">
            <CreditCard className="w-4 h-4 mr-2" />
            Payment
          </TabsTrigger>
        </TabsList>

        <TabsContent value="book-ride" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="w-5 h-5" />
                Book a Ride
              </CardTitle>
              <CardDescription>
                Enter your pickup and destination to find available riders.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {bookingStep === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pickup">Pickup Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="pickup"
                        placeholder="Enter pickup location"
                        value={pickupLocation}
                        onChange={(e) => setPickupLocation(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="destination">Destination</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="destination"
                        placeholder="Where are you going?"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <Button onClick={handleBookRide} className="w-full" size="lg">
                    <Search className="w-4 h-4 mr-2" />
                    Find Available Riders
                  </Button>
                </div>
              )}

              {bookingStep === 2 && (
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Trip Details</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-green-500" />
                        <span><strong>From:</strong> {pickupLocation}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-red-500" />
                        <span><strong>To:</strong> {destination}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Available Riders
                    </h3>
                    {mockAvailableRiders.map((rider) => (
                      <Card key={rider.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${rider.name}`} />
                                <AvatarFallback>{rider.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{rider.name}</p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                  <span>{rider.rating}</span>
                                  <span>•</span>
                                  <span>{rider.vehicleType}</span>
                                  <span>•</span>
                                  <span>{rider.licensePlate}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                                <Clock className="w-3 h-3" />
                                <span>{rider.eta}</span>
                              </div>
                              <Button onClick={() => handleSelectRider(rider.id)} size="sm">
                                Select Rider
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Button 
                    variant="outline" 
                    onClick={() => setBookingStep(1)}
                    className="w-full"
                  >
                    Back to Location Entry
                  </Button>
                </div>
              )}

              {bookingStep === 3 && selectedRider && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700 mb-2">
                      <CheckCircle className="w-5 h-5" />
                      <h3 className="font-semibold">Ride Booked Successfully!</h3>
                    </div>
                    <p className="text-sm text-green-600">
                      Your rider will contact you shortly. Please wait at the pickup location.
                    </p>
                  </div>

                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-3">Ride Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Pickup:</span>
                          <span className="font-medium">{pickupLocation}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Destination:</span>
                          <span className="font-medium">{destination}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Rider:</span>
                          <span className="font-medium">
                            {mockAvailableRiders.find(r => r.id === selectedRider)?.name}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>ETA:</span>
                          <span className="font-medium">
                            {mockAvailableRiders.find(r => r.id === selectedRider)?.eta}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      <Phone className="w-4 h-4 mr-2" />
                      Call Rider
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                  </div>

                  <Button 
                    variant="secondary" 
                    onClick={() => {
                      setBookingStep(1)
                      setSelectedRider(null)
                      setPickupLocation("")
                      setDestination("")
                    }}
                    className="w-full"
                  >
                    Book Another Ride
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ride-history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Recent Rides
              </CardTitle>
              <CardDescription>
                View your past rides and trip history.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRides.map((ride) => (
                  <Card key={ride.id} className="border-l-4 border-l-primary">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{ride.id}</span>
                          {getStatusBadge(ride.status)}
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <div>{ride.date}</div>
                          <div>{ride.time}</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-green-500" />
                          <span><strong>From:</strong> {ride.from}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-red-500" />
                          <span><strong>To:</strong> {ride.to}</span>
                        </div>
                      </div>

                      <Separator className="my-3" />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${ride.rider}`} />
                            <AvatarFallback>{ride.rider.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{ride.rider}</p>
                            {ride.rating && (
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-3 h-3 ${i < ride.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-lg">{ride.fare}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Profile Settings
              </CardTitle>
              <CardDescription>
                Manage your profile information and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=passenger" />
                  <AvatarFallback>PA</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">Passenger User</h3>
                  <p className="text-muted-foreground">Member since January 2025</p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" defaultValue="Passenger User" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" defaultValue="+63 917 123 4567" />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" defaultValue="passenger@gotrykeph.com" />
                </div>
                <div>
                  <Label htmlFor="address">Home Address</Label>
                  <Textarea id="address" defaultValue="123 Main Street, Cebu City, Philippines" />
                </div>
              </div>

              <Button className="w-full">Update Profile</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Methods
              </CardTitle>
              <CardDescription>
                Manage your payment options and billing information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Cash Payment</span>
                  <Badge variant="default">Default</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Pay your rider directly with cash
                </p>
              </div>

              <Card className="border-dashed">
                <CardContent className="p-4 text-center">
                  <CreditCard className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-3">
                    Add a credit card or digital wallet for cashless payments
                  </p>
                  <Button variant="outline">Add Payment Method</Button>
                </CardContent>
              </Card>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Payment History
                </h4>
                <div className="space-y-2 text-sm">
                  {mockRides.filter(ride => ride.status === 'completed').map((ride) => (
                    <div key={ride.id} className="flex justify-between py-2 border-b">
                      <div>
                        <span className="font-medium">{ride.id}</span>
                        <div className="text-muted-foreground">{ride.date} - {ride.from} to {ride.to}</div>
                      </div>
                      <span className="font-semibold">{ride.fare}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}