"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { MapPin, Clock, Users, Settings } from "lucide-react"
import React from "react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"

const dispatchConfigSchema = z.object({
  // Auto Assignment Settings
  enableAutoAssignment: z.boolean().default(true),
  assignmentRadius: z.coerce.number().min(1).max(20).default(5),
  assignmentTimeout: z.coerce.number().min(30).max(300).default(120),
  maxAssignmentRetries: z.coerce.number().min(1).max(5).default(3),
  
  // Priority Settings
  priorityAlgorithm: z.enum(["distance", "rating", "response_time", "balanced"]).default("balanced"),
  distanceWeight: z.coerce.number().min(0).max(1).step(0.1).default(0.4),
  ratingWeight: z.coerce.number().min(0).max(1).step(0.1).default(0.3),
  responseTimeWeight: z.coerce.number().min(0).max(1).step(0.1).default(0.3),
  
  // Zone Management
  enableZoneRestrictions: z.boolean().default(true),
  allowCrossZoneAssignment: z.boolean().default(false),
  maxCrossZoneDistance: z.coerce.number().min(1).max(10).default(3),
  
  // Queue Management
  maxQueueSize: z.coerce.number().min(10).max(500).default(100),
  priorityQueueEnabled: z.boolean().default(true),
  highPriorityTimeout: z.coerce.number().min(60).max(600).default(300),
  
  // Notifications
  notifyOnAssignment: z.boolean().default(true),
  notifyOnTimeout: z.boolean().default(true),
  notifyOnCancellation: z.boolean().default(true),
  smsNotifications: z.boolean().default(true),
  
  // Performance Settings
  refreshInterval: z.coerce.number().min(5).max(60).default(10),
  enableRealTimeTracking: z.boolean().default(true),
  trackingAccuracy: z.enum(["high", "medium", "low"]).default("high"),
  
  // Emergency Settings
  emergencyOverride: z.boolean().default(true),
  emergencyRadius: z.coerce.number().min(1).max(20).default(10),
  emergencyPriority: z.boolean().default(true),
})

type DispatchConfig = z.infer<typeof dispatchConfigSchema>

interface DispatchConfigFormProps {
  settings: DispatchConfig
  onSave: (settings: DispatchConfig) => Promise<void>
}

