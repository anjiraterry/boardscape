import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { getServerSession } from "@/lib/auth/session";
import { isAdminStaff } from "@/modules/identity/policies";
import { ROLE_METADATA } from "@/modules/identity/schemas";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }
  if (!isAdminStaff(session)) {
    redirect("/");
  }

  const activeMembership =
    session.memberships.find(
      (m) => m.organizationId === session.activeOrganizationId
    ) ?? session.memberships[0];
  const roleMeta = activeMembership
    ? ROLE_METADATA[activeMembership.role]
    : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground lg:flex-row">
      <AdminSidebar
        actorName={session.email}
        actorRoleLabel={roleMeta?.label ?? activeMembership?.role ?? "Admin"}
      />
      <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
