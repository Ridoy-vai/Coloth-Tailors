import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import DashboardLayout from "../component/DashboardLayout";
// import DashboardLayout from "@/components/DashboardLayout";

// Route prefixes that require a specific role.
const ROLE_ROUTES: Record<string, string[]> = {
  "/dashboard/admin": ["admin"],
  "/dashboard/user": ["user"],
};

const VALID_ROLES = ["admin", "user"];

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hdrs = await headers();
  const pathname = hdrs.get("x-pathname") ?? "/dashboard";

  const session = await auth.api.getSession({ headers: hdrs });

  if (!session) {
    redirect(`/login?redirect=${pathname}`);
  }

  // Fallback to "user" if role is missing/invalid
  const rawRole = session.user?.role;
  const role = VALID_ROLES.includes(rawRole as string) ? (rawRole as string) : "user";

  const ownDashboard = `/dashboard/${role}`;

  for (const [prefix, allowedRoles] of Object.entries(ROLE_ROUTES)) {
    const isThisRouteRoleRestricted = pathname.startsWith(prefix);
    const roleNotAllowed = !allowedRoles.includes(role);

    if (isThisRouteRoleRestricted && roleNotAllowed) {
      if (pathname === ownDashboard) {
        redirect("/");
      }
      redirect(ownDashboard);
    }
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}