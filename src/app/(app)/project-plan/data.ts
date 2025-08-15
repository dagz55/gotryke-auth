
export type Assignee = { id: number; name: string; avatar: string; };
export type Task = { 
    id: string; 
    text: string; 
    status: 'To Do' | 'In Progress' | 'Blocked' | 'Done'; 
    urgency: 'Low' | 'Medium' | 'High' | 'Critical';
    requestedBy?: string;
    value?: 'Low' | 'Medium' | 'High';
    timeline?: { from: string; to?: string };
    assignees?: Assignee[];
};
export type Phase = { id: number; title: string; status: 'done' | 'in_progress' | 'todo'; description: string; tasks: Task[]; };

export const assignees: Assignee[] = [
    { id: 1, name: 'Dagz', avatar: 'https://placehold.co/32x32.png?text=D' },
    { id: 2, name: 'Ju', avatar: 'https://placehold.co/32x32.png?text=J' },
    { id: 3, name: 'BadDog', avatar: 'https://placehold.co/32x32.png?text=B' },
    { id: 4, name: 'TopD', avatar: 'https://placehold.co/32x32.png?text=T' }
]

export const initialPhases: Phase[] = [
  {
    id: 1,
    title: 'Phase 1: Initial Setup & Admin Dashboard Foundation',
    status: 'done',
    description: 'Laying the groundwork for the application, setting up the core structure, and creating the initial dashboard layout.',
    tasks: [
      { id: 'task-1', text: 'Setup Next.js project with TypeScript and Tailwind CSS.', status: 'Done', urgency: 'High', requestedBy: "Client", value: "High", timeline: { from: new Date(2025, 5, 1).toISOString(), to: new Date(2025, 5, 2).toISOString() }, assignees: [assignees[0]] },
      { id: 'task-2', text: 'Integrate ShadCN UI library for a professional component set.', status: 'Done', urgency: 'High', requestedBy: "Client", value: "High", timeline: { from: new Date(2025, 5, 3).toISOString(), to: new Date(2025, 5, 4).toISOString() }, assignees: [assignees[1]] },
      { id: 'task-3', text: 'Create a basic layout for the admin dashboard with a sidebar.', status: 'Done', urgency: 'Medium', requestedBy: "Client", value: "Medium", timeline: { from: new Date(2025, 5, 5).toISOString(), to: new Date(2025, 5, 7).toISOString() }, assignees: [assignees[1]] },
    ]
  },
  {
    id: 2,
    title: 'Phase 2: User Management UI/UX',
    status: 'in_progress',
    description: 'Building out the client-side of the User Management system with mock data to create a fully interactive interface.',
    tasks: [
      { id: 'task-6', text: 'Create a detailed user management table with relevant columns.', status: 'In Progress', urgency: 'High', requestedBy: "Management", value: "High", timeline: { from: new Date(2025, 5, 8).toISOString(), to: new Date(2025, 5, 12).toISOString() }, assignees: [assignees[0], assignees[1]] },
      { id: 'task-7', text: 'Populate the table with realistic mock data.', status: 'To Do', urgency: 'Medium', requestedBy: "Dev Team", value: "Medium", timeline: { from: new Date(2025, 5, 10).toISOString(), to: new Date(2025, 5, 11).toISOString() }, assignees: [assignees[3]] },
      { id: 'task-10', text: 'Implement a "Reset PIN" action with a toast notification for feedback.', status: 'Blocked', urgency: 'Low', requestedBy: "UX Team", value: "Low", timeline: { from: new Date(2025, 5, 15).toISOString(), to: new Date(2025, 5, 16).toISOString() }, assignees: [assignees[0]] },
    ]
  },
  {
    id: 3,
    title: 'Phase 3: Authentication & Backend Integration',
    status: 'todo',
    description: 'Connecting the application to a backend service to handle real user data, authentication, and database operations.',
    tasks: [
      { id: 'task-12', text: 'Integrate Firebase Authentication for secure login.', status: 'To Do', urgency: 'Critical', requestedBy: "Client", value: "High", timeline: undefined, assignees: [assignees[2], assignees[3]] },
      { id: 'task-13', text: 'Implement full login and signup functionality.', status: 'To Do', urgency: 'Critical', requestedBy: "Client", value: "High", timeline: undefined, assignees: [assignees[0], assignees[1]] },
    ]
  },
  {
    id: 4,
    title: 'Phase 4: Advanced Features & Refinements',
    status: 'todo',
    description: 'Adding more sophisticated features, real-time updates, and polishing the application for a production-ready experience.',
    tasks: [
       { id: 'task-16', text: 'Implement role-based access control (RBAC) to restrict features.', status: 'To Do', urgency: 'High', requestedBy: "Security Team", value: "High", timeline: undefined, assignees: [assignees[2]] }
    ]
  }
];
