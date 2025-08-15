
"use client"

import * as React from "react"
import { Cross2Icon } from "@radix-ui/react-icons"
import { Table } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "./data-table-view-options"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { roles, statuses } from "../data/data"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"
import { AddUserForm } from "./add-user-form"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const [isAddUserOpen, setIsAddUserOpen] = React.useState(false)

  const preFilteredRows = table.getPreFilteredRowModel().rows;
  const todas = React.useMemo(() => {
    const todaSet = new Set<string>();
    preFilteredRows.forEach(row => {
        const toda = (row.original as any).toda;
        if(toda) todaSet.add(toda)
    })
    return Array.from(todaSet).map(toda => ({ label: toda, value: toda }));
  }, [preFilteredRows])

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter by name..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn("status") && (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="Status"
            options={statuses}
          />
        )}
        {table.getColumn("role") && (
          <DataTableFacetedFilter
            column={table.getColumn("role")}
            title="Role"
            options={roles}
          />
        )}
        {table.getColumn("toda") && todas.length > 0 && (
            <DataTableFacetedFilter
                column={table.getColumn("toda")}
                title="TODA"
                options={todas}
            />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
                <Button variant="default" size="sm">Add User</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                    <DialogDescription>
                        Fill in the details below to add a new user to the system.
                    </DialogDescription>
                </DialogHeader>
                <AddUserForm setOpen={setIsAddUserOpen} />
            </DialogContent>
        </Dialog>
        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
}
