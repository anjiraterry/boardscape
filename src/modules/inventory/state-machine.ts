import type { FaceState } from "@/modules/inventory/schemas";

const ALLOWED_FACE_TRANSITIONS: Record<FaceState, FaceState[]> = {
  draft: ["surveyed", "archived"],
  surveyed: ["awaiting_operator", "archived"],
  awaiting_operator: ["verified_private", "suspended", "archived"],
  verified_private: ["published", "awaiting_operator", "suspended", "archived"],
  published: ["awaiting_operator", "suspended", "archived"],
  suspended: ["awaiting_operator", "verified_private", "archived"],
  archived: [],
};

export interface FaceTransitionContext {
  hasActiveOperatorAuthorization: boolean;
  hasReviewerSignOff: boolean;
}

export function canTransitionFaceState(
  from: FaceState,
  to: FaceState,
  ctx: FaceTransitionContext
): { allowed: boolean; reason?: string } {
  const validTargets = ALLOWED_FACE_TRANSITIONS[from] ?? [];
  if (!validTargets.includes(to)) {
    return {
      allowed: false,
      reason: `Invalid face transition from '${from}' to '${to}'.`,
    };
  }

  if (to === "published") {
    if (!ctx.hasActiveOperatorAuthorization) {
      return {
        allowed: false,
        reason: "Publication blocked: active operator listing authorization is required (FR-008).",
      };
    }
    if (!ctx.hasReviewerSignOff) {
      return {
        allowed: false,
        reason: "Publication blocked: internal verifier review sign-off is required.",
      };
    }
  }

  return { allowed: true };
}
