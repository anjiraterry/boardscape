import { z } from "zod";

export const ConfirmBookingInputSchema = z.object({
  proposalId: z.string().uuid(),
  proposalLineId: z.string().uuid(),
  faceId: z.string().uuid(),
  clientOrgId: z.string().uuid(),
  operatorOrgId: z.string().uuid(),
  startDate: z.string(),
  endDate: z.string(),
  isExclusive: z.boolean().default(true),
  clientAcceptedAt: z.string().datetime(),
  supplierConfirmedAt: z.string().datetime(),
  supplierConfirmedBy: z.string().min(2),
});

export type ConfirmBookingInput = z.infer<typeof ConfirmBookingInputSchema>;
