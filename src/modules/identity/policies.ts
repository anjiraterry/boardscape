import type { SessionContext } from "@/lib/auth/session";
import {
  ADMIN_ACCESS_ROLES,
  AGENCY_STAFF_ROLES,
  ROLE_METADATA,
  type AppRole,
  type Permission,
} from "@/modules/identity/schemas";

export function isAgencyStaff(session: SessionContext): boolean {
  return session.memberships.some(
    (m) => m.organizationType === "agency" && AGENCY_STAFF_ROLES.includes(m.role)
  );
}

export function isAdminStaff(session: SessionContext): boolean {
  return session.memberships.some(
    (m) => m.organizationType === "agency" && ADMIN_ACCESS_ROLES.includes(m.role)
  );
}

export function hasAnyRole(session: SessionContext, allowed: AppRole[]): boolean {
  return session.memberships.some((m) => allowed.includes(m.role));
}

export function getPermissionsForSession(session: SessionContext): Set<Permission> {
  const perms = new Set<Permission>();
  for (const m of session.memberships) {
    const meta = ROLE_METADATA[m.role];
    if (meta) {
      for (const p of meta.permissions) {
        perms.add(p);
      }
    }
  }
  return perms;
}

export function hasPermission(
  session: SessionContext,
  permission: Permission
): boolean {
  return getPermissionsForSession(session).has(permission);
}

/**
 * Prevents privilege escalation: an administrator can only assign roles whose
 * permissions are a subset of their own permissions, and only a `super_admin`
 * can assign `super_admin` or `platform_admin`.
 */
export function canAssignRole(
  actor: SessionContext,
  targetRole: AppRole
): { allowed: boolean; reason?: string } {
  if (!hasPermission(actor, "roles:assign")) {
    return { allowed: false, reason: "Missing roles:assign permission." };
  }

  const isSuper = hasAnyRole(actor, ["super_admin"]);
  if ((targetRole === "super_admin" || targetRole === "platform_admin") && !isSuper) {
    return {
      allowed: false,
      reason: "Only a Platform Super Admin can assign administrative roles.",
    };
  }

  const actorPerms = getPermissionsForSession(actor);
  const targetPerms = ROLE_METADATA[targetRole]?.permissions ?? [];
  for (const p of targetPerms) {
    if (!actorPerms.has(p)) {
      return {
        allowed: false,
        reason: `Cannot grant role "${targetRole}" containing unheld permission "${p}".`,
      };
    }
  }

  return { allowed: true };
}

export function canAccessOrganization(
  session: SessionContext,
  targetOrgId: string,
  allowAgencyStaff = true
): boolean {
  if (allowAgencyStaff && isAgencyStaff(session)) {
    return true;
  }
  return session.memberships.some((m) => m.organizationId === targetOrgId);
}
