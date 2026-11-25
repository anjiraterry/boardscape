import { describe, expect, it } from "vitest";
import { AuthorizationError, requireOrgAccess, requireRole } from "@/lib/auth/guards";
import type { SessionContext } from "@/lib/auth/session";

const orgASession: SessionContext = {
  userId: "user-a",
  email: "client@orga.ng",
  activeOrganizationId: "org-a",
  memberships: [
    {
      organizationId: "org-a",
      organizationName: "Org A",
      organizationType: "client",
      role: "client_user",
    },
  ],
};

describe("Tenant Isolation & RBAC Guards (FR-001)", () => {
  it("denies Org A client from accessing Org B resources", () => {
    expect(() => requireOrgAccess(orgASession, "org-b")).toThrow(AuthorizationError);
  });

  it("allows Org A client to access Org A resources", () => {
    expect(requireOrgAccess(orgASession, "org-a").userId).toBe("user-a");
  });

  it("denies client_user from verifier_ops studio actions", () => {
    expect(() => requireRole(orgASession, ["verifier_ops", "admin_finance"])).toThrow(
      AuthorizationError
    );
  });
});
