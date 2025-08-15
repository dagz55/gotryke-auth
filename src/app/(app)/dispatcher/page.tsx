
"use client"

import * as React from "react"
import { columns } from "../rider/components/columns"
import { DataTable } from "@/app/(app)/admin/components/data-table"
import { getUsersByRole, AdminUser, getSettings, updateSettings } from "@/lib/supabase-admin-functions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Settings, MapPin, BarChart3 } from "lucide-react"
import { DispatchConfigForm } from "./components/dispatch-config-form"
import { useToast } from "@/hooks/use-toast"

interface DispatchConfig {
  enableAutoAssignment: boolean;
  assignmentRadius: number;
  assignmentTimeout: number;
  maxAssignmentRetries: number;
  priorityAlgorithm: string;
  distanceWeight: number;
  ratingWeight: number;
  responseTimeWeight: number;
  enableZoneRestrictions: boolean;
  allowCrossZoneAssignment: boolean;
  maxCrossZoneDistance: number;
  maxQueueSize: number;
  priorityQueueEnabled: boolean;
  highPriorityTimeout: number;
  notifyOnAssignment: boolean;
  notifyOnTimeout: boolean;
  notifyOnCancellation: boolean;
  smsNotifications: boolean;
  refreshInterval: number;
  enableRealTimeTracking: boolean;
  trackingAccuracy: string;
  emergencyOverride: boolean;
  emergencyRadius: number;
  emergencyPriority: boolean;
}

export default function DispatcherPage() {
  const { toast } = useToast()
  const [users, setUsers] = React.useState<AdminUser[]>([])
  const [activeTab, setActiveTab] = React.useState("overview")
  const [dispatchConfig, setDispatchConfig] = React.useState<DispatchConfig>({
    enableAutoAssignment: true,
    assignmentRadius: 5,
    assignmentTimeout: 120,
    maxAssignmentRetries: 3,
    priorityAlgorithm: "balanced",
    distanceWeight: 0.4,
    ratingWeight: 0.3,
    responseTimeWeight: 0.3,
    enableZoneRestrictions: true,
    allowCrossZoneAssignment: false,
    maxCrossZoneDistance: 3,
    maxQueueSize: 100,
    priorityQueueEnabled: true,
    highPriorityTimeout: 300,
    notifyOnAssignment: true,
    notifyOnTimeout: true,
    notifyOnCancellation: true,
    smsNotifications: true,
    refreshInterval: 10,
    enableRealTimeTracking: true,
    trackingAccuracy: "high",
    emergencyOverride: true,
    emergencyRadius: 10,
    emergencyPriority: true,
  })

  React.useEffect(() => {
    async function fetchData() {
      // Fetch dispatcher users
      const fetchedUsers = await getUsersByRole('dispatcher')
      setUsers(fetchedUsers)
      
      // Fetch dispatch configuration
      const config = await getSettings('dispatch')
      if (config) {
        setDispatchConfig(config as DispatchConfig)
      }
    }
    fetchData()
  }, [])

  const handleSaveDispatchConfig = async (newConfig: DispatchConfig) => {
    try {
      await updateSettings('dispatch', newConfig)
      setDispatchConfig(newConfig)
      toast({ title: "Dispatch configuration saved!" })
    } catch {
      toast({ title: "Failed to save dispatch configuration", variant: 'destructive' })
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dispatch Control Center</h2>
          <p className="text-muted-foreground">
            Manage dispatch operations, configurations, and monitor real-time activity.
          </p>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <BarChart3 className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="dispatchers">
            <Users className="mr-2 h-4 w-4" />
            Dispatchers
          </TabsTrigger>
          <TabsTrigger value="live-map">
            <MapPin className="mr-2 h-4 w-4" />
            Live Map
          </TabsTrigger>
          <TabsTrigger value="configuration">
            <Settings className="mr-2 h-4 w-4" />
            Configuration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Dispatchers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.filter(u => u.status === 'active').length}</div>
                <p className="text-xs text-muted-foreground">
                  +2 from last hour
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Queue Size</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  Pending assignments
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.4m</div>
                <p className="text-xs text-muted-foreground">
                  -0.3m from last hour
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">94.2%</div>
                <p className="text-xs text-muted-foreground">
                  +1.2% from yesterday
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest dispatch assignments and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <div className="flex-1 text-sm">
                      <p>Ride #1234 assigned to Juan Dela Cruz</p>
                      <p className="text-muted-foreground">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <div className="flex-1 text-sm">
                      <p>Zone 3 capacity updated</p>
                      <p className="text-muted-foreground">5 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                    <div className="flex-1 text-sm">
                      <p>High priority ride queued</p>
                      <p className="text-muted-foreground">8 minutes ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Current operational status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Auto Assignment</span>
                    <span className="text-sm text-green-600">Active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Real-time Tracking</span>
                    <span className="text-sm text-green-600">Online</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Queue Processing</span>
                    <span className="text-sm text-green-600">Normal</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Emergency Override</span>
                    <span className="text-sm text-green-600">Ready</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="dispatchers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dispatcher Management</CardTitle>
              <CardDescription>
                Manage all dispatchers in the system and their activities.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable data={users} columns={columns} toolbar={false} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="live-map" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Live Dispatch Map</CardTitle>
              <CardDescription>
                Real-time view of all active rides, available riders, and dispatch zones.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative h-[600px] w-full rounded-lg bg-muted overflow-hidden">
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MapPin className="h-24 w-24 text-muted-foreground/20 mx-auto mb-4" />
                    <p className="text-muted-foreground">Live dispatch map will be displayed here</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Real-time tracking of riders, passengers, and dispatch zones
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dispatch Configuration</CardTitle>
              <CardDescription>
                Configure dispatch algorithms, zones, and operational parameters.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DispatchConfigForm 
                settings={dispatchConfig} 
                onSave={handleSaveDispatchConfig} 
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
