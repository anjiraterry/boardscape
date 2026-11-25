import type { QuoteStatus } from "@/modules/quotes/schemas";

const ALLOWED_QUOTE_TRANSITIONS: Record<QuoteStatus, QuoteStatus[]> = {
  request_received: ["qualifying", "cancelled"],
  qualifying: ["awaiting_operator_quote", "draft_proposal", "rejected", "cancelled"],
  awaiting_operator_quote: ["draft_proposal", "expired", "cancelled"],
  draft_proposal: ["sent_to_client", "cancelled"],
  sent_to_client: ["client_accepted", "revision_requested", "rejected", "expired", "cancelled"],
  revision_requested: ["draft_proposal", "cancelled"],
  client_accepted: ["supplier_confirmed", "revision_requested", "cancelled"],
  supplier_confirmed: ["booked", "cancelled"],
  booked: [],
  rejected: [],
  expired: ["qualifying"],
  cancelled: [],
};

export interface QuoteTransitionContext {
  hasOperatorConfirmation?: boolean;
  operatorQuoteValid?: boolean;
  hasClientAcceptance?: boolean;
}

export function canTransitionQuoteStatus(
  from: QuoteStatus,
  to: QuoteStatus,
  ctx: QuoteTransitionContext = {}
): { allowed: boolean; reason?: string } {
  const allowedTargets = ALLOWED_QUOTE_TRANSITIONS[from] ?? [];
  if (!allowedTargets.includes(to)) {
    return {
      allowed: false,
      reason: `Cannot transition quote/proposal from '${from}' to '${to}'.`,
    };
  }

  if (to === "supplier_confirmed" && !ctx.hasOperatorConfirmation) {
    return {
      allowed: false,
      reason: "Supplier confirmation requires named operator confirmer, terms, and expiry (FR-016).",
    };
  }

  if (to === "booked") {
    if (!ctx.hasClientAcceptance || !ctx.hasOperatorConfirmation) {
      return {
        allowed: false,
        reason: "Booking requires both client acceptance and supplier confirmation (FR-018).",
      };
    }
    if (ctx.operatorQuoteValid === false) {
      return {
        allowed: false,
        reason: "Cannot book with an expired operator rate.",
      };
    }
  }

  return { allowed: true };
}
