import { z } from "zod";

export const QuoteStatusSchema = z.enum([
  "request_received",
  "qualifying",
  "awaiting_operator_quote",
  "draft_proposal",
  "sent_to_client",
  "client_accepted",
  "supplier_confirmed",
  "booked",
  "revision_requested",
  "rejected",
  "expired",
  "cancelled",
]);
export type QuoteStatus = z.infer<typeof QuoteStatusSchema>;

export const ProposalLineInputSchema = z.object({
  faceId: z.string().uuid(),
  flightStart: z.string(),
  flightEnd: z.string(),
  mediaCostMinor: z.number().int().nonnegative(),
  productionCostMinor: z.number().int().nonnegative().default(0),
  serviceFeeMinor: z.number().int().nonnegative().default(0),
  rateSource: z.string().min(2),
  rateValidUntil: z.string().datetime(),
});

export const CreateProposalInputSchema = z.object({
  leadId: z.string().uuid(),
  clientOrgId: z.string().uuid(),
  title: z.string().min(3),
  assumptions: z.string().min(5),
  validUntil: z.string().datetime(),
  taxMinor: z.number().int().nonnegative().default(0),
  lines: z.array(ProposalLineInputSchema).min(1),
});
