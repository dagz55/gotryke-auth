
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, CreditCard, Activity, HeartPulse, Car, BarChart, TrendingUp, TrendingDown, DollarSign, Clock, MapPin, Star } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";

function CountingNumber({ value, prefix = "", suffix = "", duration = 2000 }: { 
    value: number, 
    prefix?: string, 
    suffix?: string,
    duration?: number 
}) {
    const [displayValue, setDisplayValue] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        let startValue = 0;
        const increment = value / (duration / 50);
        
        const timer = setInterval(() => {
            startValue += increment;
            if (startValue >= value) {
                setDisplayValue(value);
                clearInterval(timer);
                
                intervalRef.current = setInterval(() => {
                    const shouldIncrement = Math.random() > 0.3;
                    if (shouldIncrement) {
                        setDisplayValue(prev => {
                            const change = Math.floor(Math.random() * 5) + 1;
                            return prev + change;
                        });
                    }
                }, Math.random() * 2000 + 1000);
            } else {
                setDisplayValue(Math.floor(startValue));
            }
        }, 50);

        return () => {
            clearInterval(timer);
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [value, duration]);

    return <span>{prefix}{displayValue.toLocaleString()}{suffix}</span>;
}

function LiveStats() {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Peak Hours</span>
                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span className="font-medium animate-pulse">8-10 AM, 5-7 PM</span>
                </div>
            </div>
            <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Top Route</span>
                <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-green-500" />
                    <span className="font-medium animate-bounce">Downtown ↔ Airport</span>
                </div>
            </div>
            <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg Rating</span>
                <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500 animate-spin" style={{ animationDuration: '3s' }} />
                    <span className="font-medium">4.8/5.0</span>
                </div>
            </div>
            <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Response Time</span>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium text-green-500">2.3 min avg</span>
                </div>
            </div>
        </div>
    )
}

function TopRiders() {
    const topRiders = [
      { name: "John D.", rides: 128, hours: 210 },
      { name: "Jane S.", rides: 112, hours: 195 },
      { name: "Alex R.", rides: 98, hours: 180 },
      { name: "Sarah W.", rides: 95, hours: 175 },
      { name: "Michael B.", rides: 92, hours: 170 },
      { name: "Emily C.", rides: 88, hours: 165 },
      { name: "David L.", rides: 85, hours: 160 },
      { name: "Jessica M.", rides: 82, hours: 155 },
      { name: "Chris P.", rides: 79, hours: 150 },
      { name: "Olivia G.", rides: 76, hours: 145 },
    ];

    return (
        <div className="space-y-4">
            {topRiders.map((rider, index) => (
                <div key={index} className="flex items-center gap-4">
                    <span className="font-bold text-lg">{index + 1}</span>
                    <div className="flex items-center gap-2">
                        <Image 
                            src={`https://i.pravatar.cc/40?u=${rider.name}`} 
                            alt={rider.name} 
                            width={40} 
                            height={40} 
                            className="w-10 h-10 rounded-full" 
                            placeholder="blur"
                            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAoACgDASIAAhEBAxEB/8QAGwAAAQUBAQAAAAAAAAAAAAAAAAIDBAUGAQf/xAAuEAACAQMDAgQEBwAAAAAAAAABAgMABBEFEiExQVEGE2FxgZGhwdEUIjJCUrHw/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAWEQEBAQAAAAAAAAAAAAAAAAAAEQH/2gAMAwEAAhEDEQA/APVq6ajal66T/9k="
                        />
                        <div>
                            <p className="font-semibold">{rider.name}</p>
                            <p className="text-sm text-muted-foreground">{rider.rides} rides</p>
                        </div>
                    </div>
                    <div className="ml-auto text-right">
                        <p className="font-semibold">{rider.hours} hrs</p>
                        <p className="text-sm text-muted-foreground">On-app</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="animate-fade-in-up">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Online Triders</CardTitle>
                    <Car className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        <CountingNumber value={57} />
                    </div>
                    <p className="text-xs text-muted-foreground">+5 since last hour</p>
                </CardContent>
            </Card>
            <Card className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Online Passengers</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        <CountingNumber value={128} />
                    </div>
                    <p className="text-xs text-muted-foreground">+12 since last hour</p>
                </CardContent>
            </Card>
            <Card className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Dispatchers</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        <CountingNumber value={4} />
                    </div>
                    <p className="text-xs text-muted-foreground">2 handling bookings</p>
                </CardContent>
            </Card>
            <Card className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Rides Today</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        <CountingNumber value={1284} />
                    </div>
                    <p className="text-xs text-muted-foreground">+19% from yesterday</p>
                </CardContent>
            </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
                <CardHeader>
                  <CardTitle>Revenue Trends</CardTitle>
                  <CardDescription>A chart showing revenue over the last 3 months will be displayed here.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[250px] w-full flex items-center justify-center bg-muted rounded-md">
                        <p className="text-muted-foreground">Chart component will be here.</p>
                    </div>
                </CardContent>
            </Card>
            <Card className="col-span-3 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
                <CardHeader>
                    <CardTitle>Top 10 Riders</CardTitle>
                    <CardDescription>
                        This month&apos;s most active riders.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <TopRiders />
                </CardContent>
            </Card>
        </div>
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
             <Card className="col-span-4 animate-fade-in-up" style={{ animationDelay: '700ms' }}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart className="h-5 w-5" />
                        Analytics & Reporting
                    </CardTitle>
                     <CardDescription>
                        Real-time insights and performance metrics.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                         <div className="flex items-center justify-between p-4 bg-card rounded-lg border">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-primary/10">
                                    <DollarSign className="h-4 w-4 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Daily Revenue</p>
                                    <p className="text-2xl font-bold">
                                        <CountingNumber value={45230} prefix="₱" />
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-green-500">
                                <TrendingUp className="h-4 w-4" />
                                +12.3%
                            </div>
                        </div>
                         <div className="flex items-center justify-between p-4 bg-card rounded-lg border">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-primary/10">
                                    <Users className="h-4 w-4 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Active Users</p>
                                    <p className="text-2xl font-bold">
                                        <CountingNumber value={2847} />
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-green-500">
                                <TrendingUp className="h-4 w-4" />
                                +8.1%
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card className="col-span-3 animate-fade-in-up" style={{ animationDelay: '800ms' }}>
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Live Operations
                    </CardTitle>
                    <CardDescription>
                        Real-time system status and key metrics.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-2 text-green-500">
                        <HeartPulse className="h-5 w-5 animate-pulse" />
                        <span className="font-semibold">All systems operational</span>
                    </div>
                    <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Backend API</span>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-green-500">Online</span>
                            </div>
                        </div>
                         <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Database</span>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                                <span className="text-green-500">Active</span>
                            </div>
                        </div>
                         <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Active Rides</span>
                            <div className="flex items-center gap-2">
                                <span className="font-medium">
                                    <CountingNumber value={147} />
                                </span>
                                <Car className="h-4 w-4" />
                            </div>
                        </div>
                    </div>
                    <div className="border-t pt-4">
                        <LiveStats />
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
