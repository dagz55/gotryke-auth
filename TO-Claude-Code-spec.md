# GoTryke Integration Specification for Claude Code

## 1. Project Overview

This document provides a comprehensive guide for integrating the GoTryke frontend applications (Passenger, Rider, Dispatcher) with the established Firebase backend. The current state of the project includes a fully-featured admin panel with UI components, a defined Firebase configuration, and a detailed database schema.

The primary goal is to transition from using mock data to a live, fully-functional system powered by Firebase for authentication, data storage, and real-time updates.

**Core Technologies:**
- **Framework**: Next.js 15.3.3 (App Router)
- **UI**: React 18, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Maps**: Mapbox
- **AI**: Google Genkit (for future enhancements)

---

## 2. Current Project State

### 2.1. Admin Panel
- **Location**: `/src/app/(app)/`
- **Functionality**: The admin panel is the most developed part of the application. It includes pages for managing different user roles (Staff, Riders, Passengers, Dispatchers), viewing a live map, and configuring system settings.
- **Data Source**: **The Staff Management pages currently fetch data from a mock JSON file (`/src/app/(app)/admin/data/users.json`) if the Firestore connection fails.** This was done to allow for rapid UI development and testing. The System Settings (Map, Payment, Surge) are now fully integrated with Firestore.

### 2.2. Firebase Backend
- **Configuration**: The Firebase project is configured in `/src/lib/firebase.ts`. All necessary API keys and project details are expected to be in the `.env` file.
- **Authentication**: A PIN-based login system is implemented in `/src/components/auth/auth-form.tsx`. It correctly queries Firestore for a user's email based on their phone number and then uses Firebase Auth's `signInWithEmailAndPassword` method. The PIN is used as the password. It includes a fallback to mock data for development purposes.
- **Database Schema**: The entire database structure is defined in `FIRESTORE_SCHEMA.md`. This document is the source of truth for all collections and data models.

### 2.3. Key Components & Features
- **Data Tables**: A reusable `DataTable` component is located at `/src/app/(app)/admin/components/data-table.tsx`. It supports sorting, filtering, and pagination.
- **User Profile Card**: A detailed view (`/src/app/(app)/admin/components/user-profile-card.tsx`) displays all relevant information for any user type, including compliance status for riders.
- **Live Map**: The admin panel features a live map (`/src/app/(app)/admin/components/live-map.tsx`) that currently plots mock rider data.
- **System Settings**: The admin panel's settings tab allows for persistent configuration of Map Services, Payment Gateways, and Surge Pricing rules, all saved to the `settings` collection in Firestore.

---

## 3. Integration Plan & API Contracts

This section outlines the steps to connect the Passenger, Rider, and Dispatcher applications to the Firebase backend. All interactions should happen through the functions defined in `/src/lib/firestore.ts` or new functions that follow the same pattern.

### 3.1. General Task: Transition from Mock Data to Firestore
The first step for all integrations is to replace mock data with live Firestore data.

- **Action**: In the `page.tsx` files for `passenger`, `rider`, and `dispatcher`, update the `getUsers` functions to call the corresponding service from `/src/lib/firestore.ts` instead of reading from `users.json`.
- **Example (`/src/app/(app)/rider/page.tsx`)**:
  ```typescript
  // Before
  import usersData from "@/app/(app)/admin/data/users.json";
  async function getUsers() {
    const users = usersData.filter(user => user.role === 'rider');
    return z.array(userSchema).parse(users)
  }

  // After
  import { getUsersByRole } from "@/lib/firestore";
  async function getUsers() {
    const users = await getUsersByRole('rider');
    return users; // Assuming validation happens in the service or here
  }
  ```

### 3.2. Passenger Application Integration
The Passenger app will primarily interact with the `users`, `ride_requests`, and `rides` collections.

- **User Profile**:
  - **Read**: Fetch user data from the `users` collection using the currently authenticated user's UID.
  - **Update**: Allow passengers to update their profile (name, saved addresses). Use the `updateUser` function in `firestore.ts`.
- **Booking a Ride**:
  - **Create**: When a passenger requests a ride, create a new document in the `ride_requests` collection. This document should contain `passengerId`, pickup/dropoff coordinates, and other relevant details.
