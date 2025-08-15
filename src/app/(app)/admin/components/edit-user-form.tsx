"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

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
import { roles, providers } from "../data/data"
import { useToast } from "@/hooks/use-toast"
import { User, userSchema } from "../data/schema"
import { Switch } from "@/components/ui/switch"
import { updateUser } from "@/lib/supabase-admin-functions"

const formSchema = userSchema.omit({ id: true, status: true });

export function EditUserForm({ user, setOpen }: { user: User, setOpen: (open: boolean) => void }) {
  const { toast } = useToast()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
      provider: user.provider,
      toda: user.toda,
      bodyNumber: user.bodyNumber,
      driversLicense: user.driversLicense,
      tricycleRegistration: user.tricycleRegistration,
      isVerified: user.isVerified ?? false,
      walletBalance: user.walletBalance,
      city: user.city,
    },
  })

  const role = form.watch("role")

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await updateUser(user.id, values);
      toast({
        title: "User Updated",
        description: `User ${values.name}'s details have been updated.`,
      })
      setOpen(false)
      // Note: You might want to trigger a data refresh here
    } catch (error) {
       toast({
        title: "Error Updating User",
        description: "An unexpected error occurred.",
        variant: "destructive"
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Juan Dela Cruz" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="9171234567" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="juan.cruz@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="provider"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telco Provider</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a provider" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {providers.map((provider) => (
                    <SelectItem key={provider.value} value={provider.value}>
                      <div className="flex items-center">
                        <provider.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                        {provider.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      <div className="flex items-center">
                        <role.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                        {role.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {role === 'rider' && (
          <>
            <FormField
              control={form.control}
              name="toda"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>TODA Assignment</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Makati TODA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bodyNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Body Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. MK-123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="driversLicense.number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>License Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. N02-12-123456" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="driversLicense.expiryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>License Expiry (YYYY-MM-DD)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 2025-10-21" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="tricycleRegistration.plateNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tricycle Plate Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. AB 12345" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="tricycleRegistration.expiryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Registration Expiry (YYYY-MM-DD)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 2024-08-15" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
         <FormField
          control={form.control}
          name="isVerified"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Verified User</FormLabel>
                <FormDescription>
                  Grant this user a verified status.
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
        <Button type="submit">Save Changes</Button>
      </form>
    </Form>
  )
}
