"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { CheckCircle, PauseCircle, Phone, Mail, MapPin, Wallet, BarChart, XCircle, Calendar, AlertTriangle, BadgeCheck, ShieldX } from "lucide-react"
import { User } from "../data/schema"
import { statuses } from "../data/data"
import { differenceInDays, format, parseISO } from "date-fns"

const InfoPill = ({ icon, text, subtext }: { icon: React.ReactNode, text: string, subtext?: string }) => (
    <div className="flex items-center gap-3 rounded-lg bg-secondary p-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-foreground">{text}</p>
            {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
        </div>
    </div>
)

const ExpiryInfoPill = ({ title, expiryDate, number }: { title: string, expiryDate: string, number: string }) => {
    const today = new Date();
    const parsedExpiryDate = parseISO(expiryDate);
    const daysUntilExpiry = differenceInDays(parsedExpiryDate, today);

    let statusColor = "text-green-600";
    let statusText = `Expires in ${daysUntilExpiry} days`;
    let Icon = Calendar;

    if (daysUntilExpiry <= 0) {
        statusColor = "text-red-600";
        statusText = `Expired ${-daysUntilExpiry} days ago`;
        Icon = XCircle;
    } else if (daysUntilExpiry <= 30) {
        statusColor = "text-orange-600";
        statusText = `Expires in ${daysUntilExpiry} days`;
        Icon = AlertTriangle;
    }

    return (
        <div className="flex items-center gap-3 rounded-lg bg-secondary p-3">
             <div className={cn("flex h-8 w-8 items-center justify-center rounded-full bg-primary/10", statusColor)}>
                <Icon className="h-4 w-4" />
            </div>
            <div>
                <p className="text-sm font-medium text-foreground">{title}: {number}</p>
                <p className={cn("text-xs font-medium", statusColor)}>{statusText} ({format(parsedExpiryDate, "MMM dd, yyyy")})</p>
            </div>
        </div>
    )
}


export function UserProfileCard({ user, setOpen }: { user: User, setOpen: (open: boolean) => void }) {
    const { toast } = useToast()
    const status = statuses.find(s => s.value === user.status)

    const handleSuspend = () => {
        toast({
            title: "User Suspended",
            description: `${user.name} has been suspended.`,
            variant: "destructive"
        })
    }

    const handleActivate = () => {
        toast({
            title: "User Activated",
            description: `${user.name} has been activated.`,
        })
    }

    const handleVerify = () => {
        toast({
            title: "User Verified",
            description: `${user.name} has been granted verification.`,
        })
    }

    const handleRevoke = () => {
        toast({
            title: "Verification Revoked",
            description: `Verification for ${user.name} has been revoked.`,
            variant: "destructive"
        })
    }
    
    return (
        <Card className="border-0 shadow-none">
            <CardHeader className="p-0">
                 <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 border-2 border-primary">
                        <AvatarImage src={`https://placehold.co/64x64.png`} alt={user.name} data-ai-hint="person" />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <CardTitle className="text-xl flex items-center gap-2">
                            {user.name}
                            {user.isVerified && <BadgeCheck className="h-5 w-5 text-green-500" />}
                        </CardTitle>
                        <CardDescription className="capitalize">{user.role}</CardDescription>
                         <div className={cn("mt-1 flex items-center gap-1.5 text-xs font-medium", status?.color)}>
                            {status?.icon && <status.icon className="h-3 w-3" />}
                            <span>{status?.label}</span>
                        </div>
                    </div>
                 </div>
            </CardHeader>
            <CardContent className="mt-6 space-y-4 p-0">
               <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                 <InfoPill icon={<Phone />} text={user.phone} subtext="Phone Number" />
                 {user.email && <InfoPill icon={<Mail />} text={user.email} subtext="Email Address" />}
                 {user.city && <InfoPill icon={<MapPin />} text={user.city} subtext="City" />}
                 {user.walletBalance != null && <InfoPill icon={<Wallet />} text={`₱${user.walletBalance.toFixed(2)}`} subtext="Wallet Balance" />}
                 {user.toda && <InfoPill icon={<BarChart />} text={user.toda} subtext="TODA Assignment" />}
                 {user.bodyNumber && <InfoPill icon={<BarChart />} text={user.bodyNumber} subtext="Body Number" />}
               </div>

                {user.role === 'rider' && (
                    <div className="space-y-3 pt-2">
                         <h4 className="font-medium text-foreground">Compliance Information</h4>
                         <div className="grid grid-cols-1 gap-3">
                            {user.driversLicense && (
                                <ExpiryInfoPill 
                                    title="Driver's License"
                                    number={user.driversLicense.number}
                                    expiryDate={user.driversLicense.expiryDate}
                                />
                            )}
                             {user.tricycleRegistration && (
                                <ExpiryInfoPill 
                                    title="Tricycle Registration"
                                    number={user.tricycleRegistration.plateNumber}
                                    expiryDate={user.tricycleRegistration.expiryDate}
                                />
                            )}
                        </div>
                    </div>
                )}


                <div className="grid grid-cols-2 gap-2 pt-4">
                    {user.status === 'active' || user.status === 'online' || user.status === 'idle' ? (
                        <Button variant="destructive" onClick={handleSuspend}>
                            <XCircle className="mr-2 h-4 w-4" /> Suspend
                        </Button>
                    ) : (
                         <Button onClick={handleActivate}>
                            <CheckCircle className="mr-2 h-4 w-4" /> Activate
                        </Button>
                    )}
                     {user.isVerified ? (
                        <Button variant="secondary" onClick={handleRevoke}>
                            <ShieldX className="mr-2 h-4 w-4" /> Revoke
                        </Button>
                    ) : (
                        <Button onClick={handleVerify}>
                            <BadgeCheck className="mr-2 h-4 w-4" /> Verify
                        </Button>
                    )}
                    <Button variant="outline" onClick={() => setOpen(false)} className="col-span-2">Close</Button>
                </div>
            </CardContent>
        </Card>
    )
}
