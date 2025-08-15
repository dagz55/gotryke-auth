import {
  CheckCircledIcon,
  CrossCircledIcon,
  QuestionMarkCircledIcon,
  StopwatchIcon,
  CircleIcon,
} from "@radix-ui/react-icons"
import { User, Shield, Route, Smartphone } from "lucide-react"

const TricycleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="18" r="3" />
    <path d="M12 18h-3" />
    <path d="M18 15l-4-4h-4l-2 6" />
    <path d="M12 4h4" />
    <path d="m14 4-2 4" />
    <path d="M14 9H8" />
  </svg>
)

export const roles = [
  {
    value: "passenger",
    label: "Passenger",
    icon: User,
  },
  {
    value: "rider",
    label: "Rider",
    icon: TricycleIcon,
  },
  {
    value: "dispatcher",
    label: "Dispatcher",
    icon: Route,
  },
  {
    value: "admin",
    label: "Admin",
    icon: Shield,
  },
]

export const statuses = [
  {
    value: "pending",
    label: "Pending",
    icon: QuestionMarkCircledIcon,
  },
  {
    value: "active",
    label: "Active",
    icon: CheckCircledIcon,
  },
  {
    value: "inactive",
    label: "Inactive",
    icon: CrossCircledIcon,
  },
  {
    value: "online",
    label: "Online",
    icon: CircleIcon,
    color: "text-green-500",
  },
    {
    value: "offline",
    label: "Offline",
    icon: CircleIcon,
    color: "text-gray-500",
  },
  {
    value: "idle",
    label: "Idle",
    icon: StopwatchIcon,
    color: "text-yellow-500",
  },
]

export const providers = [
  {
    value: "globe",
    label: "Globe",
    icon: Smartphone,
  },
  {
    value: "smart",
    label: "Smart",
    icon: Smartphone,
  },
  {
    value: "tnt",
    label: "TNT",
    icon: Smartphone,
  },
  {
    value: "dito",
    label: "DITO",
    icon: Smartphone,
  },
]

export const cities = [
    { value: "Manila", label: "Manila" },
    { value: "Quezon City", label: "Quezon City" },
    { value: "Makati", label: "Makati" },
    { value: "Taguig", label: "Taguig" },
    { value: "Pasig", label: "Pasig" },
    { value: "Pasay", label: "Pasay" },
    { value: "Mandaluyong", label: "Mandaluyong" },
]
