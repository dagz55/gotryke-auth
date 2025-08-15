

"use client"

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, Circle, GripVertical, Pencil, Plus, Radio, Trash, Calendar as CalendarIcon, User, Flag, Star, BarChart2, Tag, ChevronDown, Check, UserPlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, parseISO } from "date-fns";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { initialPhases, assignees as allAssignees, type Phase, type Task, type Assignee } from "./data";


const TaskCard = ({ task, onEdit, onDelete }: { task: Task, onEdit: () => void, onDelete: () => void }) => {
    const statusConfig = {
        'To Do': { color: 'bg-gray-500', icon: <Circle className="h-3 w-3" /> },
        'In Progress': { color: 'bg-blue-500', icon: <Radio className="h-3 w-3" /> },
        'Blocked': { color: 'bg-red-500', icon: <Circle className="h-3 w-3" /> },
        'Done': { color: 'bg-green-500', icon: <CheckCircle className="h-3 w-3" /> },
    }
    const urgencyConfig = {
        'Low': { color: 'text-green-600', icon: <Flag className="h-3 w-3" /> },
        'Medium': { color: 'text-yellow-600', icon: <Flag className="h-3 w-3" /> },
        'High': { color: 'text-orange-600', icon: <Flag className="h-3 w-3" /> },
        'Critical': { color: 'text-red-600', icon: <Flag className="h-3 w-3" /> },
    }
    const valueConfig = {
        'Low': { color: 'text-gray-500', icon: <BarChart2 className="h-3 w-3" /> },
        'Medium': { color: 'text-blue-500', icon: <BarChart2 className="h-3 w-3" /> },
        'High': { color: 'text-purple-500', icon: <BarChart2 className="h-3 w-3" /> },
    }
    const timelineDate = task.timeline?.from ? parseISO(task.timeline.from) : undefined;
    const timelineDateTo = task.timeline?.to ? parseISO(task.timeline.to) : undefined;

    return (
        <Card className="group bg-card/80 hover:bg-card transition-all">
            <CardContent className="p-3 space-y-3">
                <div className="flex justify-between items-start">
                    <p className="text-sm font-medium flex-1">{task.text}</p>
                    <div className="opacity-0 group-hover:opacity-100 flex items-center">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onEdit}><Pencil className="h-3 w-3" /></Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive"><Trash className="h-3 w-3" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>This will permanently delete this task.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={onDelete}>Continue</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                        <Badge variant="secondary" className={cn("flex items-center gap-1.5", statusConfig[task.status].color, 'text-white')}>
                            {statusConfig[task.status].icon}
                            {task.status}
                        </Badge>
                        <span className={cn("flex items-center gap-1", urgencyConfig[task.urgency].color)}>
                            {urgencyConfig[task.urgency].icon}
                            {task.urgency}
                        </span>
                        {task.value && (
                             <span className={cn("flex items-center gap-1", valueConfig[task.value].color)}>
                                {valueConfig[task.value].icon}
                                {task.value} Value
                            </span>
                        )}
                       
                    </div>
                     <div className="flex -space-x-2">
                        {task.assignees?.map(assignee => (
                             <Avatar key={assignee.id} className="h-6 w-6 border-2 border-card">
                                <AvatarImage src={assignee.avatar} alt={assignee.name} />
                                <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                        ))}
                    </div>
                </div>
                {(timelineDate || task.requestedBy) && (
                    <div className="border-t pt-2 text-xs text-muted-foreground space-y-2">
                        {timelineDate && (
                            <div className="flex items-center gap-1.5">
                                <CalendarIcon className="h-3 w-3" />
                                <span>{format(timelineDate, "MMM d")} - {timelineDateTo ? format(timelineDateTo, "MMM d, yyyy") : 'No end date'}</span>
                            </div>
                        )}
                        {task.requestedBy && (
                            <div className="flex items-center gap-1.5">
                                <Tag className="h-3 w-3" />
                                <span>Requested by {task.requestedBy}</span>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

const AddEditTaskDialog = ({
    isOpen,
    onOpenChange,
    onSave,
    task,
    phaseId
} : {
    isOpen: boolean,
    onOpenChange: (isOpen: boolean) => void,
    onSave: (phaseId: number, task: Omit<Task, 'id' | 'assignees'> & { assignees?: Assignee[] }) => void,
    task?: Task,
    phaseId: number,
}) => {
    const [text, setText] = React.useState(task?.text || "");
    const [status, setStatus] = React.useState<Task['status']>(task?.status || 'To Do');
    const [urgency, setUrgency] = React.useState<Task['urgency']>(task?.urgency || 'Medium');
    const [value, setValue] = React.useState<Task['value']>(task?.value || 'Medium');
    const [requestedBy, setRequestedBy] = React.useState(task?.requestedBy || "");
    const [timeline, setTimeline] = React.useState<DateRange | undefined>(
        task?.timeline?.from ? { from: parseISO(task.timeline.from), to: task.timeline.to ? parseISO(task.timeline.to) : undefined } : undefined
    );
    const [selectedAssignees, setSelectedAssignees] = React.useState<Assignee[]>(task?.assignees || []);

    const handleSave = () => {
        if(text.trim()) {
            onSave(phaseId, { 
                text, 
                status, 
                urgency, 
                value, 
                requestedBy, 
                timeline: timeline?.from ? { from: timeline.from.toISOString(), to: timeline.to?.toISOString() } : undefined, 
                assignees: selectedAssignees 
            });
            onOpenChange(false);
        }
    }

    const toggleAssignee = (assignee: Assignee) => {
        setSelectedAssignees(prev => 
            prev.find(a => a.id === assignee.id)
                ? prev.filter(a => a.id !== assignee.id)
                : [...prev, assignee]
        )
    }

    React.useEffect(() => {
        if (isOpen) {
            setText(task?.text || "");
            setStatus(task?.status || 'To Do');
            setUrgency(task?.urgency || 'Medium');
            setValue(task?.value || 'Medium');
            setRequestedBy(task?.requestedBy || "");
            setTimeline(task?.timeline?.from ? { from: parseISO(task.timeline.from), to: task.timeline.to ? parseISO(task.timeline.to) : undefined } : undefined);
            setSelectedAssignees(task?.assignees || []);
        }
    }, [isOpen, task]);

    return (
         <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{task ? 'Edit Task' : 'Add New Task'}</DialogTitle>
                </DialogHeader>
                <div className="py-4 grid gap-6">
                    <div>
                        <Label htmlFor="task-text">Task Description</Label>
                        <Textarea id="task-text" value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter task description..." />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="task-status">Status</Label>
                            <Select value={status} onValueChange={(val) => setStatus(val as Task['status'])}>
                                <SelectTrigger id="task-status"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="To Do">To Do</SelectItem>
                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                    <SelectItem value="Blocked">Blocked</SelectItem>
                                    <SelectItem value="Done">Done</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="task-urgency">Urgency</Label>
                            <Select value={urgency} onValueChange={(val) => setUrgency(val as Task['urgency'])}>
                                <SelectTrigger id="task-urgency"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Low">Low</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="High">High</SelectItem>
                                    <SelectItem value="Critical">Critical</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                     </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="task-value">Business Value</Label>
                            <Select value={value} onValueChange={(val) => setValue(val as Task['value'])}>
                                <SelectTrigger id="task-value"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Low">Low</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="High">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div>
                            <Label htmlFor="task-requestedBy">Requested By</Label>
                            <Input id="task-requestedBy" value={requestedBy} onChange={(e) => setRequestedBy(e.target.value)} placeholder="e.g. Client" />
                        </div>
                      </div>
                     <div>
                        <Label>Timeline</Label>
                         <Popover>
                            <PopoverTrigger asChild>
                                <Button id="date" variant="outline" className={cn("w-full justify-start text-left font-normal", !timeline && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {timeline?.from ? ( timeline.to ? (<> {format(timeline.from, "LLL dd, y")} - {format(timeline.to, "LLL dd, y")} </>) : (format(timeline.from, "LLL dd, y"))) : (<span>Pick a date range</span>) }
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar initialFocus mode="range" defaultMonth={timeline?.from} selected={timeline} onSelect={setTimeline} numberOfMonths={2} />
                            </PopoverContent>
                        </Popover>
                     </div>
                      <div>
                        <Label>Assignees</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start font-normal">
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    {selectedAssignees.length > 0 ? `${selectedAssignees.length} selected` : "Assign users"}
                                    <ChevronDown className="ml-auto h-4 w-4 text-muted-foreground" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                <div className="p-2 space-y-1">
                                    {allAssignees.map(assignee => {
                                        const isSelected = selectedAssignees.some(a => a.id === assignee.id);
                                        return (
                                            <Button variant="ghost" key={assignee.id} onClick={() => toggleAssignee(assignee)} className="w-full justify-start">
                                                <div className={cn("mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary", isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible")}>
                                                    <Check className="h-4 w-4" />
                                                </div>
                                                <Avatar className="h-6 w-6 mr-2">
                                                    <AvatarImage src={assignee.avatar} />
                                                    <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span>{assignee.name}</span>
                                            </Button>
                                        )
                                    })}
                                </div>
                            </PopoverContent>
                        </Popover>
                      </div>

                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <Button onClick={handleSave}>Save Task</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

const PhaseColumn = ({ phase, onTaskUpdate, onTaskDelete, onTaskAdd }: { 
    phase: Phase; 
    onTaskUpdate: (phaseId: number, taskId: string, updatedTask: Omit<Task, 'id'>) => void;
    onTaskDelete: (phaseId: number, taskId: string) => void;
    onTaskAdd: (phaseId: number, newTask: Omit<Task, 'id'>) => void;
}) => {
    const [isAddTaskOpen, setIsAddTaskOpen] = React.useState(false);
    const [editingTask, setEditingTask] = React.useState<Task | null>(null);

    const StatusIcon = phase.status === 'done' ? CheckCircle : phase.status === 'in_progress' ? Radio : Circle;
    const color = phase.status === 'done' ? 'text-green-500' : phase.status === 'in_progress' ? 'text-blue-500' : 'text-muted-foreground';

    const handleSaveTask = (phaseId: number, taskData: Omit<Task, 'id'>) => {
        if (editingTask) {
            onTaskUpdate(phaseId, editingTask.id, taskData);
        } else {
            onTaskAdd(phaseId, taskData);
        }
        setEditingTask(null);
    }
  
    return (
      <Card className="flex-1 flex flex-col h-full border-0 md:border bg-secondary/40">
        <CardHeader className="border-b">
          <div className="flex items-start gap-4">
              <StatusIcon className={`mt-1 h-5 w-5 flex-shrink-0 ${color}`} />
              <div className="flex-1">
                  <CardTitle className={`text-lg ${color}`}>{phase.title}</CardTitle>
                  <CardDescription className="text-xs mt-1">{phase.description}</CardDescription>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingTask(null); setIsAddTaskOpen(true);}}>
                  <Plus className="h-4 w-4" />
              </Button>
          </div>
        </CardHeader>
        <CardContent className="p-2 space-y-2 overflow-y-auto">
          {phase.tasks.map(task => (
            <TaskCard 
                key={task.id}
                task={task}
                onEdit={() => {
                    setEditingTask(task);
                    setIsAddTaskOpen(true);
                }}
                onDelete={() => onTaskDelete(phase.id, task.id)}
            />
          ))}
        </CardContent>
         <AddEditTaskDialog 
            isOpen={isAddTaskOpen}
            onOpenChange={setIsAddTaskOpen}
            onSave={handleSaveTask}
            task={editingTask || undefined}
            phaseId={phase.id}
         />
      </Card>
    )
}

const LOCAL_STORAGE_KEY = 'gotryke-project-plan';

export default function ProjectPlanPage() {
  const [phases, setPhases] = React.useState<Phase[]>(() => {
    if (typeof window === 'undefined') {
        return initialPhases;
    }
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    return savedData ? JSON.parse(savedData) : initialPhases;
  });

  React.useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(phases));
  }, [phases]);


  const handleTaskAdd = (phaseId: number, newTaskData: Omit<Task, 'id'>) => {
      setPhases(prevPhases => prevPhases.map(phase => {
          if (phase.id === phaseId) {
              const newTask: Task = {
                  id: crypto.randomUUID(),
                  ...newTaskData
              };
              return { ...phase, tasks: [...phase.tasks, newTask] };
          }
          return phase;
      }));
  };

  const handleTaskUpdate = (phaseId: number, taskId: string, updatedTaskData: Omit<Task, 'id'>) => {
      setPhases(prevPhases => prevPhases.map(phase => {
          if (phase.id === phaseId) {
              return {
                  ...phase,
                  tasks: phase.tasks.map(task => 
                      task.id === taskId ? { ...task, ...updatedTaskData } : task
                  )
              };
          }
          return phase;
      }));
  };

  const handleTaskDelete = (phaseId: number, taskId: string) => {
      setPhases(prevPhases => prevPhases.map(phase => {
          if (phase.id === phaseId) {
              return {
                  ...phase,
                  tasks: phase.tasks.filter(task => task.id !== taskId)
              };
          }
          return phase;
      }));
  };

  return (
    <div className="flex flex-col h-full">
      <header className="p-4 md:p-8 md:pb-4">
          <h2 className="text-3xl font-bold tracking-tight">Project Plan &amp; Progress</h2>
          <p className="text-muted-foreground">
            A Kanban-style board to track development tasks and timelines.
          </p>
      </header>

      <div className="flex-1 p-4 md:p-8 md:pt-0">
            <ResizablePanelGroup
            direction="horizontal"
            className="h-full max-h-[calc(100vh-12rem)] rounded-lg border"
            >
            {phases.map((phase, index) => (
                <React.Fragment key={phase.id}>
                    <ResizablePanel defaultSize={{ width: "25%", height: "auto" }} minWidth={200}>
                        <PhaseColumn 
                            phase={phase}
                            onTaskAdd={handleTaskAdd}
                            onTaskUpdate={handleTaskUpdate}
                            onTaskDelete={handleTaskDelete}
                        />
                    </ResizablePanel>
                    {index < phases.length - 1 && (
                        <ResizableHandle withHandle />
                    )}
                </React.Fragment>
            ))}
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
