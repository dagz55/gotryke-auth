
"use client"

import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { TrendingUp, Trash, PlusCircle } from "lucide-react"
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
import { Switch } from "@/components/ui/switch"

const surgeRuleSchema = z.object({
  conditionType: z.enum(["time_of_day", "location", "demand"]),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  zone: z.string().optional(),
  demandThreshold: z.coerce.number().optional(),
  multiplier: z.coerce.number().min(1, "Multiplier must be at least 1."),
});

const formSchema = z.object({
  surgeEnabled: z.boolean(),
  defaultMultiplier: z.coerce.number().min(1, "Multiplier must be at least 1."),
  rules: z.array(surgeRuleSchema)
})

type SurgeSettings = z.infer<typeof formSchema>;

interface SurgePricingFormProps {
    onDirtyChange: (isDirty: boolean) => void;
    settings: SurgeSettings;
    onSave: (newSettings: SurgeSettings) => void;
}


export const SurgePricingForm = React.forwardRef<
    { onSubmit: () => void, reset: () => void },
    SurgePricingFormProps
>(({ onDirtyChange, settings, onSave }, ref) => {
  const form = useForm<SurgeSettings>({
    resolver: zodResolver(formSchema),
    defaultValues: settings,
  })

  const { control, formState: { isDirty }, handleSubmit, reset, watch } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "rules" });

  React.useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  React.useEffect(() => {
    reset(settings);
  }, [settings, reset]);


  function onSubmit(values: SurgeSettings) {
    onSave(values);
    reset(values); // This marks the form as no longer dirty
  }

  React.useImperativeHandle(ref, () => ({
    onSubmit: handleSubmit(onSubmit),
    reset: () => reset(settings)
  }));
  
  const rules = watch("rules");

  return (
    <Card>
        <CardHeader>
            <CardTitle>Surge Pricing Control</CardTitle>
            <CardDescription>Configure and automate surge pricing to optimize profitability based on demand.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form className="space-y-6">
                <FormField
                  control={control}
                  name="surgeEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Enable Surge Pricing</FormLabel>
                        <FormDescription>
                          Globally enable or disable automated surge pricing.
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
                    control={control}
                    name="defaultMultiplier"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Default Surge Multiplier</FormLabel>
                        <FormControl>
                            <Input type="number" step="0.1" placeholder="e.g. 1.5" {...field} />
                        </FormControl>
                        <FormDescription>
                            The base multiplier to apply when surge pricing is active without a specific rule.
                        </FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                <div>
                  <h3 className="text-lg font-medium">Surge Rules</h3>
                  <div className="space-y-4 mt-2">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex items-end gap-2 rounded-lg border p-4">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <FormField
                                control={control}
                                name={`rules.${index}.conditionType`}
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Condition</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="time_of_day">Time of Day</SelectItem>
                                            <SelectItem value="location">Location</SelectItem>
                                            <SelectItem value="demand">High Demand</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    </FormItem>
                                )}
                            />
                             {rules[index]?.conditionType === 'time_of_day' && (
                                <>
                                    <FormField control={control} name={`rules.${index}.startTime`} render={({ field }) => (<FormItem><FormLabel>Start Time</FormLabel><FormControl><Input type="time" {...field} /></FormControl></FormItem>)} />
                                    <FormField control={control} name={`rules.${index}.endTime`} render={({ field }) => (<FormItem><FormLabel>End Time</FormLabel><FormControl><Input type="time" {...field} /></FormControl></FormItem>)} />
                                </>
                             )}
                              {rules[index]?.conditionType === 'location' && (
                                <FormField control={control} name={`rules.${index}.zone`} render={({ field }) => (<FormItem><FormLabel>Zone</FormLabel><FormControl><Input placeholder="e.g. BGC" {...field} /></FormControl></FormItem>)} />
                             )}
                              {rules[index]?.conditionType === 'demand' && (
                                <FormField control={control} name={`rules.${index}.demandThreshold`} render={({ field }) => (<FormItem><FormLabel>Demand Threshold (%)</FormLabel><FormControl><Input type="number" placeholder="e.g. 75" {...field} /></FormControl></FormItem>)} />
                             )}
                            <FormField control={control} name={`rules.${index}.multiplier`} render={({ field }) => (<FormItem><FormLabel>Multiplier</FormLabel><FormControl><Input type="number" step="0.1" placeholder="e.g. 2.0" {...field} /></FormControl></FormItem>)} />
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ conditionType: 'time_of_day', multiplier: 1.2 })}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Rule
                    </Button>
                  </div>
                </div>
            </form>
            </Form>
        </CardContent>
    </Card>
  )
})

SurgePricingForm.displayName = 'SurgePricingForm';
