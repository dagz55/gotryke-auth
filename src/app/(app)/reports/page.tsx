"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, FileText, DownloadCloud } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import * as React from "react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";


const ReportCard = ({ title, description, children }: { title: string, description: string, children: React.ReactNode }) => {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <CardTitle>{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {children}
            </CardContent>
        </Card>
    )
}

const DateRangePicker = ({ className }: React.HTMLAttributes<HTMLDivElement>) => {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(2024, 0, 20),
    to: new Date(),
  })

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

const ExportButtons = () => {
    return (
        <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline">
                <DownloadCloud className="mr-2 h-4 w-4" />
                Export CSV
            </Button>
            <Button variant="outline">
                 <DownloadCloud className="mr-2 h-4 w-4" />
                Export Excel
            </Button>
            <Button variant="outline">
                 <DownloadCloud className="mr-2 h-4 w-4" />
                Export PDF
            </Button>
            <Button variant="secondary">
                 <DownloadCloud className="mr-2 h-4 w-4" />
                Save to Sheets
            </Button>
        </div>
    )
}


export default function ReportsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Reports &amp; Data Extraction</h2>
                <p className="text-muted-foreground">
                    Generate and download reports for your operations.
                </p>
            </div>
        </div>
        <div className="space-y-6">
            <ReportCard title="Transaction History" description="Export a detailed log of all payments, top-ups, and payouts.">
                <div>
                    <p className="text-sm font-medium mb-2">Select Date Range</p>
                    <DateRangePicker />
                </div>
                <ExportButtons />
            </ReportCard>
            
            <ReportCard title="User Data" description="Download a list of all users based on their role.">
                <div>
                    <p className="text-sm font-medium mb-2">Select User Role</p>
                     <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a role..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Users</SelectItem>
                            <SelectItem value="passenger">Passengers</SelectItem>
                            <SelectItem value="rider">Riders</SelectItem>
                            <SelectItem value="dispatcher">Dispatchers</SelectItem>
                            <SelectItem value="admin">Admins</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <ExportButtons />
            </ReportCard>

            <ReportCard title="Ride Summaries" description="Generate reports on ride statistics, including completed, canceled, and ongoing rides.">
                <div>
                    <p className="text-sm font-medium mb-2">Select Date Range</p>
                    <DateRangePicker />
                </div>
                <div>
                    <p className="text-sm font-medium mb-2">Report Type</p>
                     <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a report type..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="daily">Daily Summary</SelectItem>
                            <SelectItem value="weekly">Weekly Digest</SelectItem>
                            <SelectItem value="monthly">Monthly Overview</SelectItem>
                            <SelectItem value="yearly">Yearly Analysis</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <ExportButtons />
            </ReportCard>
             <ReportCard title="Individual Receipts" description="Search for and download a receipt for a specific transaction.">
                <div className="relative">
                     <p className="text-sm font-medium mb-2">Search by Transaction ID</p>
                    <input placeholder="Enter Transaction ID (e.g., TXN-12345)" className="w-full rounded-md border p-2" />
                </div>
                <Button>
                    <DownloadCloud className="mr-2 h-4 w-4" />
                    Download Receipt PDF
                </Button>
            </ReportCard>
        </div>
    </div>
  );
}
