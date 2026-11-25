import type { CampaignStatus } from "@/modules/campaigns/schemas";

const ALLOWED_CAMPAIGN_TRANSITIONS: Record<CampaignStatus, CampaignStatus[]> = {
  draft: ["approved", "cancelled"],
  approved: ["preproduction", "blocked", "cancelled"],
  preproduction: ["ready_to_launch", "blocked", "cancelled"],
  ready_to_launch: ["installation_in_progress", "blocked", "paused", "cancelled"],
  installation_in_progress: ["live", "blocked", "makegood_required"],
  live: ["completed", "paused", "makegood_required"],
  completed: ["reported", "makegood_required"],
  reported: [],
  blocked: ["preproduction", "ready_to_launch", "cancelled"],
  paused: ["live", "cancelled"],
  cancelled: [],
  makegood_required: ["installation_in_progress", "completed"],
};

export interface CampaignTransitionContext {
  incompleteRequiredTasks?: number;
  hasApprovedCreative?: boolean;
  hasApprovedProofs?: boolean;
}

export function canTransitionCampaignStatus(
  from: CampaignStatus,
  to: CampaignStatus,
  ctx: CampaignTransitionContext = {}
): { allowed: boolean; reason?: string } {
  const validTargets = ALLOWED_CAMPAIGN_TRANSITIONS[from] ?? [];
  if (!validTargets.includes(to)) {
    return {
      allowed: false,
      reason: `Invalid campaign transition from '${from}' to '${to}'.`,
    };
  }

  if (to === "ready_to_launch" || to === "live") {
    if ((ctx.incompleteRequiredTasks ?? 0) > 0) {
      return {
        allowed: false,
        reason: "Cannot advance campaign: mandatory approval/readiness tasks remain incomplete (FR-021).",
      };
    }
    if (ctx.hasApprovedCreative === false) {
      return {
        allowed: false,
        reason: "Cannot advance campaign: approved creative asset is required.",
      };
    }
  }

  if (to === "reported" && ctx.hasApprovedProofs === false) {
    return {
      allowed: false,
      reason: "Cannot mark campaign reported without reviewed proof-of-posting (FR-022).",
    };
  }

  return { allowed: true };
}
