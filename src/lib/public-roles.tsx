import { User } from "lucide-react"

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

// Public roles - only these roles are available for public signup
export const publicRoles = [
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
]