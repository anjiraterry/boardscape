import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/crypto";
import { getSql } from "@/lib/db/neon";
import { isDatabaseConfigured } from "@/lib/env";
import type { AppRole, OrgType } from "@/modules/identity/schemas";

export interface SessionMembership {
  organizationId: string;
  organizationName: string;
  organizationType: OrgType;
  role: AppRole;
}

export interface SessionContext {
  userId: string;
  email: string;
  activeOrganizationId: string | null;
  memberships: SessionMembership[];
}

export async function getServerSession(): Promise<SessionContext | null> {
  if (!isDatabaseConfigured()) {
    return null;
  }

  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!rawToken) {
    return null;
  }

  const verified = verifySessionToken(rawToken);
  if (!verified) {
    return null;
  }

  try {
    const sql = getSql();
    const profileRows = await sql`
      SELECT id, email, status
      FROM profiles
      WHERE id = ${verified.userId}
      LIMIT 1
    `;
    const profile = profileRows[0];
    if (!profile || String(profile.status) !== "active") {
      return null;
    }

    const rows = await sql`
      SELECT
        m.organization_id,
        m.role,
        o.name AS organization_name,
        o.type AS organization_type
      FROM memberships m
      INNER JOIN organizations o ON o.id = m.organization_id
      WHERE m.user_id = ${verified.userId}
        AND m.is_active = true
        AND o.status = 'active'
    `;

    const memberships: SessionMembership[] = rows.map((row) => ({
      organizationId: String(row.organization_id),
      organizationName: String(row.organization_name ?? "Organization"),
      organizationType: (row.organization_type as OrgType) ?? "client",
      role: row.role as AppRole,
    }));

    return {
      userId: verified.userId,
      email: String(profile.email ?? verified.email),
      activeOrganizationId: memberships[0]?.organizationId ?? null,
      memberships,
    };
  } catch {
    return null;
  }
}
