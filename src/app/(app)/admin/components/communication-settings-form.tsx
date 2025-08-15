"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { MessageSquare, Phone, Mail, Bot } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"

const communicationSchema = z.object({
  // SMS/Twilio Settings
  twilioEnabled: z.boolean().default(true),
  twilioAccountSid: z.string().min(1, "Twilio Account SID is required"),
  twilioAuthToken: z.string().min(1, "Twilio Auth Token is required"),
  twilioPhoneNumber: z.string().min(1, "Twilio Phone Number is required"),
  smsProvider: z.enum(["twilio", "semaphore", "itexmo"]).default("twilio"),
  
  // Email Settings
  emailEnabled: z.boolean().default(false),
  emailProvider: z.enum(["smtp", "sendgrid", "mailgun"]).default("smtp"),
  smtpHost: z.string().optional(),
  smtpPort: z.coerce.number().optional(),
  smtpUser: z.string().optional(),
  smtpPassword: z.string().optional(),
  
  // AI Chat Settings
  aiChatEnabled: z.boolean().default(false),
  aiProvider: z.enum(["openai", "gemini", "local"]).default("gemini"),
  aiApiKey: z.string().optional(),
  aiModel: z.string().default("gemini-1.5-flash"),
  
  // Message Templates
  welcomeMessage: z.string().default("Welcome to GoTryke! Your account has been activated."),
  rideConfirmation: z.string().default("Your ride has been confirmed. Rider: {rider_name}, ETA: {eta}"),
  rideCompleted: z.string().default("Ride completed! Total fare: ₱{fare}. Thank you for using GoTryke."),
  emergencyContact: z.string().default("+63 917 123 4567"),
  
  // Notification Preferences
  sendWelcomeMessage: z.boolean().default(true),
  sendRideUpdates: z.boolean().default(true),
  sendPaymentConfirmations: z.boolean().default(true),
  sendPromotionalMessages: z.boolean().default(false),
})

type CommunicationSettings = z.infer<typeof communicationSchema>

interface CommunicationSettingsFormProps {
  onDirtyChange: (isDirty: boolean) => void
  settings: CommunicationSettings
  onSave: (newSettings: CommunicationSettings) => void
}

export const CommunicationSettingsForm = React.forwardRef<
  { onSubmit: () => void, reset: () => void },
  CommunicationSettingsFormProps
>(({ onDirtyChange, settings, onSave }, ref) => {
  const form = useForm<CommunicationSettings>({
    resolver: zodResolver(communicationSchema),
    defaultValues: settings,
  })

  const { formState: { isDirty }, handleSubmit, reset, watch } = form
  const twilioEnabled = watch("twilioEnabled")
  const emailEnabled = watch("emailEnabled")
  const aiChatEnabled = watch("aiChatEnabled")
  const emailProvider = watch("emailProvider")

  React.useEffect(() => {
    onDirtyChange(isDirty)
  }, [isDirty, onDirtyChange])
  
  React.useEffect(() => {
    reset(settings)
  }, [settings, reset])

  function onSubmit(values: CommunicationSettings) {
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
          {/* SMS Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                SMS Configuration
              </CardTitle>
              <CardDescription>
                Configure SMS notifications and Twilio integration.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="twilioEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable SMS</FormLabel>
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
              
              {twilioEnabled && (
                <>
                  <FormField
                    control={form.control}
                    name="smsProvider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SMS Provider</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select SMS provider" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="twilio">Twilio</SelectItem>
                            <SelectItem value="semaphore">Semaphore</SelectItem>
                            <SelectItem value="itexmo">iTEXMO</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose your SMS service provider.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="twilioAccountSid"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account SID</FormLabel>
                          <FormControl>
                            <Input placeholder="AC..." {...field} />
                          </FormControl>
                          <FormDescription>
                            Your Twilio Account SID.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="twilioAuthToken"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Auth Token</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormDescription>
                            Your Twilio Auth Token.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="twilioPhoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+1234567890" {...field} />
                        </FormControl>
                        <FormDescription>
                          Your Twilio phone number for sending SMS.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </CardContent>
          </Card>

          {/* Email Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Configuration
              </CardTitle>
              <CardDescription>
                Configure email notifications and SMTP settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="emailEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable Email</FormLabel>
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
              
              {emailEnabled && (
                <>
                  <FormField
                    control={form.control}
                    name="emailProvider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Provider</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select email provider" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="smtp">SMTP</SelectItem>
                            <SelectItem value="sendgrid">SendGrid</SelectItem>
                            <SelectItem value="mailgun">Mailgun</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose your email service provider.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {emailProvider === "smtp" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="smtpHost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SMTP Host</FormLabel>
                            <FormControl>
                              <Input placeholder="smtp.gmail.com" {...field} />
                            </FormControl>
                            <FormDescription>
                              Your SMTP server hostname.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="smtpPort"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SMTP Port</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="587" {...field} />
                            </FormControl>
                            <FormDescription>
                              SMTP port number (usually 587 or 465).
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="smtpUser"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SMTP Username</FormLabel>
                            <FormControl>
                              <Input placeholder="your-email@domain.com" {...field} />
                            </FormControl>
                            <FormDescription>
                              Your SMTP username/email.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="smtpPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SMTP Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormDescription>
                              Your SMTP password or app password.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* AI Chat Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Chat Configuration
              </CardTitle>
              <CardDescription>
                Configure AI-powered customer support chat.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="aiChatEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable AI Chat</FormLabel>
                      <FormDescription>
                        Enable AI-powered customer support chat.
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
              
              {aiChatEnabled && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="aiProvider"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>AI Provider</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select AI provider" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="gemini">Google Gemini</SelectItem>
                              <SelectItem value="openai">OpenAI</SelectItem>
                              <SelectItem value="local">Local Model</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Choose your AI service provider.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="aiModel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>AI Model</FormLabel>
                          <FormControl>
                            <Input placeholder="gemini-1.5-flash" {...field} />
                          </FormControl>
                          <FormDescription>
                            AI model name to use.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="aiApiKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>AI API Key</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormDescription>
                          Your AI service API key.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </CardContent>
          </Card>

          {/* Message Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Message Templates
              </CardTitle>
              <CardDescription>
                Customize message templates for different notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="welcomeMessage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Welcome Message</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormDescription>
                      Message sent when a new user registers.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="rideConfirmation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ride Confirmation</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormDescription>
                      Message sent when a ride is confirmed. Use {`{rider_name}`} and {`{eta}`} for variables.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="rideCompleted"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ride Completed</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormDescription>
                      Message sent when a ride is completed. Use {`{fare}`} for fare amount.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="emergencyContact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emergency Contact Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+63 917 123 4567" {...field} />
                    </FormControl>
                    <FormDescription>
                      Emergency contact number displayed in the app.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure which notifications to send automatically.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sendWelcomeMessage"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Welcome Message</FormLabel>
                        <FormDescription>
                          Send welcome message to new users.
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
                  name="sendRideUpdates"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Ride Updates</FormLabel>
                        <FormDescription>
                          Send ride status updates.
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
                  name="sendPaymentConfirmations"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Payment Confirmations</FormLabel>
                        <FormDescription>
                          Send payment confirmation messages.
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
                  name="sendPromotionalMessages"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Promotional Messages</FormLabel>
                        <FormDescription>
                          Send promotional and marketing messages.
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
        </form>
      </Form>
    </div>
  )
})

CommunicationSettingsForm.displayName = 'CommunicationSettingsForm'