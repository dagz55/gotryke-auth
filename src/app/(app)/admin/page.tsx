

"use client"

import * as React from "react"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { AdminUser } from "@/lib/supabase-admin-functions"
import { getUsers } from "@/lib/supabase-admin-functions"


import { columns } from "./components/columns"
import { DataTable } from "./components/data-table"
import { UserNav } from "./components/user-nav"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, CreditCard, Activity, Settings, BarChart, Map, Car, UserCog, Wallet, Landmark, AlertTriangle, Bot, Terminal, Megaphone, LifeBuoy, Ticket, TrendingUp, BookText, FileText } from "lucide-react";
import { MainNav } from "./components/main-nav"
import TeamSwitcher from "./components/team-switcher"
import { PaymentSettingsForm } from "./components/payment-settings-form"
import { MapSettingsForm } from "./components/map-settings-form"
import { useDirtyState } from "@/contexts/dirty-state-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LiveMap } from "./components/live-map";
import { SurgePricingForm } from "./components/surge-pricing-form";
import { SystemConfigForm } from "./components/system-config-form";
import { CommunicationSettingsForm } from "./components/communication-settings-form";
import { FleetManagementForm } from "./components/fleet-management-form";
import { getSettings, updateSettings } from "@/lib/supabase-admin-functions";
import { useToast } from "@/hooks/use-toast"

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

// Additional configuration types
interface SystemConfig {
  sessionTimeout: number;
  maxLoginAttempts: number;
  requireTwoFactor: boolean;
  passwordComplexity: boolean;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  maxActiveRides: number;
  rideTimeout: number;
  smsNotifications: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  notificationRetries: number;
  cacheEnabled: boolean;
  apiRateLimit: number;
  databaseConnectionPool: number;
  autoAssignRiders: boolean;
  allowCashPayments: boolean;
  requirePrePayment: boolean;
  cancellationFeeEnabled: boolean;
  cancellationFee: number;
}

interface CommunicationConfig {
  twilioEnabled: boolean;
  twilioAccountSid: string;
  twilioAuthToken: string;
  twilioPhoneNumber: string;
  smsProvider: string;
  emailEnabled: boolean;
  emailProvider: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  aiChatEnabled: boolean;
  aiProvider: string;
  aiApiKey?: string;
  aiModel: string;
  welcomeMessage: string;
  rideConfirmation: string;
  rideCompleted: string;
  emergencyContact: string;
  sendWelcomeMessage: boolean;
  sendRideUpdates: boolean;
  sendPaymentConfirmations: boolean;
  sendPromotionalMessages: boolean;
}

interface FleetConfig {
  maxVehiclesPerRider: number;
  requireVehicleInspection: boolean;
  inspectionValidityDays: number;
  autoAssignVehicles: boolean;
  maxActiveRiders: number;
  riderShiftDuration: number;
  requireRiderBreaks: boolean;
  maxContinuousHours: number;
  riderRatingThreshold: number;
  maxZones: number;
  dynamicZoneAdjustment: boolean;
  zoneOverlapAllowed: boolean;
  maxRidersPerZone: number;
  autoDispatch: boolean;
  dispatchAlgorithm: string;
  maxDispatchRadius: number;
  dispatchTimeout: number;
  requireDriversLicense: boolean;
  licenseExpiryWarningDays: number;
  requireVehicleRegistration: boolean;
  registrationExpiryWarningDays: number;
  backgroundCheckRequired: boolean;
  trackRiderPerformance: boolean;
  performanceMetrics: string[];
  lowPerformanceThreshold: number;
  performanceReviewPeriod: number;
  requireRegularMaintenance: boolean;
  maintenanceIntervalDays: number;
  maintenanceReminderDays: number;
  emergencyResponseEnabled: boolean;
  panicButtonEnabled: boolean;
  emergencyContactRequired: boolean;
  autoAlertRadius: number;
}


