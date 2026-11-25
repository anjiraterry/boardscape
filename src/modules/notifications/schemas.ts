import { z } from "zod";

export const NotificationEventSchema = z.object({
  idempotencyKey: z.string().min(6),
  recipientUserId: z.string().uuid().optional(),
  recipientEmail: z.string().email().optional(),
  eventType: z.enum([
    "lead.brief_created",
    "quote.operator_requested",
    "quote.expiring",
    "proposal.sent",
    "campaign.proof_submitted",
    "compliance.permit_expiring",
  ]),
  payload: z.record(z.unknown()),
});
