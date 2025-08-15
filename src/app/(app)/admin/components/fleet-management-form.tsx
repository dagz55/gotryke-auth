"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Car, Users, MapPin, Clock, AlertTriangle, Gauge } from "lucide-react"
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

const fleetManagementSchema = z.object({
  // Vehicle Management
  maxVehiclesPerRider: z.coerce.number().min(1).max(5).default(1),
  requireVehicleInspection: z.boolean().default(true),
  inspectionValidityDays: z.coerce.number().min(30).max(365).default(180),
  autoAssignVehicles: z.boolean().default(true),
  
  // Rider Management
  maxActiveRiders: z.coerce.number().min(10).max(1000).default(100),
  riderShiftDuration: z.coerce.number().min(4).max(12).default(8),
  requireRiderBreaks: z.boolean().default(true),
  maxContinuousHours: z.coerce.number().min(4).max(8).default(6),
  riderRatingThreshold: z.coerce.number().min(1).max(5).step(0.1).default(3.0),
  
  // Zone Management
  maxZones: z.coerce.number().min(5).max(50).default(10),
  dynamicZoneAdjustment: z.boolean().default(true),
  zoneOverlapAllowed: z.boolean().default(false),
  maxRidersPerZone: z.coerce.number().min(5).max(100).default(20),
  
  // Dispatch Settings
  autoDispatch: z.boolean().default(true),
  dispatchAlgorithm: z.enum(["nearest", "rating", "balanced", "custom"]).default("balanced"),
  maxDispatchRadius: z.coerce.number().min(1).max(20).default(5),
  dispatchTimeout: z.coerce.number().min(30).max(300).default(120),
  
  // Safety & Compliance
  requireDriversLicense: z.boolean().default(true),
  licenseExpiryWarningDays: z.coerce.number().min(7).max(90).default(30),
  requireVehicleRegistration: z.boolean().default(true),
  registrationExpiryWarningDays: z.coerce.number().min(7).max(90).default(30),
  backgroundCheckRequired: z.boolean().default(true),
  
  // Performance Monitoring
  trackRiderPerformance: z.boolean().default(true),
  performanceMetrics: z.array(z.enum(["rating", "completion_rate", "response_time", "earnings"])).default(["rating", "completion_rate"]),
  lowPerformanceThreshold: z.coerce.number().min(1).max(5).step(0.1).default(3.5),
  performanceReviewPeriod: z.coerce.number().min(7).max(90).default(30),
  
  // Maintenance
  requireRegularMaintenance: z.boolean().default(true),
  maintenanceIntervalDays: z.coerce.number().min(30).max(365).default(90),
  maintenanceReminderDays: z.coerce.number().min(3).max(30).default(7),
  
  // Emergency Protocols
  emergencyResponseEnabled: z.boolean().default(true),
  panicButtonEnabled: z.boolean().default(true),
  emergencyContactRequired: z.boolean().default(true),
  autoAlertRadius: z.coerce.number().min(0.5).max(10).default(2),
})

type FleetManagementSettings = z.infer<typeof fleetManagementSchema>

interface FleetManagementFormProps {
  onDirtyChange: (isDirty: boolean) => void
  settings: FleetManagementSettings
  onSave: (newSettings: FleetManagementSettings) => void
}

export const FleetManagementForm = React.forwardRef<
  { onSubmit: () => void, reset: () => void },
  FleetManagementFormProps
