
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Map } from "lucide-react"
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
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const mapProviders = [
  { value: 'google_maps', label: 'Google Maps' },
  { value: 'mapbox', label: 'Mapbox' },
  { value: 'openstreetmap', label: 'OpenStreetMap' },
]

const formSchema = z.object({
  provider: z.string({ required_error: "Please select a map provider." }),
  apiKey: z.string().min(1, "API key is required."),
})

type MapSettings = z.infer<typeof formSchema>;

interface MapSettingsFormProps {
    onDirtyChange: (isDirty: boolean) => void;
    settings: MapSettings;
    onSave: (newSettings: MapSettings) => void;
}


export const MapSettingsForm = React.forwardRef<
    { onSubmit: () => void, reset: () => void },
    MapSettingsFormProps
>(({ onDirtyChange, settings, onSave }, ref) => {
  const form = useForm<MapSettings>({
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


  function onSubmit(values: MapSettings) {
    onSave(values);
    reset(values); // This marks the form as no longer dirty
  }

  React.useImperativeHandle(ref, () => ({
    onSubmit: handleSubmit(onSubmit),
    reset: () => reset(settings)
  }));

  return (
    <Card>
        <CardHeader>
            <CardTitle>Map Services</CardTitle>
            <CardDescription>Configure the map provider for location and routing services.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form className="space-y-6">
                <FormField
                control={form.control}
                name="provider"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Active Map Provider</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a map provider" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {mapProviders.map((provider) => (
                            <SelectItem key={provider.value} value={provider.value}>
                                <div className="flex items-center">
                                    <Map className="mr-2 h-4 w-4 text-muted-foreground" />
                                    {provider.label}
                                </div>
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormDescription>
                        Select the map service for real-time tracking and navigation.
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="apiKey"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Public API Key / Token</FormLabel>
                    <FormControl>
                        <Input type="password" placeholder="Enter your Google Maps API key" {...field} />
                    </FormControl>
                     <FormDescription>
                        Your public-facing API key from the map provider.
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

MapSettingsForm.displayName = 'MapSettingsForm';
