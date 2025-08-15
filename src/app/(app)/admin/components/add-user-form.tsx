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
import { Switch } from "@/components/ui/switch"
import { createUser } from "@/lib/supabase-admin-functions"

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  phone: z.string().min(10, "Phone number must be at least 10 digits."),
  email: z.string().email("Please enter a valid email.").optional(),
  role: z.string({
    required_error: "Please select a role.",
  }),
  provider: z.string({
    required_error: "Please select a provider.",
  }),
  toda: z.string().optional(),
  bodyNumber: z.string().optional(),
  isVerified: z.boolean().default(false),
})

export function AddUserForm({ setOpen }: { setOpen: (open: boolean) => void }) {
  const { toast } = useToast()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      isVerified: false,
    },
  })

  const role = form.watch("role")

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const result = await createUser({ ...values, status: 'active' });
      if (!result.success) {
        throw new Error(result.error);
      }
      toast({
        title: "User Created",
        description: `A new user, ${values.name}, has been added.`,
      })
      setOpen(false)
      // Note: You might want to trigger a data refresh here
    } catch (error) {
       toast({
        title: "Error Creating User",
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
        <Button type="submit">Create User</Button>
      </form>
    </Form>
  )
}