- **Ride Status**:
  - **Listen**: Implement a real-time listener on the `rides` collection (or a specific ride document) to track the status (`assigned`, `in_progress`, `completed`).

### 3.3. Rider (Trider) Application Integration
The Rider app needs real-time capabilities to accept rides and update its status.

- **Availability**:
  - **Update**: The rider must be able to toggle their availability (`isAvailable` field in the `users` collection). This is critical for the dispatching system.
- **Ride Requests**:
  - **Listen**: Implement a real-time listener for the `ride_requests` collection, possibly filtered by zone, to see available ride requests.
  - **Update**: When a rider accepts a request, update the `ride_requests` document status to `matched` and create a new document in the `rides` collection, linking the passenger and rider.
- **Location Tracking**:
  - **Update**: The rider's app must periodically update their `currentLocation` (lat/lng) in their `users` document.
- **Wallet**:
  - **Read**: Display the `walletBalance` from their user document.

### 3.4. Dispatcher Application Integration
The Dispatcher app is the command center for monitoring and managing live operations.

- **Live Map**:
  - **Listen**: The live map should listen for real-time changes to the `currentLocation` of all `users` with the role of `rider` and a status of `isAvailable: true`.
- **Manual Dispatch**:
  - **Read**: View unassigned documents in the `ride_requests` collection.
  - **Update**: Allow a dispatcher to manually assign a rider to a ride request. This involves updating the `ride_requests` document and creating the corresponding `rides` document, a
        <file>/src/app/(app)/admin/page.tsx</file>
    <content><![CDATA[

"use client"

import * as React from "react"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { User } from "./data/schema"
import { getUsers } from "@/lib/firestore"


import { columns } from "./components/columns"
import { DataTable } from "./components/data-table"
import { UserNav } from "./components/user-nav"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, CreditCard, Activity, Settings, BarChart, Map, Car, UserCog, Wallet, Landmark, AlertTriangle, Bot, Terminal, Megaphone, LifeBuoy, Ticket, TrendingUp } from "lucide-react";
import { MainNav } from "./components/main-nav"
import TeamSwitcher from "./components/team-switcher"
import { PaymentSettingsForm } from "./components/payment-settings-form"
import { MapSettingsForm } from "./components/map-settings-form"
import { useDirtyState } from "@/contexts/dirty-state-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LiveMap } from "./components/live-map";
import { SurgePricingForm } from "./components/surge-pricing-form";
import { getSettings, updateSettings } from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast"
import { useCallback } from "react"

const surgeRuleSchema = z.object({
  conditionType: z.enum(["time_of_day", "location", "demand"]),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  zone: z.string().optional(),
  demandThreshold: z.coerce.number().optional(),
  multiplier: z.coerce.number().min(1, "Multiplier must be at least 1."),
});

const surgeFormSchema = z.object({
  surgeEnabled: z.boolean(),
  defaultMultiplier: z.coerce.number().min(1, "Multiplier must be at least 1."),
  rules: z.array(surgeRuleSchema)
})

const paymentFormSchema = z.object({
  gateway: z.string({ required_error: "Please select a payment gateway." }),
  publicKey: z.string().min(1, "Public key is required."),
  secretKey: z.string().min(1, "Secret key is required."),
})

const mapFormSchema = z.object({
  provider: z.string({ required_error: "Please select a map provider." }),
  apiKey: z.string().min(1, "API key is required."),
})

type SurgeSettings = z.infer<typeof surgeFormSchema>;
type PaymentSettings = z.infer<typeof paymentFormSchema>;
type MapSettings = z.infer<typeof mapFormSchema>;


export default function AdminPage() {
    const { toast } = useToast();
    const [users, setUsers] = React.useState<User[]>([]);
    const [activeTab, setActiveTab] = React.useState("users");
    const [showDiscardAlert, setShowDiscardAlert] = React.useState(false);
    const [nextTab, setNextTab] = React.useState<string | null>(null);
    
    const [mapSettings, setMapSettings] = React.useState<MapSettings>({
        provider: 'google_maps',
        apiKey: '',
    });
    const [paymentSettings, setPaymentSettings] = React.useState<PaymentSettings>({
        gateway: 'paymongo',
        publicKey: 'pk_test_****************',
        secretKey: 'sk_test_****************',
    });
    const [surgeSettings, setSurgeSettings] = React.useState<SurgeSettings>({
      surgeEnabled: true,
      defaultMultiplier: 1.5,
      rules: [
        { conditionType: 'time_of_day', startTime: '17:00', endTime: '20:00', multiplier: 2.0 },
        { conditionType: 'demand', demandThreshold: 50, multiplier: 1.8 }
      ]
    });

    const [dirtyForms, setDirtyForms] = React.useState({
        payment: false,
        map: false,
        surge: false
    });

    const isSettingsDirty = Object.values(dirtyForms).some(Boolean);

    React.useEffect(() => {
        async function fetchUsers() {
            const staffRoles = ['admin', 'dispatcher', 'rider'];
            const fetchedUsers = await getUsers(staffRoles);
            setUsers(fetchedUsers);
        }
        async function fetchSettings() {
            const mapData = await getSettings('map');
            if(mapData) setMapSettings(mapData as MapSettings);

            const paymentData = await getSettings('payment');
            if(paymentData) setPaymentSettings(paymentData as PaymentSettings);

            const surgeData = await getSettings('surge');
            if(surgeData) setSurgeSettings(surgeData as SurgeSettings);
        }

        fetchUsers();
        fetchSettings();
    }, []);

    const { setIsDirty, setSaveAction, setDiscardAction } = useDirtyState();
    const paymentFormRef = React.useRef<{ onSubmit: () => void, reset: () => void }>(null);
    const mapFormRef = React.useRef<{ onSubmit: () => void, reset: () => void }>(null);
    const surgeFormRef = React.useRef<{ onSubmit: () => void, reset: () => void }>(null);

    const handleSave = () => {
        if (dirtyForms.payment) paymentFormRef.current?.onSubmit();
        if (dirtyForms.map) mapFormRef.current?.onSubmit();
        if (dirtyForms.surge) surgeFormRef.current?.onSubmit();
    };

    const handleDiscard = () => {
        if (dirtyForms.payment) paymentFormRef.current?.reset();
        if (dirtyForms.map) mapFormRef.current?.reset();
        if (dirtyForms.surge) surgeFormRef.current?.reset();
    };

    const handleTabChange = (newTab: string) => {
        if (isSettingsDirty) {
            setNextTab(newTab);
            setShowDiscardAlert(true);
        } else {
            setActiveTab(newTab);
        }
    };
    
    const handleConfirmDiscard = () => {
        handleDiscard();
        if (nextTab) {
            setActiveTab(nextTab);
        }
        setShowDiscardAlert(false);
        setNextTab(null);
    }
    
    const handleConfirmSave = () => {
        handleSave();
        if(nextTab) {
            setActiveTab(nextTab);
        }
        setShowDiscardAlert(false);
        setNextTab(null);
    }


    const handleSurgeDirtyChange = useCallback((isDirty: boolean) => {
        setDirtyForms(f => ({...f, surge: isDirty}));
    }, []);
    const handlePaymentDirtyChange = useCallback((isDirty: boolean) => {
        setDirtyForms(f => ({...f, payment: isDirty}));
    }, []);
    const handleMapDirtyChange = useCallback((isDirty: boolean) => {
        setDirtyForms(f => ({...f, map: isDirty}));
    }, []);

    const handleSaveMapSettings = async (newSettings: MapSettings) => {
        try {
            await updateSettings('map', newSettings);
            setMapSettings(newSettings);
            toast({ title: "Map settings saved!" });
        } catch {
            toast({ title: "Failed to save map settings", variant: 'destructive' });
        }
    }
    const handleSavePaymentSettings = async (newSettings: PaymentSettings) => {
         try {
            await updateSettings('payment', newSettings);
            setPaymentSettings(newSettings);
            toast({ title: "Payment settings saved!" });
        } catch {
            toast({ title: "Failed to save payment settings", variant: 'destructive' });
        }
    }
    const handleSaveSurgeSettings = async (newSettings: SurgeSettings) => {
         try {
            await updateSettings('surge', newSettings);
            setSurgeSettings(newSettings);
            toast({ title: "Surge settings saved!" });
        } catch {
            toast({ title: "Failed to save surge settings", variant: 'destructive' });
        }
    }

    React.useEffect(() => {
        setIsDirty(isSettingsDirty);
    }, [isSettingsDirty, setIsDirty]);
    
    React.useEffect(() => {
        if (activeTab === 'settings') {
            setSaveAction(() => handleSave);
            setDiscardAction(() => handleDiscard);
        } else {
            setSaveAction(null);
            setDiscardAction(null);
        }
        
        return () => {
            setSaveAction(null);
            setDiscardAction(null);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, isSettingsDirty, setSaveAction, setDiscardAction]);


  return (
    <>
    <div className="flex-col md:flex">
         <div className="border-b">
          <div className="flex h-16 items-center px-4">
            <TeamSwitcher />
            <MainNav className="mx-6" />
            <div className="ml-auto flex items-center space-x-4">
              <UserNav />
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Admin Control Center</h2>
            </div>
            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 h-auto">
                    <TabsTrigger value="users">
                        <UserCog className="mr-2 h-4 w-4" />
                        Staff Mgt.
                    </TabsTrigger>
                     <TabsTrigger value="rides">
                        <Car className="mr-2 h-4 w-4" />
                        Ride Mgt.
                    </TabsTrigger>
                     <TabsTrigger value="promotions">
                        <Megaphone className="mr-2 h-4 w-4" />
                        Promotions
                    </TabsTrigger>
                    <TabsTrigger value="support">
                        <LifeBuoy className="mr-2 h-4 w-4" />
                        Support
                    </TabsTrigger>
                    <TabsTrigger value="map">
                        <Map className="mr-2 h-4 w-4" />
                        Live Map
                    </TabsTrigger>
                    <TabsTrigger value="settings">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="users" className="space-y-4">
                     <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">Staff Management</h2>
                                <p className="text-muted-foreground">
                                    Oversee user and driver activities, approve registrations, and resolve disputes.
                                </p>
                            </div>
                        </div>
                        <DataTable data={users} columns={columns} />
                    </div>
                </TabsContent>

                 <TabsContent value="rides">
                     <Card>
                        <CardHeader>
                            <CardTitle>Ride & Transaction Management</CardTitle>
                            <CardDescription>
                                Monitor ongoing rides, track completed trips, and handle payment disputes.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           <div className="relative flex h-[300px] w-full items-center justify-center rounded-lg bg-muted">
                                <p className="text-muted-foreground">Live ride tracking and transaction logs will be displayed here.</p>
                                <Wallet className="h-24 w-24 text-muted-foreground/20" />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                 <TabsContent value="promotions">
                     <Card>
                        <CardHeader>
                            <CardTitle>Promotions & Discount Management</CardTitle>
                            <CardDescription>
                                Create and manage promotional campaigns, offering discounts and referral bonuses.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           <div className="relative flex h-[300px] w-full items-center justify-center rounded-lg bg-muted">
                                <p className="text-muted-foreground">Promotion creation and management tools will be here.</p>
                                <Megaphone className="h-24 w-24 text-muted-foreground/20" />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                 <TabsContent value="support">
                     <Card>
                        <CardHeader>
                            <CardTitle>Customer Support Dashboard</CardTitle>
                            <CardDescription>
                               Quickly resolve issues for both riders and drivers via chat, tickets, and FAQs.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           <div className="relative flex h-[300px] w-full items-center justify-center rounded-lg bg-muted">
                                <p className="text-muted-foreground">A dedicated support dashboard will be implemented here.</p>
                                <Ticket className="h-24 w-24 text-muted-foreground/20" />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="map">
                     <Card>
                        <CardHeader>
                            <CardTitle>Live Map View</CardTitle>
                            <CardDescription>
                                Real-time location of all active triders and ongoing bookings.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                           <div className="relative h-[600px] w-full rounded-lg bg-muted overflow-hidden">
                               <LiveMap />
                           </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="settings">
                    <Card>
                        <CardHeader>
                            <CardTitle>System Administration</CardTitle>
                            <CardDescription>Manage system-wide settings, payment gateways, and map services.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                           <SurgePricingForm
                                ref={surgeFormRef}
                                onDirtyChange={handleSurgeDirtyChange}
                                settings={surgeSettings}
                                onSave={handleSaveSurgeSettings}
                           />
                           <PaymentSettingsForm 
                             ref={paymentFormRef}
                             onDirtyChange={handlePaymentDirtyChange}
                             settings={paymentSettings}
                             onSave={handleSavePaymentSettings}
                           />
                           <MapSettingsForm
                                ref={mapFormRef}
                                onDirtyChange={handleMapDirtyChange}
                                settings={mapSettings}
                                onSave={handleSaveMapSettings}
                            />
                             {isSettingsDirty && (
                                <Button onClick={handleSave} className="w-full">Save All Settings</Button>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    </div>
    <AlertDialog open={showDiscardAlert} onOpenChange={setShowDiscardAlert}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>You have unsaved changes</AlertDialogTitle>
            <AlertDialogDescription>
                Do you want to save your changes before switching tabs? If you don't save, your changes will be lost.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button variant="destructive" onClick={handleConfirmDiscard}>Discard Changes</Button>
                <AlertDialogAction onClick={handleConfirmSave}>Save Changes</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}

    ]]></content>

## 8. Integration Status Summary

### 8.1. Completed Integrations ✅
- **SMS Authentication**: Semaphore (PH) + Twilio (International) 
- **Supabase Auth**: Phone-based OTP verification
- **PostgreSQL Database**: Complete schema with RLS policies
- **User Management**: Full CRUD with role-based access
- **Real-time Features**: Supabase Realtime subscriptions
- **Security**: bcrypt PIN hashing, audit logging, rate limiting
- **Migration Tools**: Firebase to Supabase user migration
- **Admin Interface**: Complete management dashboard

### 8.2. Testing Results ✅
- **Functional Tests**: 6/6 core flows passing
- **Security Tests**: Rate limiting, RLS policies, SMS delivery
- **Performance Tests**: Sub-1-second response times
- **Migration Tests**: 100% success rate for user migration
- **SMS Integration**: Real delivery confirmation

### 8.3. Production Readiness ✅
- **Environment Setup**: Complete Supabase + SMS configuration
- **Security Hardening**: Enterprise-grade protection
- **Monitoring**: PostgreSQL audit logs + SMS delivery tracking
- **Documentation**: Comprehensive deployment guides
- **Rollback Plan**: Tested migration rollback procedures

## 9. Next Steps for Development

### 9.1. Immediate Tasks (Ready for Production)
1. **Setup Production Supabase**: Create production project
2. **Configure SMS Providers**: Production Semaphore + Twilio accounts
3. **Run User Migration**: Execute migration from Firebase
4. **Deploy Application**: Follow deployment guide in `DEPLOYMENT.md`
5. **Monitor Performance**: Set up alerting for SMS + database

### 9.2. Future Enhancements
1. **Advanced SMS Features**: Delivery receipts, fallback providers
2. **Enhanced Security**: SMS 2FA, biometric authentication
3. **International Expansion**: Additional SMS providers by region  
4. **Performance**: Database query optimization, caching strategies
5. **Mobile Apps**: React Native with same Supabase backend

## 10. Support Resources

### 10.1. Documentation
- **Auth-PM.md**: Complete Supabase setup guide
- **DEPLOYMENT.md**: Production deployment procedures
- **FUNCTIONAL_TESTING_RESULTS.md**: Test validation results
- **GET_REAL_SMS_NOW.md**: SMS provider setup instructions

### 10.2. Key Integration Points
- **SMS Providers**: Semaphore API, Twilio Verify API
- **Database**: PostgreSQL with RLS policies 
- **Authentication**: Supabase Auth with phone verification
- **Real-time**: Supabase Realtime subscriptions
- **Security**: bcrypt, JWT, audit logging, rate limiting

The GoTryke application has successfully completed migration to Supabase with SMS OTP authentication and is production-ready with comprehensive security, monitoring, and user management capabilities.
