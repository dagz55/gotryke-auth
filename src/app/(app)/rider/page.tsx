
import { columns } from "./components/columns"
import { DataTable } from "@/app/(app)/admin/components/data-table"
import { getUsersByRole, AdminUser } from "@/lib/supabase-admin-functions"

async function getUsers(): Promise<AdminUser[]> {
  const users = await getUsersByRole('rider');
  return users
}

export default async function RiderPage() {
  const users = await getUsers()

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
            <h2 className="text-3xl font-bold tracking-tight">Rider Management</h2>
            <p className="text-muted-foreground">
                Manage all riders in the system.
            </p>
        </div>
      </div>
      <DataTable data={users} columns={columns} />
    </div>
  );
}
