import { describe, expect, it } from "vitest";
import {
  AuthorizationError,
  requireAdminAccess,
  requireOrgAccess,
  requirePermission,
} from "@/lib/auth/guards";
import type { SessionContext } from "@/lib/auth/session";
import {
  canAssignRole,
  getPermissionsForSession,
  hasPermission,
  isAdminStaff,
} from "@/modules/identity/policies";
import {
  ALL_PERMISSIONS,
  type AppRole,
  type OrgType,
} from "@/modules/identity/schemas";

function makeSession(
  role: AppRole,
  orgId = "org-1",
  orgType: OrgType = "agency"
): SessionContext {
  return {
    userId: `user-${role}`,
    email: `${role}@boardscape.ng`,
    activeOrganizationId: orgId,
    memberships: [
      {
        organizationId: orgId,
        organizationName: "Boardscape Test Org",
        organizationType: orgType,
        role,
      },
    ],
  };
}

describe("Admin RBAC & Security Policies", () => {
  it("grants all granular permissions to super_admin", () => {
    const superAdmin = makeSession("super_admin");
    expect(isAdminStaff(superAdmin)).toBe(true);
    for (const perm of ALL_PERMISSIONS) {
      expect(hasPermission(superAdmin, perm)).toBe(true);
    }
  });

  it("denies admin:manage and settings:manage to platform_admin while allowing operational admin permissions", () => {
    const platformAdmin = makeSession("platform_admin");
    expect(isAdminStaff(platformAdmin)).toBe(true);
    expect(hasPermission(platformAdmin, "users:manage")).toBe(true);
    expect(hasPermission(platformAdmin, "organizations:manage")).toBe(true);
    expect(hasPermission(platformAdmin, "roles:assign")).toBe(true);
    expect(hasPermission(platformAdmin, "accounts:suspend")).toBe(true);
    expect(hasPermission(platformAdmin, "listings:approve")).toBe(true);
    expect(hasPermission(platformAdmin, "settings:manage")).toBe(false);
    expect(hasPermission(platformAdmin, "admin:manage")).toBe(false);
    expect(() => requirePermission(platformAdmin, "admin:manage")).toThrow(
      AuthorizationError
    );
  });

  it("blocks unauthorized /admin access for non-admin roles", () => {
    const nonAdminRoles: AppRole[] = [
      "campaign_manager",
      "surveyor",
      "operator_user",
      "client_user",
    ];
    for (const role of nonAdminRoles) {
      const session = makeSession(role);
      expect(isAdminStaff(session)).toBe(false);
      expect(() => requireAdminAccess(session)).toThrow(AuthorizationError);
    }
    expect(() => requireAdminAccess(null)).toThrow(AuthorizationError);
  });

  it("allows admin_finance (Studio Manager) limited oversight permissions without settings, role assignment, or suspension", () => {
    const manager = makeSession("admin_finance");
    expect(isAdminStaff(manager)).toBe(true);
    expect(hasPermission(manager, "inventory:review")).toBe(true);
    expect(hasPermission(manager, "campaigns:view")).toBe(true);
    expect(hasPermission(manager, "audit:view")).toBe(true);
    expect(hasPermission(manager, "roles:assign")).toBe(false);
    expect(hasPermission(manager, "accounts:suspend")).toBe(false);
    expect(hasPermission(manager, "settings:manage")).toBe(false);
  });

  it("prevents privilege escalation when assigning roles", () => {
    const platformAdmin = makeSession("platform_admin");
    const superAdmin = makeSession("super_admin");
    const manager = makeSession("admin_finance");

    // Only super_admin can assign super_admin or platform_admin
    expect(canAssignRole(platformAdmin, "super_admin").allowed).toBe(false);
    expect(canAssignRole(platformAdmin, "platform_admin").allowed).toBe(false);
    expect(canAssignRole(platformAdmin, "admin_finance").allowed).toBe(true);
    expect(canAssignRole(platformAdmin, "surveyor").allowed).toBe(true);

    expect(canAssignRole(superAdmin, "super_admin").allowed).toBe(true);
    expect(canAssignRole(superAdmin, "platform_admin").allowed).toBe(true);

    expect(canAssignRole(manager, "surveyor").allowed).toBe(false);
    expect(Array.from(getPermissionsForSession(makeSession("client_user")))).toEqual([]);
  });

  it("enforces cross-organization isolation for non-agency users", () => {
    const operator = makeSession("operator_user", "org-operator-a", "operator");
    expect(() =>
      requireOrgAccess(operator, "org-operator-a")
    ).not.toThrow();
    expect(() =>
      requireOrgAccess(operator, "org-operator-b")
    ).toThrow(AuthorizationError);
  });
});
