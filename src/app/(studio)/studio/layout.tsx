import { redirect } from "next/navigation";
import { StudioSidebar } from "@/components/studio/studio-sidebar";
import { getServerSession } from "@/lib/auth/session";
import { isAgencyStaff } from "@/modules/identity/policies";

export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }
  if (!isAgencyStaff(session)) {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground lg:flex-row">
      <StudioSidebar />
      <main className="flex-1 px-4 py-8 sm:px-8 sm:py-10">{children}</main>
    </div>
  );
}
