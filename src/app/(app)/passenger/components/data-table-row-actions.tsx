
"use client"

import { DotsHorizontalIcon } from "@radix-ui/react-icons"
import { Row } from "@tanstack/react-table"
import React from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { userSchema } from "@/app/(app)/admin/data/schema"
import { EditUserForm } from "@/app/(app)/admin/components/edit-user-form"
import { useToast } from "@/hooks/use-toast"
import { UserProfileCard } from "@/app/(app)/admin/components/user-profile-card"
import { deleteUser } from "@/lib/supabase-admin-functions"


interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const { toast } = useToast();
  const user = userSchema.parse(row.original)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isProfileOpen, setIsProfileOpen] = React.useState(false)

  const handleDelete = async () => {
    try {
      await deleteUser(user.id);
      toast({
        title: "User Deleted",
        description: `User ${user.name} has been deleted.`,
        variant: "destructive"
      })
      // Note: You might want to trigger a data refresh here
    } catch (error) {
       toast({
        title: "Error Deleting User",
        description: "An unexpected error occurred.",
        variant: "destructive"
      })
    }
  }

  const handleResetPin = () => {
    toast({
      title: "PIN Reset Sent",
      description: `A PIN reset code has been sent to ${user.name}.`,
    })
  }

  return (
    <>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                variant="ghost"
                className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                >
                <DotsHorizontalIcon className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
                <DialogTrigger asChild onSelect={() => setIsProfileOpen(true)}>
                    <DropdownMenuItem>
                        View Profile
                    </DropdownMenuItem>
                </DialogTrigger>
                <DialogTrigger asChild onSelect={() => setIsEditDialogOpen(true)}>
                    <DropdownMenuItem>
                        Edit
                    </DropdownMenuItem>
                </DialogTrigger>
                <DropdownMenuItem onClick={handleResetPin}>Reset PIN</DropdownMenuItem>
                <DropdownMenuItem>Favorite</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete}>
                Delete
                <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
                </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>User Profile</DialogTitle>
                </DialogHeader>
                <UserProfileCard user={user} setOpen={setIsProfileOpen} />
            </DialogContent>
        </Dialog>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit User</DialogTitle>
            </DialogHeader>
            <EditUserForm user={user} setOpen={setIsEditDialogOpen} />
        </DialogContent>
      </Dialog>
    </>
  )
}
