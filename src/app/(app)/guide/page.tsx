
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppWindow, Database, Users, Briefcase, Puzzle, FileCode2, BookText, LifeBuoy, Mail, Phone, ChevronDown, ArrowLeft, FolderKanban, Rocket, Map, MessageSquare, CheckCircle, Clock, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";


const InfoCard = ({ icon, title, description, children, className, style }: { icon: React.ReactNode, title: string, description: string, children?: React.ReactNode, className?: string, style?: React.CSSProperties }) => (
    <Card className={cn("transition-all duration-300 hover:shadow-lg hover:-translate-y-1", className)} style={style}>
        <CardHeader className="flex flex-row items-start gap-4 space-y-0">
             <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {icon}
            </div>
            <div>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </div>
        </CardHeader>
        {children && <CardContent>{children}</CardContent>}
    </Card>
);

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 32 32" {...props}><path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.546-.577-1.45-1.16-2.165-.583-.715-.99-1.133-1.254-1.133-.263 0-1.75.898-1.75 2.165 0 1.267 1.39 3.067 1.39 3.235 0 .167-.402.99-1.39 1.963-.987.973-2.24 1.39-3.003 1.39-1.177 0-2.58-.69-3.34-1.447-.76-.757-1.447-1.823-1.447-2.93 0-1.106.583-2.158 1.16-2.923.578-.765 1.39-1.447 2.37-1.823 1.05-.4 2.24-.247 3.14.33.802.516 1.447 1.16 1.447 1.16.248 0 1.203-.48 1.824-1.133.62-.654 1.132-1.518 1.132-1.823s-.167-1.39-.5-2.033c-.33-.645-.783-1.16-1.39-1.518-.606-.355-1.315-.48-2.033-.48-1.176 0-2.24.48-3.14 1.133-.9.653-1.68 1.518-2.165 2.58-.48 1.06-.627 2.24-.248 3.41.38 1.177 1.133 2.24 2.165 3.14.966.83 2.158 1.447 3.41 1.75 1.252.304 2.503.167 3.59-.33.88-.372 1.68-.99 2.24-1.823.56-.83.877-1.823.877-2.93-.01-1.106-.48-2.158-.99-2.85-.518-.69-1.252-1.252-2.033-1.518Z" fill="currentColor"></path></svg>
);
const TelegramIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 48 48" {...props}><path d="M41.41,8.59,6.72,21.93a2.31,2.31,0,0,0,1.3,4.28l8.33,2.5,2.5,8.33a2.31,2.31,0,0,0,4.28,1.3L31.47,26.54l6.9-3.83A2.31,2.31,0,0,0,41.41,8.59ZM21,29.41l-2,6.58L16.2,23.63,33.52,14.2Z" fill="currentColor"></path></svg>
);
const ViberIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" {...props}><path d="M16.9,8.2c0-1-0.9-1.9-2.1-1.9h-1.5c-0.3,0-0.6-0.3-0.6-0.7c0-0.4,0.3-0.7,0.6-0.7h2.2c1.7,0,3.1,1.3,3.1,2.8c0,0.8-0.5,1.7-1.4,1.7C18.2,9.4,16.9,8.8,16.9,8.2z M10,9.4c0.9,0,1.4-0.8,1.4-1.7c0-1.5-1.4-2.8-3.1-2.8H6.1C5.8,4.9,5.5,5.2,5.5,5.6c0,0.4,0.3,0.7,0.6,0.7H8c1.2,0,2.1,0.9,2.1,1.9C10,9.4,10.6,8.8,10,9.4z M21.9,13.8v-1.3c0-0.4-0.3-0.7-0.7-0.7h-2.1c-0.4,0-0.7,0.3-0.7,0.7v1.3c0,0.6,0.3,0.9,0.7,0.9h0.7l0.1,0.1c0,0,0,0.1,0,0.1l-1.4,2.9c-0.1,0.1-0.1,0.3,0,0.4c0.1,0.1,0.3,0.2,0.4,0.2c0.1,0,0.1,0,0.2,0l1.4-2.8h0.2v2.8c0,0.4,0.3,0.7,0.7,0.7s0.7-0.3,0.7-0.7v-4.1C22.2,14.1,21.9,13.8,21.9,13.8z M14.6,12.5h-1.4c-0.4,0-0.7,0.3-0.7,0.7v5.2c0,0.4,0.3,0.7,0.7,0.7h1.4c1.8,0,3.2-1.3,3.2-2.9v-0.1C17.9,13.8,16.5,12.5,14.6,12.5z M16.5,15.6c0,0.8-0.7,1.5-1.8,1.5h-0.1c-0.5,0-0.8-0.3-0.8-0.7v-2.9c0-0.4,0.3-0.7,0.8-0.7h0.1C15.8,13.2,16.5,14.8,16.5,15.6z M11.1,12.5H9.6c-0.4,0-0.7,0.3-0.7,0.7v5.2c0,0.4,0.3,0.7,0.7,0.7h1.5c0.4,0,0.7-0.3,0.7-0.7v-5.2C11.8,12.8,11.5,12.5,11.1,12.5z M6.8,11.8c-1.3,0-2.3,0.9-2.3,2.1c0,0.6,0.3,1.3,1,1.9c0.6,0.5,1.5,0.7,2.2,0.7h0.8c0.4,0,0.7-0.3,0.7-0.7v-3.4c0-0.4-0.3-0.7-0.7-0.7H6.8z M7.4,15.4H7.2c-0.4,0-0.9-0.1-1.2-0.4c-0.3-0.3-0.4-0.6-0.4-0.9c0-0.6,0.4-1,0.9-1h0.9V15.4z M17,21.8c-2,1-5.6,1.8-9.9,1.8c-4.4,0-8.2-0.8-1-1.8C1.8,21.4,0,18.5,0,15.1c0-4.4,3.1-8,7.6-8c0.1,0,0.2,0,0.3,0c0.3-0.4,0.6-0.7,1-1c0.7-0.5,1.5-0.9,2.4-1.1C12.5,4.9,13.9,5,15.2,5.7c1.3,0.7,2.3,1.9,2.8,3.3c0.1-0.1,0.1-0.1,0.2-0.2c0.5-0.5,1.2-1,2.1-1c2.1,0,3.7,1.6,3.7,3.6v1.4C24,18.5,22.2,21.4,17,21.8z" fill="currentColor"></path></svg>
);

const iMessageIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" {...props}><path d="M12 2C6.486 2 2 5.589 2 10c0 2.459 1.522 4.634 3.864 5.707C5.23 16.558 4.73 17.29 4.303 18.01c-1.21 2.06-.21 4.54 2.118 4.786C9.177 23.076 12.158 22 13 22h.001c5.514 0 10-3.589 10-8s-4.486-8-10.001-8z" fill="currentColor"></path></svg>
);

const FaceTimeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" {...props}><path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" fill="currentColor"/><path d="M14.68,8.23a1.44,1.44,0,0,0-1.44,0l-3.1,1.75V8.26A1.18,1.18,0,0,0,9,7.07a1.19,1.19,0,0,0-1.19,1.19V15.74a1.19,1.19,0,0,0,1.19,1.19,1.18,1.18,0,0,0,1.19-1.19V14l3.1,1.75a1.44,1.44,0,0,0,1.44,0A1.42,1.42,0,0,0,16.1,14.3V9.7A1.42,1.42,0,0,0,14.68,8.23Z" fill="currentColor"></path></svg>
);

const communicationLinks = [
    { href: "https://wa.me/639171841002", Icon: WhatsAppIcon, label: "WhatsApp" },
    { href: "https://t.me/+639171841002", Icon: TelegramIcon, label: "Telegram" },
    { href: "sms:+639171841002", Icon: iMessageIcon, label: "iMessage" },
    { href: "facetime:+639171841002", Icon: FaceTimeIcon, label: "FaceTime" },
    { href: "viber://chat?number=%2B639171841002", Icon: ViberIcon, label: "Viber" },
];

