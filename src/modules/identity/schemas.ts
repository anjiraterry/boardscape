import { z } from "zod";

export const OrgTypeSchema = z.enum(["agency", "client", "operator"]);
export type OrgType = z.infer<typeof OrgTypeSchema>;

export const AppRoleSchema = z.enum([
  "super_admin",
  "platform_admin",
  "admin_finance",
  "sales_account_manager",
  "media_planner",
  "surveyor",
  "verifier_ops",
  "campaign_manager",
  "client_user",
  "operator_user",
]);
export type AppRole = z.infer<typeof AppRoleSchema>;

export const PermissionSchema = z.enum([
  "users:manage",
  "organizations:manage",
  "roles:assign",
  "accounts:suspend",
  "inventory:review",
  "listings:approve",
  "campaigns:view",
  "settings:manage",
  "audit:view",
  "admin:manage",
]);
export type Permission = z.infer<typeof PermissionSchema>;

export const ALL_PERMISSIONS: Permission[] = PermissionSchema.options;

export const AGENCY_STAFF_ROLES: AppRole[] = [
  "super_admin",
  "platform_admin",
  "admin_finance",
  "sales_account_manager",
  "media_planner",
  "surveyor",
  "verifier_ops",
  "campaign_manager",
];

export const ADMIN_ACCESS_ROLES: AppRole[] = [
  "super_admin",
  "platform_admin",
  "admin_finance",
];

export const ROLE_METADATA: Record<
  AppRole,
  { label: string; scope: string; permissions: Permission[] }
> = {
  super_admin: {
    label: "Platform Super Admin",
    scope: "Full platform governance, admin access, security, and settings",
    permissions: [...ALL_PERMISSIONS],
  },
  platform_admin: {
    label: "Platform Admin",
    scope: "Platform user, organization, verification, and audit administration",
    permissions: [
      "users:manage",
      "organizations:manage",
      "roles:assign",
      "accounts:suspend",
      "inventory:review",
      "listings:approve",
      "campaigns:view",
      "audit:view",
    ],
  },
  admin_finance: {
    label: "Studio Manager (Admin & Finance)",
    scope: "Agency studio operations, inventory moderation, and commercial oversight",
    permissions: [
      "users:manage",
      "inventory:review",
      "listings:approve",
      "campaigns:view",
      "audit:view",
    ],
  },
  sales_account_manager: {
    label: "Studio Account Manager",
    scope: "Client CRM, quotes, and campaign intake",
    permissions: ["campaigns:view"],
  },
  media_planner: {
    label: "Media Planner",
    scope: "Atlas shortlists, proposals, and corridor planning",
    permissions: ["campaigns:view"],
  },
  surveyor: {
    label: "Field Agent",
    scope: "Field survey capture and posting proof submission",
    permissions: [],
  },
  verifier_ops: {
    label: "Verification Operations",
    scope: "Survey duplicate checks, operator authorization, and listing moderation",
    permissions: ["inventory:review", "listings:approve"],
  },
  campaign_manager: {
    label: "Campaign Manager",
    scope: "Campaign execution, bookings, and proof reporting",
    permissions: ["campaigns:view"],
  },
  operator_user: {
    label: "Operator Admin",
    scope: "Media-owner inventory and quote confirmation",
    permissions: [],
  },
  client_user: {
    label: "Advertiser / Client",
    scope: "Client portal proposals and campaign proof viewing",
    permissions: [],
  },
};
