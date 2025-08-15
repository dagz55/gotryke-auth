
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Landmark } from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const paymentGateways = [
  { value: 'paymongo', label: 'Paymongo' },
  { value: 'stripe', label: 'Stripe' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'mock_gateway', label: 'Mock Gateway' },
]

const formSchema = z.object({
  gateway: z.string({ required_error: "Please select a payment gateway." }),
  publicKey: z.string().min(1, "Public key is required."),
  secretKey: z.string().min(1, "Secret key is required."),
})

type PaymentSettings = z.infer<typeof formSchema>;

interface PaymentSettingsFormProps {
    onDirtyChange: (isDirty: boolean) => void;
    settings: PaymentSettings;
    onSave: (newSettings: PaymentSettings) => void;
}

export const PaymentSettingsForm = React.forwardRef<
    { onSubmit: () => void, reset: () => void },
    PaymentSettingsFormProps
>(({ onDirtyChange, settings, onSave }, ref) => {
  const form = useForm<PaymentSettings>({
    resolver: zodResolver(formSchema),
    defaultValues: settings,
  })

  const { formState: { isDirty }, handleSubmit, reset } = form;

  React.useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);
  
  React.useEffect(() => {
    reset(settings);
  }, [settings, reset]);


  function onSubmit(values: PaymentSettings) {
    onSave(values)
    reset(values); // This marks the form as no longer dirty
  }

  React.useImperativeHandle(ref, () => ({
    onSubmit: handleSubmit(onSubmit),
    reset: () => reset(settings)
  }));

  return (
    <Card>
        <CardHeader>
            <CardTitle>Payment Gateway</CardTitle>
            <CardDescription>Configure your payment provider settings.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form className="space-y-6">
                <FormField
                control={form.control}
                name="gateway"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Active Gateway</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a payment gateway" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {paymentGateways.map((gateway) => (
                            <SelectItem key={gateway.value} value={gateway.value}>
                                <div className="flex items-center">
                                    <Landmark className="mr-2 h-4 w-4 text-muted-foreground" />
                                    {gateway.label}
                                </div>
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormDescription>
                        Select the payment provider to process transactions.
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="publicKey"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Public API Key</FormLabel>
                    <FormControl>
                        <Input placeholder="pk_test_..." {...field} />
                    </FormControl>
                     <FormDescription>
                        Your public-facing API key from the payment provider.
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="secretKey"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Secret API Key</FormLabel>
                    <FormControl>
                        <Input type="password" placeholder="sk_test_..." {...field} />
                    </FormControl>
                    <FormDescription>
                        Your secret API key. Do not share this with anyone.
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </form>
            </Form>
        </CardContent>
    </Card>
  )
})

PaymentSettingsForm.displayName = 'PaymentSettingsForm';