const allGuideSections = [
    {
        value: "overview",
        icon: <AppWindow className="h-6 w-6" />,
        title: "Application Overview",
        description: "High-level purpose and goals of the GoTryke admin panel.",
        content: (
            <div className="text-sm text-muted-foreground space-y-4">
                <p>
                    The GoTryke Admin Panel is a comprehensive internal tool designed to manage and monitor all operational aspects of the GoTryke tricycle ride-hailing service. It serves as the central command center for administrators, providing the necessary tools to oversee users, track finances, manage system settings, and monitor the overall health of the platform.
                </p>
                <p>
                    This centralized dashboard aims to streamline administrative tasks, improve operational efficiency, and provide valuable insights through data analytics and reporting. From managing individual user profiles to viewing live platform metrics, the admin panel is critical for the smooth operation of the GoTryke service.
                </p>
            </div>
        )
    },
    {
        value: "tech-stack",
        icon: <Puzzle className="h-6 w-6" />,
        title: "Tech Stack",
        description: "The core technologies and libraries used to build this application.",
        content: (
            <div className="text-sm text-muted-foreground space-y-4">
                <p>The application is built on a modern, robust tech stack chosen for performance, developer experience, and scalability:</p>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong className="text-foreground">Next.js 15.3.3:</strong> A React framework that enables features like server-side rendering and generating static websites for fast and SEO-friendly applications.</li>
                    <li><strong className="text-foreground">React 18:</strong> A JavaScript library for building user interfaces with a component-based architecture.</li>
                    <li><strong className="text-foreground">TypeScript:</strong> A typed superset of JavaScript that adds static types to the code, improving reliability and maintainability.</li>
                    <li><strong className="text-foreground">Tailwind CSS:</strong> A utility-first CSS framework for rapidly building custom designs without leaving your HTML.</li>
                    <li><strong className="text-foreground">ShadCN/UI:</strong> A collection of beautifully designed, reusable components built on top of Radix UI and Tailwind CSS.</li>
                    <li><strong className="text-foreground">Supabase:</strong> PostgreSQL database with real-time capabilities, authentication, and Row Level Security (RLS).</li>
                    <li><strong className="text-foreground">Mapbox GL JS:</strong> Interactive maps for location services and route visualization.</li>
                    <li><strong className="text-foreground">Google Genkit:</strong> A toolkit for building AI-powered features and agents, integrated for future intelligent capabilities.</li>
                </ul>
            </div>
        )
    },
    {
        value: "user-roles",
        icon: <Users className="h-6 w-6" />,
        title: "User Roles & Permissions",
        description: "Explanation of the different user roles and their capabilities within the system.",
        content: (
            <div className="text-sm text-muted-foreground space-y-4">
                <p>The system defines several user roles, each with specific permissions and access levels to ensure security and proper delegation of tasks.</p>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong className="text-foreground">Passenger:</strong> This is the end-user who books and takes rides. While they don&apos;t have access to the admin panel, their data (profile, ride history, wallet balance) is managed here.</li>
                    <li><strong className="text-foreground">Rider:</strong> This is the tricycle driver providing the service. Admins can view and manage their profile, track their status (online, offline, etc.), and verify compliance documents like licenses and registrations.</li>
                    <li><strong className="text-foreground">Dispatcher:</strong> A staff member responsible for operational tasks. This role might involve manually assigning rides during peak hours, assisting users with booking issues, or monitoring specific zones.</li>
                    <li><strong className="text-foreground">Admin:</strong> A privileged user with full access to the admin panel. Admins can manage all user types, configure system-wide settings, view analytics, and oversee the entire platform.</li>
                </ul>
            </div>
        )
    },
    {
        value: "key-features",
        icon: <Briefcase className="h-6 w-6" />,
        title: "Key Features",
        description: "A breakdown of the main functionalities of the admin panel.",
        content: (
            <div className="text-sm text-muted-foreground space-y-4">
                <p>The admin panel is equipped with several key features to ensure comprehensive management of the GoTryke platform.</p>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Dashboard Overview:</strong> The main dashboard provides an at-a-glance view of critical metrics, such as the number of online riders and passengers, active dispatchers, total rides, and system health status.</li>
                    <li><strong>Detailed User Management:</strong> Dedicated pages for managing Passengers, Riders, and Dispatchers. Each features a searchable and sortable data table with actions for editing, viewing profiles, and more.</li>
                    <li><strong>User Profile Modal:</strong> A comprehensive profile view that shows all relevant user information, including contact details, role, status, and compliance documents for riders.</li>
                    <li><strong>Profile Verification:</strong> Admins have the ability to grant or revoke a &quot;verified&quot; status to any user, indicated by a checkmark badge.</li>
                    <li><strong>Compliance Tracking:</strong> Rider profiles prominently display driver&apos;s license and tricycle registration details, including expiry dates with color-coded warnings for upcoming or past expirations.</li>
                    <li><strong>Interactive Project Plan:</strong> A Kanban-style board to track development tasks through different phases. Tasks can be added, edited, deleted, and marked as complete.</li>
                    <li><strong>Unsaved Changes Guard:</strong> A crucial UX feature that prompts users with an alert dialog if they attempt to navigate away from a form with unsaved changes, preventing accidental data loss.</li>
                </ul>
            </div>
        )
    },
    {
        value: "db-schema",
        icon: <Database className="h-6 w-6" />,
        title: "Database Schema",
        description: "Overview of the main data structure for users.",
        content: (
            <div className="text-sm text-muted-foreground space-y-4">
                <p>The core of the user management system is a non-relational document schema, designed for flexibility. All user types share this base schema, with optional fields that apply to specific roles.</p>
                <div className="bg-secondary/50 p-4 rounded-md">
                    <pre className="whitespace-pre-wrap font-mono text-xs">
{`user: {
  id: string,               // Unique identifier (e.g., USR-0001)
  name: string,             // Full name of the user
  phone: string,            // Mobile number
  email?: string,            // Optional email address
  provider: string,         // Telecom provider (e.g., 'globe')
  status: string,           // User status (e.g., 'active', 'online')
  role: string,             // 'passenger', 'rider', 'dispatcher', 'admin'
  toda?: string,             // Tricycle Operators and Drivers' Association (for riders)
  bodyNumber?: string,       // Tricycle body number (for riders)
  city?: string,             // User's city
  walletBalance?: number,    // Current wallet balance (for passengers)
  isVerified?: boolean,      // Verification status
  
  // Rider-specific compliance documents
  driversLicense?: {
    number: string,         // License number
    expiryDate: string,     // Expiry date in 'YYYY-MM-DD' format
  },
  tricycleRegistration?: {
    plateNumber: string,    // Vehicle plate number
    expiryDate: string,     // Expiry date in 'YYYY-MM-DD' format
  }
}`}
                    </pre>
                </div>
            </div>
        )
    },
    {
        value: "directory-structure",
        icon: <FolderKanban className="h-6 w-6" />,
        title: "Directory Structure",
        description: "An outline of the project's folder organization.",
        content: (
            <div className="text-sm text-muted-foreground space-y-4">
                <p>The project follows a standard Next.js App Router structure. Understanding the layout helps in locating files and maintaining a clean architecture.</p>
                <div className="bg-secondary/50 p-4 rounded-md">
                    <pre className="whitespace-pre-wrap font-mono text-xs">
{`src/
├── app/                  # Main application routes (App Router)
│   ├── (app)/            # Group for authenticated routes
│   │   ├── dashboard/
│   │   ├── passenger/
│   │   ├── rider/
│   │   ├── admin/
│   │   ├── guide/        # This guide page
│   │   └── layout.tsx    # Main layout with sidebar for the app
│   ├── (auth)/           # Route group for pages like login, signup (if created)
│   ├── forgot-pin/
│   ├── signup/
│   ├── page.tsx          # Landing/Login page
│   └── layout.tsx        # Root layout of the entire application
│
├── components/           # Reusable React components
│   ├── auth/             # Authentication-specific components
│   └── ui/               # UI components from ShadCN
│
├── contexts/             # React Context providers (e.g., for state management)
│
├── hooks/                # Custom React hooks (e.g., useToast, useIsMobile)
│
├── lib/                  # Library/utility functions (e.g., utils.ts, firebase.ts)
│
├── ai/                   # Genkit AI flows and configurations
│
├── public/               # Static assets (images, fonts, etc.)
│
├── tailwind.config.ts    # Tailwind CSS configuration
└── next.config.ts        # Next.js configuration`}
                    </pre>
                </div>
            </div>
        )
    },
    {
        value: "project-plan",
        icon: <FileCode2 className="h-6 w-6" />,
        title: "Project Plan Board",
        description: "How to use the interactive project management board.",
        content: (
             <div className="text-sm text-muted-foreground space-y-4">
                <p>
                    The &quot;Project Plan&quot; page is a visual Kanban-style tool designed to track development tasks across different phases of the project. It provides a clear and interactive way to manage the project&apos;s lifecycle.
                </p>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Viewing Phases:</strong> The board is divided into columns, each representing a phase of the project. You can see the status of each phase (Done, In Progress, To-Do) indicated by the icon in the header.</li>
                    <li><strong>Toggle Task Completion:</strong> Simply click the checkbox next to a task to mark it as complete or incomplete. The task text will be struck through when completed.</li>
                    <li><strong>Add New Tasks:</strong> Click the <strong className="text-foreground">[+]</strong> icon in a phase header to open a dialog and add a new task to that specific phase.</li>
                    <li><strong>Edit & Delete Tasks:</strong> Hover your mouse over a task to reveal a pencil icon (for editing) and a trash icon (for deleting). Clicking these will open a dialog or a confirmation prompt.</li>
                    <li><strong>Resizable Columns:</strong> For better viewing, you can drag the handles between the columns to resize them to your preference.</li>
                </ul>
            </div>
        )
    },
    {
        value: "mvp-roadmap",
        icon: <Rocket className="h-6 w-6" />,
        title: "MVP Development Roadmap",
        description: "Core booking flow and communication features implementation plan.",
        content: (
            <div className="text-sm text-muted-foreground space-y-4">
                <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">🎯 MVP Priority Focus</h4>
                    <p className="text-blue-800 dark:text-blue-200 text-sm">
                        Version 2.3.0 focuses on implementing core booking flow and basic communication features for actual ride operations.
                        Timeline: 2-3 weeks to achieve functional transportation platform.
                    </p>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold text-foreground mb-2">✅ Current Foundation (Already Built)</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                            <li>Complete 6-digit PIN authentication system with Supabase</li>
                            <li>Admin dashboard with comprehensive role-based access control</li>
                            <li>Robust PostgreSQL schema with Row Level Security (RLS)</li>
                            <li>Comprehensive Shadcn UI component library</li>
                            <li>Supabase Realtime infrastructure ready for implementation</li>
                            <li>Mapbox GL JS integration prepared for location services</li>
                            <li>6 functional test accounts (3 passengers, 3 riders)</li>
                        </ul>
                    </div>
                    
                    <div>
                        <h4 className="font-semibold text-foreground mb-2">❌ Critical Missing Components</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                            <li>No booking/ride request system</li>
                            <li>No real-time ride matching engine</li>
                            <li>No location tracking during trips</li>
                            <li>No rider-passenger communication</li>
                            <li>No trip status management</li>
                            <li>No payment processing integration</li>
                        </ul>
                    </div>
                </div>
            </div>
        )
    },
    {
        value: "database-requirements",
        icon: <Database className="h-6 w-6" />,
        title: "MVP Database Requirements",
        description: "New database tables and schema additions needed for ride operations.",
        content: (
            <div className="text-sm text-muted-foreground space-y-4">
                <p>To enable core booking functionality, the following database tables need to be added to the existing Supabase schema:</p>
                
                <div className="bg-secondary/50 p-4 rounded-md">
                    <pre className="whitespace-pre-wrap font-mono text-xs">
{`-- Ride requests from passengers
CREATE TABLE ride_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  passenger_id UUID REFERENCES profiles(id),
  pickup_location JSONB NOT NULL, -- {lat, lng, address}
  dropoff_location JSONB NOT NULL, -- {lat, lng, address}
  status VARCHAR(20) DEFAULT 'requested', -- requested, matched, cancelled
  estimated_fare DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Active rides
CREATE TABLE rides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID REFERENCES ride_requests(id),
  rider_id UUID REFERENCES profiles(id),
  passenger_id UUID REFERENCES profiles(id),
  status VARCHAR(20) DEFAULT 'matched', -- matched, pickup, in_progress, completed
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  actual_fare DECIMAL(10,2),
  route_data JSONB, -- Store route information
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Real-time user locations
CREATE TABLE user_locations (
  user_id UUID REFERENCES profiles(id) PRIMARY KEY,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Trip communications
CREATE TABLE trip_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ride_id UUID REFERENCES rides(id),
  sender_id UUID REFERENCES profiles(id),
  message TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'text', -- text, system, emergency
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`}
                    </pre>
                </div>
                
                <div className="bg-yellow-50 dark:bg-yellow-950/50 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                    <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                        <strong>Note:</strong> All tables will include appropriate RLS policies for security and proper indexing for performance.
                    </p>
                </div>
            </div>
        )
    },
    {
        value: "phase-breakdown",
        icon: <Calendar className="h-6 w-6" />,
        title: "3-Week Implementation Phases",
        description: "Detailed breakdown of development phases for MVP completion.",
        content: (
            <div className="text-sm text-muted-foreground space-y-6">
                {/* Phase 1 */}
                <div className="border border-green-200 dark:border-green-800 rounded-lg p-4 bg-green-50 dark:bg-green-950/50">
                    <div className="flex items-center gap-2 mb-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <h4 className="font-semibold text-green-900 dark:text-green-100">Phase 1: Core Booking System (Week 1)</h4>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <h5 className="font-medium text-green-800 dark:text-green-200 mb-1">Database Setup</h5>
                            <ul className="list-disc pl-5 space-y-1 text-green-700 dark:text-green-300 text-sm">
                                <li>Create ride_requests, rides, user_locations, trip_messages tables</li>
                                <li>Set up RLS policies for ride data security</li>
                                <li>Create database functions for automated ride matching</li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-medium text-green-800 dark:text-green-200 mb-1">Passenger Interface</h5>
                            <ul className="list-disc pl-5 space-y-1 text-green-700 dark:text-green-300 text-sm">
                                <li>Booking form with Mapbox location picker</li>
                                <li>Real-time ride status tracking component</li>
                                <li>Fare estimation and ETA display</li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-medium text-green-800 dark:text-green-200 mb-1">Rider Interface</h5>
                            <ul className="list-disc pl-5 space-y-1 text-green-700 dark:text-green-300 text-sm">
                                <li>Available rides list with proximity filtering</li>
                                <li>Accept/decline ride functionality</li>
                                <li>Active ride dashboard with navigation</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Phase 2 */}
                <div className="border border-blue-200 dark:border-blue-800 rounded-lg p-4 bg-blue-50 dark:bg-blue-950/50">
                    <div className="flex items-center gap-2 mb-3">
                        <Clock className="h-5 w-5 text-blue-600" />
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100">Phase 2: Real-time Communication (Week 2)</h4>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-1">Location Tracking</h5>
                            <ul className="list-disc pl-5 space-y-1 text-blue-700 dark:text-blue-300 text-sm">
                                <li>Background location service for active riders</li>
                                <li>Live location sharing during rides</li>
                                <li>Privacy controls for off-duty riders</li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-1">Ride Matching Engine</h5>
                            <ul className="list-disc pl-5 space-y-1 text-blue-700 dark:text-blue-300 text-sm">
                                <li>Distance-based automatic rider selection</li>
                                <li>Queue management for multiple requests</li>
                                <li>Fallback to manual dispatcher assignment</li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-1">Communication Features</h5>
                            <ul className="list-disc pl-5 space-y-1 text-blue-700 dark:text-blue-300 text-sm">
                                <li>In-ride messaging between passenger and rider</li>
                                <li>Predefined quick messages for common scenarios</li>
                                <li>Supabase Realtime integration for instant updates</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Phase 3 */}
                <div className="border border-purple-200 dark:border-purple-800 rounded-lg p-4 bg-purple-50 dark:bg-purple-950/50">
                    <div className="flex items-center gap-2 mb-3">
                        <Briefcase className="h-5 w-5 text-purple-600" />
                        <h4 className="font-semibold text-purple-900 dark:text-purple-100">Phase 3: Trip Management (Week 3)</h4>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <h5 className="font-medium text-purple-800 dark:text-purple-200 mb-1">Trip Lifecycle</h5>
                            <ul className="list-disc pl-5 space-y-1 text-purple-700 dark:text-purple-300 text-sm">
                                <li>Complete status flow: requested → matched → pickup → in_progress → completed</li>
                                <li>Cancellation handling and no-show management</li>
                                <li>Emergency procedures and safety features</li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-medium text-purple-800 dark:text-purple-200 mb-1">Payment Integration</h5>
                            <ul className="list-disc pl-5 space-y-1 text-purple-700 dark:text-purple-300 text-sm">
                                <li>Distance and time-based fare calculation</li>
                                <li>Basic surge pricing during peak hours</li>
                                <li>Payment method selection interface</li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-medium text-purple-800 dark:text-purple-200 mb-1">Dispatcher Tools</h5>
                            <ul className="list-disc pl-5 space-y-1 text-purple-700 dark:text-purple-300 text-sm">
                                <li>Manual dispatch interface for unmatched requests</li>
                                <li>Active ride monitoring and intervention tools</li>
                                <li>Emergency override capabilities</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    {
        value: "technical-implementation",
        icon: <FileCode2 className="h-6 w-6" />,
        title: "Technical Implementation Details",
        description: "Real-time architecture, API structure, and React hooks for MVP features.",
        content: (
            <div className="text-sm text-muted-foreground space-y-4">
                <div>
                    <h4 className="font-semibold text-foreground mb-2">Real-time Architecture with Supabase</h4>
                    <div className="bg-secondary/50 p-4 rounded-md mb-4">
                        <pre className="whitespace-pre-wrap font-mono text-xs">
{`// Supabase Realtime channels for live updates
const channels = {
  // New ride requests for available riders
  'ride_requests:*': 'Real-time ride request notifications',
  
  // Rider-specific updates (ride assignments, status changes)
  'rides:rider_id=X': 'Personal ride updates for riders',
  
  // Live location tracking during active trips
  'user_locations:*': 'Real-time location updates',
  
  // In-trip communication between passenger and rider
  'trip_messages:ride_id=X': 'Live chat during rides'
};`}
                        </pre>
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold text-foreground mb-2">Core React Hooks</h4>
                    <div className="bg-secondary/50 p-4 rounded-md mb-4">
                        <pre className="whitespace-pre-wrap font-mono text-xs">
{`// Custom hooks for ride management
useRideRequests()    // Subscribe to available ride requests
useActiveRide()      // Track current ride status and updates
useLocationTracking() // Manage real-time location updates
useTripChat()        // Handle in-ride messaging
useRideMatching()    // Automated ride assignment logic
usePaymentCalculation() // Fare calculation and payment processing`}
                        </pre>
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold text-foreground mb-2">API Route Structure</h4>
                    <div className="bg-secondary/50 p-4 rounded-md mb-4">
                        <pre className="whitespace-pre-wrap font-mono text-xs">
{`/api/rides/
├── request/route.ts      # POST - Create new ride request
├── accept/route.ts       # POST - Rider accepts ride request
├── status/route.ts       # PATCH - Update ride status
├── location/route.ts     # POST - Update user location
├── cancel/route.ts       # POST - Cancel ride request/trip
├── messages/route.ts     # GET/POST - Trip messaging
├── fare/route.ts         # GET - Calculate ride fare
└── dispatch/route.ts     # POST - Manual dispatcher assignment`}
                        </pre>
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold text-foreground mb-2">Success Metrics</h4>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Performance:</strong> Passenger can book a ride in &lt;30 seconds</li>
                        <li><strong>Real-time:</strong> Rider receives request within 5 seconds</li>
                        <li><strong>Location Accuracy:</strong> GPS updates every 5-10 seconds during trips</li>
                        <li><strong>Communication:</strong> Messages delivered in real-time (&lt;2 seconds)</li>
                        <li><strong>Reliability:</strong> Complete trip lifecycle works end-to-end</li>
                        <li><strong>Scalability:</strong> Support for 10+ concurrent rides</li>
                    </ul>
                </div>

                <div className="bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 rounded-lg p-3">
                    <p className="text-green-800 dark:text-green-200 text-sm">
                        <strong>Ready for Testing:</strong> With 6 existing test accounts (3 passengers, 3 riders), 
                        we can immediately test booking flows, ride matching, and communication features as they&apos;re implemented.
                    </p>
                </div>
            </div>
        )
    },
    {
        value: "testing-strategy",
        icon: <CheckCircle className="h-6 w-6" />,
        title: "MVP Testing Strategy",
        description: "Comprehensive testing approach using existing test accounts and real scenarios.",
        content: (
            <div className="text-sm text-muted-foreground space-y-4">
                <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">🧪 Available Test Accounts</h4>
                    <div className="grid md:grid-cols-2 gap-4 text-blue-800 dark:text-blue-200">
                        <div>
                            <h5 className="font-medium mb-2">👥 Passenger Accounts (3)</h5>
                            <ul className="space-y-1 text-sm font-mono">
                                <li>9171234567 - Maria Santos</li>
                                <li>9181234568 - Juan Dela Cruz</li>
                                <li>9191234569 - Ana Reyes</li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-medium mb-2">🚗 Rider Accounts (3)</h5>
                            <ul className="space-y-1 text-sm font-mono">
                                <li>9201234570 - Pedro Garcia</li>
                                <li>9211234571 - Roberto Mendoza</li>
                                <li>9221234572 - Carlos Villanueva</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold text-foreground mb-3">Manual Testing Scenarios</h4>
                    <div className="space-y-3">
                        <div className="border border-green-200 dark:border-green-800 rounded p-3 bg-green-50 dark:bg-green-950/50">
                            <h5 className="font-medium text-green-900 dark:text-green-100 mb-2">Basic Booking Flow</h5>
                            <ol className="list-decimal pl-5 space-y-1 text-green-800 dark:text-green-200 text-sm">
                                <li>Passenger (Maria Santos) books ride with pickup/dropoff locations</li>
                                <li>Available rider (Pedro Garcia) receives real-time notification</li>
                                <li>Rider accepts request within 30 seconds</li>
                                <li>Both parties receive confirmation and contact information</li>
                                <li>Complete trip through all status stages</li>
                            </ol>
                        </div>

                        <div className="border border-blue-200 dark:border-blue-800 rounded p-3 bg-blue-50 dark:bg-blue-950/50">
                            <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Competition & Matching</h5>
                            <ol className="list-decimal pl-5 space-y-1 text-blue-800 dark:text-blue-200 text-sm">
                                <li>Multiple riders (Pedro & Roberto) online simultaneously</li>
                                <li>Single passenger (Juan) requests ride</li>
                                <li>Test distance-based matching algorithm</li>
                                <li>Verify only closest rider gets notification first</li>
                                <li>Test fallback if first rider declines</li>
                            </ol>
                        </div>

                        <div className="border border-purple-200 dark:border-purple-800 rounded p-3 bg-purple-50 dark:bg-purple-950/50">
                            <h5 className="font-medium text-purple-900 dark:text-purple-100 mb-2">Real-time Communication</h5>
                            <ol className="list-decimal pl-5 space-y-1 text-purple-800 dark:text-purple-200 text-sm">
                                <li>During active ride, test in-trip messaging</li>
                                <li>Verify location updates appear in real-time</li>
                                <li>Test predefined quick messages</li>
                                <li>Verify message delivery notifications</li>
                                <li>Test emergency communication features</li>
                            </ol>
                        </div>

                        <div className="border border-orange-200 dark:border-orange-800 rounded p-3 bg-orange-50 dark:bg-orange-950/50">
                            <h5 className="font-medium text-orange-900 dark:text-orange-100 mb-2">Edge Cases & Error Handling</h5>
                            <ol className="list-decimal pl-5 space-y-1 text-orange-800 dark:text-orange-200 text-sm">
                                <li>Test ride cancellation by passenger</li>
                                <li>Test ride cancellation by rider</li>
                                <li>Verify no-show handling procedures</li>
                                <li>Test dispatcher manual intervention</li>
                                <li>Network connectivity issues simulation</li>
                            </ol>
                        </div>
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold text-foreground mb-2">Testing Tools & Verification</h4>
                    <ul className="list-disc pl-5 space-y-1">
                        <li><strong>Real-time Monitoring:</strong> Supabase dashboard for live data verification</li>
                        <li><strong>Location Testing:</strong> GPS simulation for route testing</li>
                        <li><strong>Load Testing:</strong> Multiple concurrent booking scenarios</li>
                        <li><strong>Mobile Testing:</strong> Cross-device compatibility verification</li>
                        <li><strong>Network Testing:</strong> Offline/online scenario handling</li>
                    </ul>
                </div>

                <div className="bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 rounded-lg p-3">
                    <p className="text-green-800 dark:text-green-200 text-sm">
                        <strong>Testing Readiness:</strong> All test credentials are documented in TEST_CREDENTIALS.md. 
                        Each phase can be tested immediately as features are implemented, ensuring rapid iteration and feedback.
                    </p>
                </div>
            </div>
        )
    },
]