export function DispatchConfigForm({ settings, onSave }: DispatchConfigFormProps) {
  const form = useForm<DispatchConfig>({
    resolver: zodResolver(dispatchConfigSchema),
    defaultValues: settings,
  })

  const { handleSubmit, watch } = form
  const enableAutoAssignment = watch("enableAutoAssignment")
  const enableZoneRestrictions = watch("enableZoneRestrictions")
  const priorityQueueEnabled = watch("priorityQueueEnabled")
  const emergencyOverride = watch("emergencyOverride")

  async function onSubmit(values: DispatchConfig) {
    await onSave(values)
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Auto Assignment Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Auto Assignment Settings
              </CardTitle>
              <CardDescription>
                Configure automatic rider assignment for new ride requests.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="enableAutoAssignment"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable Auto Assignment</FormLabel>
                      <FormDescription>
                        Automatically assign rides to available riders.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {enableAutoAssignment && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="assignmentRadius"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assignment Radius (km)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormDescription>
                          Maximum distance to search for riders.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="assignmentTimeout"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assignment Timeout (seconds)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormDescription>
                          Time before assignment times out.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="maxAssignmentRetries"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Retries</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormDescription>
                          Maximum retry attempts.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Priority Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Priority Algorithm
              </CardTitle>
              <CardDescription>
                Configure how riders are prioritized for assignment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="priorityAlgorithm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority Algorithm</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select algorithm" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="distance">Nearest Distance</SelectItem>
                        <SelectItem value="rating">Highest Rating</SelectItem>
                        <SelectItem value="response_time">Fastest Response</SelectItem>
                        <SelectItem value="balanced">Balanced (Weighted)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Method used to prioritize rider assignment.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {form.watch("priorityAlgorithm") === "balanced" && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="distanceWeight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Distance Weight: {field.value}</FormLabel>
                        <FormControl>
                          <div className="px-3">
                            <Slider
                              min={0}
                              max={1}
                              step={0.1}
                              value={[field.value]}
                              onValueChange={(values) => field.onChange(values[0])}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          How much distance affects priority (0-1).
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ratingWeight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rating Weight: {field.value}</FormLabel>
                        <FormControl>
                          <div className="px-3">
                            <Slider
                              min={0}
                              max={1}
                              step={0.1}
                              value={[field.value]}
                              onValueChange={(values) => field.onChange(values[0])}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          How much rating affects priority (0-1).
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="responseTimeWeight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Response Time Weight: {field.value}</FormLabel>
                        <FormControl>
                          <div className="px-3">
                            <Slider
                              min={0}
                              max={1}
                              step={0.1}
                              value={[field.value]}
                              onValueChange={(values) => field.onChange(values[0])}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          How much response time affects priority (0-1).
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Zone Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Zone Management
              </CardTitle>
              <CardDescription>
                Configure zone-based dispatch restrictions and settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="enableZoneRestrictions"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable Zone Restrictions</FormLabel>
                      <FormDescription>
                        Restrict riders to their assigned zones.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {enableZoneRestrictions && (
                <>
                  <FormField
                    control={form.control}
                    name="allowCrossZoneAssignment"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Allow Cross-Zone Assignment</FormLabel>
                          <FormDescription>
                            Allow assignment across different zones when needed.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  {form.watch("allowCrossZoneAssignment") && (
                    <FormField
                      control={form.control}
                      name="maxCrossZoneDistance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Cross-Zone Distance (km)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormDescription>
                            Maximum distance for cross-zone assignments.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Queue Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Queue Management
              </CardTitle>
              <CardDescription>
                Configure dispatch queue and priority settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="maxQueueSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Queue Size</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>
                        Maximum number of pending rides in queue.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="refreshInterval"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Refresh Interval (seconds)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>
                        How often to refresh the dispatch queue.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="priorityQueueEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable Priority Queue</FormLabel>
                      <FormDescription>
                        Process high-priority rides first.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {priorityQueueEnabled && (
                <FormField
                  control={form.control}
                  name="highPriorityTimeout"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>High Priority Timeout (seconds)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>
                        Time before high priority rides timeout.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          {/* Performance & Tracking */}
          <Card>
            <CardHeader>
              <CardTitle>Performance & Tracking</CardTitle>
              <CardDescription>
                Configure real-time tracking and performance settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="enableRealTimeTracking"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Real-Time Tracking</FormLabel>
                        <FormDescription>
                          Enable live location tracking.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="trackingAccuracy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tracking Accuracy</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select accuracy" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="high">High (Battery intensive)</SelectItem>
                          <SelectItem value="medium">Medium (Balanced)</SelectItem>
                          <SelectItem value="low">Low (Battery saving)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        GPS accuracy level for tracking.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure dispatch-related notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="notifyOnAssignment"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Assignment Notifications</FormLabel>
                        <FormDescription>
                          Notify when rides are assigned.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notifyOnTimeout"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Timeout Notifications</FormLabel>
                        <FormDescription>
                          Notify when assignments timeout.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notifyOnCancellation"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Cancellation Notifications</FormLabel>
                        <FormDescription>
                          Notify when rides are cancelled.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="smsNotifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">SMS Notifications</FormLabel>
                        <FormDescription>
                          Send SMS notifications.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Emergency Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-5 h-5 bg-red-500 rounded-full" />
                Emergency Settings
              </CardTitle>
              <CardDescription>
                Configure emergency dispatch overrides and protocols.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="emergencyOverride"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Emergency Override</FormLabel>
                      <FormDescription>
                        Allow emergency rides to bypass normal rules.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {emergencyOverride && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="emergencyRadius"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Emergency Radius (km)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormDescription>
                          Search radius for emergency rides.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="emergencyPriority"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Emergency Priority</FormLabel>
                          <FormDescription>
                            Prioritize emergency rides above all others.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" size="lg">
            Save Dispatch Configuration
          </Button>
        </form>
      </Form>
    </div>
  )
}