import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wallet, CreditCard, Activity, Landmark } from "lucide-react";

export default function PaymentsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Payments &amp; Wallet</h2>
                <p className="text-muted-foreground">
                    Monitor transactions and manage your funds.
                </p>
            </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Wallet Balance</CardTitle>
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₱1,250,420.50</div>
                    <p className="text-xs text-muted-foreground">+5.2% from last month</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Today&apos;s Payouts</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₱85,312.00</div>
                    <p className="text-xs text-muted-foreground">22 payouts processed</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Top-ups</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">15</div>
                    <p className="text-xs text-muted-foreground">Totaling ₱12,500.00</p>
                </CardContent>
            </Card>
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Gateway</CardTitle>
                    <Landmark className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">Paymongo</div>
                    <p className="text-xs text-muted-foreground">Go to Settings to change</p>
                </CardContent>
            </Card>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>A log of all recent wallet transactions.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="relative flex h-[300px] w-full items-center justify-center rounded-lg bg-muted">
                    <p className="text-muted-foreground">Transaction history placeholder - Table will be integrated here.</p>
                    <Wallet className="h-24 w-24 text-muted-foreground/20" />
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
