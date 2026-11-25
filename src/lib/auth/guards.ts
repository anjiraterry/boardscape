import type { SessionContext } from "@/lib/auth/session";
import {
  canAccessOrganization,
  hasAnyRole,
  hasPermission,
  isAdminStaff,
} from "@/modules/identity/policies";
import type { AppRole, Permission } from "@/modules/identity/schemas";

export class AuthorizationError extends Error {
  readonly statusCode: number;
  constructor(message: string, statusCode = 403) {
    super(message);
    this.name = "AuthorizationError";
    this.statusCode = statusCode;
  }
}

export function requireAuthenticated(session: SessionContext | null): SessionContext {
  if (!session) {
    throw new AuthorizationError("Authentication required", 401);
  }
  return session;
}

export function requireRole(session: SessionContext | null, allowed: AppRole[]): SessionContext {
  const authed = requireAuthenticated(session);
  if (!hasAnyRole(authed, allowed)) {
    throw new AuthorizationError("Insufficient permissions for this action", 403);
  }
  return authed;
}

export function requirePermission(
  session: SessionContext | null,
  permission: Permission
): SessionContext {
  const authed = requireAuthenticated(session);
  if (!hasPermission(authed, permission)) {
    throw new AuthorizationError(
      `Missing required permission: ${permission}`,
      403
    );
  }
  return authed;
}

export function requireAdminAccess(session: SessionContext | null): SessionContext {
  const authed = requireAuthenticated(session);
  if (!isAdminStaff(authed)) {
    throw new AuthorizationError("Platform administration access required", 403);
  }
  return authed;
}

export function requireOrgAccess(
  session: SessionContext | null,
  targetOrgId: string,
  allowAgencyStaff = true
): SessionContext {
  const authed = requireAuthenticated(session);
  if (!canAccessOrganization(authed, targetOrgId, allowAgencyStaff)) {
    throw new AuthorizationError("Resource belongs to another organization", 403);
  }
  return authed;
}