export default function AdminPage() {
    const { toast } = useToast();
    const [users, setUsers] = React.useState<AdminUser[]>([]);
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

    // New configuration states
    const [systemConfig, setSystemConfig] = React.useState<SystemConfig>({
      sessionTimeout: 60,
      maxLoginAttempts: 5,
      requireTwoFactor: false,
      passwordComplexity: true,
      maintenanceMode: false,
      maxActiveRides: 500,
      rideTimeout: 15,
      smsNotifications: true,
      emailNotifications: false,
      pushNotifications: true,
      notificationRetries: 3,
      cacheEnabled: true,
      apiRateLimit: 1000,
      databaseConnectionPool: 20,
      autoAssignRiders: true,
      allowCashPayments: true,
      requirePrePayment: false,
      cancellationFeeEnabled: false,
      cancellationFee: 0,
    });

    const [communicationConfig, setCommunicationConfig] = React.useState<CommunicationConfig>({
      twilioEnabled: true,
      twilioAccountSid: '',
      twilioAuthToken: '',
      twilioPhoneNumber: '',
      smsProvider: 'twilio',
      emailEnabled: false,
      emailProvider: 'smtp',
      aiChatEnabled: false,
      aiProvider: 'gemini',
      aiModel: 'gemini-1.5-flash',
      welcomeMessage: 'Welcome to GoTryke! Your account has been activated.',
      rideConfirmation: 'Your ride has been confirmed. Rider: {rider_name}, ETA: {eta}',
      rideCompleted: 'Ride completed! Total fare: ₱{fare}. Thank you for using GoTryke.',
      emergencyContact: '+63 917 123 4567',
      sendWelcomeMessage: true,
      sendRideUpdates: true,
      sendPaymentConfirmations: true,
      sendPromotionalMessages: false,
    });

    const [fleetConfig, setFleetConfig] = React.useState<FleetConfig>({
      maxVehiclesPerRider: 1,
      requireVehicleInspection: true,
      inspectionValidityDays: 180,
      autoAssignVehicles: true,
      maxActiveRiders: 100,
      riderShiftDuration: 8,
      requireRiderBreaks: true,
      maxContinuousHours: 6,
      riderRatingThreshold: 3.0,
      maxZones: 10,
      dynamicZoneAdjustment: true,
      zoneOverlapAllowed: false,
      maxRidersPerZone: 20,
      autoDispatch: true,
      dispatchAlgorithm: 'balanced',
      maxDispatchRadius: 5,
      dispatchTimeout: 120,
      requireDriversLicense: true,
      licenseExpiryWarningDays: 30,
      requireVehicleRegistration: true,
      registrationExpiryWarningDays: 30,
      backgroundCheckRequired: true,
      trackRiderPerformance: true,
      performanceMetrics: ['rating', 'completion_rate'],
      lowPerformanceThreshold: 3.5,
      performanceReviewPeriod: 30,
      requireRegularMaintenance: true,
      maintenanceIntervalDays: 90,
      maintenanceReminderDays: 7,
      emergencyResponseEnabled: true,
      panicButtonEnabled: true,
      emergencyContactRequired: true,
      autoAlertRadius: 2,
    });

    const [dirtyForms, setDirtyForms] = React.useState({
        payment: false,
        map: false,
        surge: false,
        system: false,
        communication: false,
        fleet: false,
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

            const systemData = await getSettings('system');
            if(systemData) setSystemConfig(systemData as SystemConfig);

            const communicationData = await getSettings('communication');
            if(communicationData) setCommunicationConfig(communicationData as CommunicationConfig);

            const fleetData = await getSettings('fleet');
            if(fleetData) setFleetConfig(fleetData as FleetConfig);
        }

        fetchUsers();
        fetchSettings();
    }, []);

    const { setIsDirty, setSaveAction, setDiscardAction } = useDirtyState();
    const paymentFormRef = React.useRef<{ onSubmit: () => void, reset: () => void }>(null);
    const mapFormRef = React.useRef<{ onSubmit: () => void, reset: () => void }>(null);
    const surgeFormRef = React.useRef<{ onSubmit: () => void, reset: () => void }>(null);
    const systemFormRef = React.useRef<{ onSubmit: () => void, reset: () => void }>(null);
    const communicationFormRef = React.useRef<{ onSubmit: () => void, reset: () => void }>(null);
    const fleetFormRef = React.useRef<{ onSubmit: () => void, reset: () => void }>(null);

    const handleSave = () => {
        if (dirtyForms.payment) paymentFormRef.current?.onSubmit();
        if (dirtyForms.map) mapFormRef.current?.onSubmit();
        if (dirtyForms.surge) surgeFormRef.current?.onSubmit();
        if (dirtyForms.system) systemFormRef.current?.onSubmit();
        if (dirtyForms.communication) communicationFormRef.current?.onSubmit();
        if (dirtyForms.fleet) fleetFormRef.current?.onSubmit();
    };

    const handleDiscard = () => {
        if (dirtyForms.payment) paymentFormRef.current?.reset();
        if (dirtyForms.map) mapFormRef.current?.reset();
        if (dirtyForms.surge) surgeFormRef.current?.reset();
        if (dirtyForms.system) systemFormRef.current?.reset();
        if (dirtyForms.communication) communicationFormRef.current?.reset();
        if (dirtyForms.fleet) fleetFormRef.current?.reset();
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


    const handleSurgeDirtyChange = React.useCallback((isDirty: boolean) => {
        setDirtyForms(f => ({...f, surge: isDirty}));
    }, []);
    const handlePaymentDirtyChange = React.useCallback((isDirty: boolean) => {
        setDirtyForms(f => ({...f, payment: isDirty}));
    }, []);
    const handleMapDirtyChange = React.useCallback((isDirty: boolean) => {
        setDirtyForms(f => ({...f, map: isDirty}));
    }, []);
    const handleSystemDirtyChange = React.useCallback((isDirty: boolean) => {
        setDirtyForms(f => ({...f, system: isDirty}));
    }, []);
    const handleCommunicationDirtyChange = React.useCallback((isDirty: boolean) => {
        setDirtyForms(f => ({...f, communication: isDirty}));
    }, []);
    const handleFleetDirtyChange = React.useCallback((isDirty: boolean) => {
        setDirtyForms(f => ({...f, fleet: isDirty}));
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

    const handleSaveSystemConfig = async (newSettings: SystemConfig) => {
         try {
            await updateSettings('system', newSettings);
            setSystemConfig(newSettings);
            toast({ title: "System configuration saved!" });
        } catch {
            toast({ title: "Failed to save system configuration", variant: 'destructive' });
        }
    }

    const handleSaveCommunicationConfig = async (newSettings: CommunicationConfig) => {
         try {
            await updateSettings('communication', newSettings);
            setCommunicationConfig(newSettings);
            toast({ title: "Communication settings saved!" });
        } catch {
            toast({ title: "Failed to save communication settings", variant: 'destructive' });
        }
    }

    const handleSaveFleetConfig = async (newSettings: FleetConfig) => {
         try {
            await updateSettings('fleet', newSettings);
            setFleetConfig(newSettings);
            toast({ title: "Fleet configuration saved!" });
        } catch {
            toast({ title: "Failed to save fleet configuration", variant: 'destructive' });
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
                <TabsList className="grid w-full grid-cols-3 md:grid-cols-9 h-auto">
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
                    <TabsTrigger value="reports">
                        <BarChart className="mr-2 h-4 w-4" />
                        Reports
                    </TabsTrigger>
                    <TabsTrigger value="project-plan">
                        <FileText className="mr-2 h-4 w-4" />
                        Project Plan
                    </TabsTrigger>
                    <TabsTrigger value="guide">
                        <BookText className="mr-2 h-4 w-4" />
                        Guide
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

                <TabsContent value="reports">
                     <Card>
                        <CardHeader>
                            <CardTitle>Reports &amp; Data Extraction</CardTitle>
                            <CardDescription>
                                Generate and download comprehensive reports for operational analysis.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                           <div className="relative h-[600px] w-full rounded-lg border overflow-hidden">
                               <iframe 
                                   src="/reports" 
                                   className="w-full h-full border-0"
                                   title="Reports Dashboard"
                               />
                           </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="project-plan">
                     <Card>
                        <CardHeader>
                            <CardTitle>Project Plan &amp; Progress</CardTitle>
                            <CardDescription>
                                Interactive Kanban board for tracking development tasks and project milestones.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                           <div className="relative h-[600px] w-full rounded-lg border overflow-hidden">
                               <iframe 
                                   src="/project-plan" 
                                   className="w-full h-full border-0"
                                   title="Project Plan Board"
                               />
                           </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="guide">
                     <Card>
                        <CardHeader>
                            <CardTitle>Guide &amp; Documentation</CardTitle>
                            <CardDescription>
                                Comprehensive documentation and how-to guides for the GoTryke application.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                           <div className="relative h-[600px] w-full rounded-lg border overflow-hidden">
                               <iframe 
                                   src="/guide" 
                                   className="w-full h-full border-0"
                                   title="GoTryke Guide"
                               />
                           </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="settings">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>System Administration</CardTitle>
                                <CardDescription>Comprehensive system configuration and management.</CardDescription>
                            </CardHeader>
                        </Card>

                        <div className="grid gap-6">
                            <SystemConfigForm
                                ref={systemFormRef}
                                onDirtyChange={handleSystemDirtyChange}
                                settings={systemConfig}
                                onSave={handleSaveSystemConfig}
                            />
                            
                            <CommunicationSettingsForm
                                ref={communicationFormRef}
                                onDirtyChange={handleCommunicationDirtyChange}
                                settings={communicationConfig}
                                onSave={handleSaveCommunicationConfig}
                            />
                            
                            <FleetManagementForm
                                ref={fleetFormRef}
                                onDirtyChange={handleFleetDirtyChange}
                                settings={fleetConfig}
                                onSave={handleSaveFleetConfig}
                            />
                            
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
                                <div className="sticky bottom-4 bg-background p-4 border rounded-lg shadow-lg">
                                    <Button onClick={handleSave} className="w-full" size="lg">
                                        Save All Settings
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    </div>
    <AlertDialog open={showDiscardAlert} onOpenChange={setShowDiscardAlert}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>You have unsaved changes</AlertDialogTitle>
            <AlertDialogDescription>
                Do you want to save your changes before switching tabs? If you don&apos;t save, your changes will be lost.
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