export default function GuidePage() {
    const searchParams = useSearchParams();
    const topic = searchParams.get("topic");

    const cardAnimation = "animate-fade-in-up";
  
    const activeSection = allGuideSections.find(s => s.value === topic);
    const isSingleView = !!activeSection;

    const guideSections = isSingleView ? [activeSection] : allGuideSections;

    return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
            <div style={{ animationDelay: '100ms' }} className={cardAnimation}>
            <h2 className="text-3xl font-bold tracking-tight">Guide &amp; How-To&apos;s</h2>
            <p className="text-muted-foreground">
                {isSingleView 
                    ? `Showing details for: ${activeSection?.title || 'Topic'}`
                    : "Your central hub for understanding the GoTryke application."
                }
            </p>
            </div>
            {isSingleView && (
                <Link href="/guide" className={cardAnimation} style={{ animationDelay: '200ms' }}>
                    <Button variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Full Guide
                    </Button>
                </Link>
            )}
        </div>
        
        <div className="space-y-4">
            <Accordion type="single" collapsible className="w-full" value={topic ?? undefined}>
                {guideSections.map((section, index) => (
                    <AccordionItem key={section.value} value={section.value} style={{ animationDelay: `${200 + index * 100}ms` }} className={cardAnimation}>
                        <Link href={`/guide?topic=${section.value}`} scroll={false}>
                            <AccordionTrigger className="hover:no-underline">
                                <div className="flex items-start gap-4 text-left">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
                                        {section.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-base text-foreground">{section.title}</h3>
                                        <p className="text-sm text-muted-foreground font-normal">{section.description}</p>
                                    </div>
                                </div>
                            </AccordionTrigger>
                        </Link>
                        <AccordionContent className="pl-20 pr-4 pb-4">
                            {section.content}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>

            {!isSingleView && (
                <InfoCard 
                    icon={<LifeBuoy className="h-6 w-6" />}
                    title="Contact & Support"
                    description="Get in touch with the development team for help or feedback."
                    className={cn(cardAnimation, "lg:col-span-2")}
                    style={{ animationDelay: `${200 + guideSections.length * 100}ms` }}
                >
                    <div className="space-y-4 text-sm text-muted-foreground">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="font-semibold text-foreground">Email Support</p>
                                    <a href="mailto:support@gotrykeph.com" className="hover:underline">support@gotrykeph.com</a>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="font-semibold text-foreground">Phone Support</p>
                                    <a href="tel:+639171841002" className="hover:underline">+63 917 1841002</a>
                                </div>
                            </div>
                        </div>
                        <div>
                            <p className="font-semibold text-foreground mb-2">Direct Message</p>
                            <div className="flex flex-wrap gap-2">
                                {communicationLinks.map(({ href, Icon, label }) => (
                                    <a 
                                        key={label}
                                        href={href} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 rounded-full border bg-secondary px-3 py-1.5 transition-all hover:bg-secondary/80 hover:shadow-md"
                                    >
                                        <Icon className="h-5 w-5" />
                                        <span className="text-xs font-medium">{label}</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </InfoCard>
            )}
        </div>
    </div>
    );
}

    