>(({ onDirtyChange, settings, onSave }, ref) => {
  const form = useForm<FleetManagementSettings>({
    resolver: zodResolver(fleetManagementSchema),
    defaultValues: settings,
  })

  const { formState: { isDirty }, handleSubmit, reset, watch } = form
  const requireRiderBreaks = watch("requireRiderBreaks")
  const trackRiderPerformance = watch("trackRiderPerformance")
  const requireRegularMaintenance = watch("requireRegularMaintenance")
  const emergencyResponseEnabled = watch("emergencyResponseEnabled")

  React.useEffect(() => {
    onDirtyChange(isDirty)
  }, [isDirty, onDirtyChange])
  
  React.useEffect(() => {
    reset(settings)
  }, [settings, reset])

  function onSubmit(values: FleetManagementSettings) {
    onSave(values)
    reset(values)
  }

  React.useImperativeHandle(ref, () => ({
    onSubmit: handleSubmit(onSubmit),
    reset: () => reset(settings)
  }))

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form className="space-y-6">
          {/* Vehicle Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Vehicle Management
              </CardTitle>
              <CardDescription>
                Configure vehicle registration, inspection, and assignment settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="maxVehiclesPerRider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Vehicles per Rider</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>
                        Maximum number of vehicles a rider can register.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="inspectionValidityDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inspection Validity (days)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>
                        How long vehicle inspections remain valid.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="requireVehicleInspection"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Vehicle Inspection Required</FormLabel>
                        <FormDescription>
                          Require vehicles to pass inspection before operation.
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
                  name="autoAssignVehicles"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Auto-Assign Vehicles</FormLabel>
                        <FormDescription>
                          Automatically assign optimal vehicles to riders.
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

          {/* Rider Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Rider Management
              </CardTitle>
              <CardDescription>
                Configure rider limits, shifts, and performance requirements.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="maxActiveRiders"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Active Riders</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>
                        Maximum number of simultaneously active riders.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="riderShiftDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shift Duration (hours)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>
                        Standard rider shift duration.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="riderRatingThreshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min Rating Threshold</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormDescription>
                        Minimum rating required for active riders.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="requireRiderBreaks"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Require Rider Breaks</FormLabel>
                      <FormDescription>
                        Enforce mandatory breaks for rider safety.
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
              
              {requireRiderBreaks && (
                <FormField
                  control={form.control}
                  name="maxContinuousHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Continuous Hours</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>
                        Maximum hours a rider can work without a break.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                Configure service zones and coverage areas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="maxZones"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Zones</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>
                        Maximum number of service zones.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maxRidersPerZone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Riders per Zone</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>
                        Maximum number of riders per service zone.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dynamicZoneAdjustment"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Dynamic Zone Adjustment</FormLabel>
                        <FormDescription>
                          Automatically adjust zones based on demand.
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
                  name="zoneOverlapAllowed"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Allow Zone Overlap</FormLabel>
                        <FormDescription>
                          Allow service zones to overlap.
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

          {/* Dispatch Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Dispatch Settings
              </CardTitle>
              <CardDescription>
                Configure ride dispatching and assignment algorithms.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="autoDispatch"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Auto Dispatch</FormLabel>
                      <FormDescription>
                        Automatically dispatch rides to available riders.
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dispatchAlgorithm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dispatch Algorithm</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select algorithm" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="nearest">Nearest Available</SelectItem>
                          <SelectItem value="rating">Highest Rating</SelectItem>
                          <SelectItem value="balanced">Balanced (Distance + Rating)</SelectItem>
                          <SelectItem value="custom">Custom Algorithm</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Algorithm used for assigning rides.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maxDispatchRadius"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Dispatch Radius (km)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>
                        Maximum distance for ride dispatch.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="dispatchTimeout"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dispatch Timeout (seconds)</FormLabel>
                    <FormControl>
                      <div className="px-3">
                        <Slider
                          min={30}
                          max={300}
                          step={10}
                          value={[field.value]}
                          onValueChange={(values) => field.onChange(values[0])}
                        />
                        <div className="flex justify-between text-sm text-muted-foreground mt-1">
                          <span>30s</span>
                          <span>{field.value}s</span>
                          <span>300s</span>
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Time before dispatch request times out.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Safety & Compliance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Safety & Compliance
              </CardTitle>
              <CardDescription>
                Configure safety requirements and compliance checks.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="requireDriversLicense"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Require Driver's License</FormLabel>
                        <FormDescription>
                          Require valid driver's license for riders.
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
                  name="requireVehicleRegistration"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Require Vehicle Registration</FormLabel>
                        <FormDescription>
                          Require valid vehicle registration.
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="licenseExpiryWarningDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>License Expiry Warning (days)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>
                        Days before expiry to send warning.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="registrationExpiryWarningDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Registration Expiry Warning (days)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>
                        Days before expiry to send warning.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="backgroundCheckRequired"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Background Check Required</FormLabel>
                      <FormDescription>
                        Require background check for new riders.
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
            </CardContent>
          </Card>

          {/* Performance Monitoring */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5" />
                Performance Monitoring
              </CardTitle>
              <CardDescription>
                Configure rider performance tracking and metrics.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="trackRiderPerformance"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Track Rider Performance</FormLabel>
                      <FormDescription>
                        Monitor and track rider performance metrics.
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
              
              {trackRiderPerformance && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="lowPerformanceThreshold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Low Performance Threshold</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" {...field} />
                        </FormControl>
                        <FormDescription>
                          Threshold for identifying low performance.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="performanceReviewPeriod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Review Period (days)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormDescription>
                          Performance review cycle duration.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Maintenance */}
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Schedule</CardTitle>
              <CardDescription>
                Configure vehicle maintenance requirements and schedules.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="requireRegularMaintenance"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Require Regular Maintenance</FormLabel>
                      <FormDescription>
                        Enforce regular vehicle maintenance.
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
              
              {requireRegularMaintenance && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="maintenanceIntervalDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maintenance Interval (days)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormDescription>
                          Days between required maintenance.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="maintenanceReminderDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reminder Period (days)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormDescription>
                          Days before maintenance to send reminder.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Emergency Protocols */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Emergency Protocols
              </CardTitle>
              <CardDescription>
                Configure emergency response and safety features.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="emergencyResponseEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Emergency Response</FormLabel>
                      <FormDescription>
                        Enable emergency response features.
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
              
              {emergencyResponseEnabled && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="panicButtonEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Panic Button</FormLabel>
                            <FormDescription>
                              Enable panic button feature.
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
                      name="emergencyContactRequired"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Emergency Contact Required</FormLabel>
                            <FormDescription>
                              Require emergency contact info.
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
                  
                  <FormField
                    control={form.control}
                    name="autoAlertRadius"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Auto Alert Radius (km)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" {...field} />
                        </FormControl>
                        <FormDescription>
                          Radius for automatic emergency alerts.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  )
})

FleetManagementForm.displayName = 'FleetManagementForm'