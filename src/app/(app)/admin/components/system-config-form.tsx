"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Settings, Shield, Database, Bell, Globe, Lock, Zap } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"

const systemConfigSchema = z.object({
  // Security Settings
  sessionTimeout: z.coerce.number().min(5).max(480).default(60),
  maxLoginAttempts: z.coerce.number().min(3).max(10).default(5),
  requireTwoFactor: z.boolean().default(false),
  passwordComplexity: z.boolean().default(true),
  
  // Operational Settings
  maintenanceMode: z.boolean().default(false),
  maintenanceMessage: z.string().optional(),
  maxActiveRides: z.coerce.number().min(50).max(10000).default(500),
  rideTimeout: z.coerce.number().min(5).max(60).default(15),
  
  // Notification Settings
  smsNotifications: z.boolean().default(true),
  emailNotifications: z.boolean().default(false),
  pushNotifications: z.boolean().default(true),
  notificationRetries: z.coerce.number().min(1).max(5).default(3),
  
  // Performance Settings
  cacheEnabled: z.boolean().default(true),
  apiRateLimit: z.coerce.number().min(100).max(10000).default(1000),
  databaseConnectionPool: z.coerce.number().min(5).max(100).default(20),
  
  // Business Logic Settings
  autoAssignRiders: z.boolean().default(true),
  allowCashPayments: z.boolean().default(true),
  requirePrePayment: z.boolean().default(false),
  cancellationFeeEnabled: z.boolean().default(false),
  cancellationFee: z.coerce.number().min(0).default(0),
})

type SystemConfig = z.infer<typeof systemConfigSchema>

interface SystemConfigFormProps {
  onDirtyChange: (isDirty: boolean) => void
  settings: SystemConfig
  onSave: (newSettings: SystemConfig) => void
}

export const SystemConfigForm = React.forwardRef<
  { onSubmit: () => void, reset: () => void },
  SystemConfigFormProps
>(({ onDirtyChange, settings, onSave }, ref) => {
  const form = useForm<SystemConfig>({
    resolver: zodResolver(systemConfigSchema),
    defaultValues: settings,
  })

  const { formState: { isDirty }, handleSubmit, reset, watch } = form
  const maintenanceMode = watch("maintenanceMode")

  React.useEffect(() => {
    onDirtyChange(isDirty)
  }, [isDirty, onDirtyChange])
  
  React.useEffect(() => {
    reset(settings)
  }, [settings, reset])

  function onSubmit(values: SystemConfig) {
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
          {/* Security Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Configuration
              </CardTitle>
              <CardDescription>
                Configure security policies and authentication settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sessionTimeout"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Session Timeout (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>
                        Time before user sessions expire automatically.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maxLoginAttempts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Login Attempts</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>
                        Number of failed login attempts before account lockout.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="requireTwoFactor"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Two-Factor Authentication
                        </FormLabel>
                        <FormDescription>
                          Require 2FA for all admin accounts.
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
                  name="passwordComplexity"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Password Complexity
                        </FormLabel>
                        <FormDescription>
                          Enforce strong password requirements.
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

          {/* Operational Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Operational Configuration
              </CardTitle>
              <CardDescription>
                Configure operational parameters and ride management settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="maintenanceMode"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Maintenance Mode
                      </FormLabel>
                      <FormDescription>
                        Put the system into maintenance mode.
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
              
              {maintenanceMode && (
                <FormField
                  control={form.control}
                  name="maintenanceMessage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maintenance Message</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="System is under maintenance. Please try again later."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Message displayed to users during maintenance.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="maxActiveRides"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Active Rides</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>
                        Maximum number of concurrent active rides.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rideTimeout"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ride Timeout (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>
                        Time before unaccepted rides are cancelled.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Configuration
              </CardTitle>
              <CardDescription>
                Configure notification channels and delivery settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="smsNotifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">SMS Notifications</FormLabel>
                        <FormDescription>
                          Enable SMS notifications via Twilio.
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
                  name="emailNotifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Email Notifications</FormLabel>
                        <FormDescription>
                          Enable email notifications.
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
                  name="pushNotifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Push Notifications</FormLabel>
                        <FormDescription>
                          Enable push notifications.
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
                  name="notificationRetries"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notification Retries</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>
                        Number of retry attempts for failed notifications.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Performance Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Performance Configuration
              </CardTitle>
              <CardDescription>
                Configure system performance and resource management.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cacheEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Enable Caching</FormLabel>
                        <FormDescription>
                          Enable system-wide caching.
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
                  name="apiRateLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Rate Limit (req/min)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>
                        Maximum API requests per minute per user.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="databaseConnectionPool"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Database Connection Pool</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>
                        Number of database connections in pool.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Business Logic Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Business Logic Configuration
              </CardTitle>
              <CardDescription>
                Configure business rules and payment settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="autoAssignRiders"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Auto-Assign Riders</FormLabel>
                        <FormDescription>
                          Automatically assign nearest available riders.
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
                  name="allowCashPayments"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Allow Cash Payments</FormLabel>
                        <FormDescription>
                          Accept cash payments on delivery.
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
                  name="requirePrePayment"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Require Pre-Payment</FormLabel>
                        <FormDescription>
                          Require payment before ride booking.
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
                  name="cancellationFeeEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Cancellation Fee</FormLabel>
                        <FormDescription>
                          Charge fee for ride cancellations.
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
              {form.watch("cancellationFeeEnabled") && (
                <FormField
                  control={form.control}
                  name="cancellationFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cancellation Fee Amount (₱)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormDescription>
                        Amount charged for cancelling rides.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  )
})

SystemConfigForm.displayName = 'SystemConfigForm'