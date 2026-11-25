import { z } from "zod";

export const ListingAuthorizationSchema = z.object({
  faceId: z.string().uuid(),
  operatorOrgId: z.string().uuid(),
  grantType: z.enum(["written_agreement", "verified_email", "signed_letter", "portal_acceptance"]),
  marketingScope: z.enum(["exclusive", "non_exclusive"]).default("non_exclusive"),
  evidencePath: z.string().min(3),
  expiresAt: z.string().datetime().optional(),
});

export const OperatorRateCardSchema = z.object({
  faceId: z.string().uuid(),
  operatorOrgId: z.string().uuid(),
  priceMinor: z.number().int().nonnegative(),
  currency: z.literal("NGN").default("NGN"),
  durationUnit: z.enum(["monthly", "biweekly", "weekly"]).default("monthly"),
  isPublishable: z.boolean().default(false),
  confirmedByName: z.string().min(2),
  validUntil: z.string().datetime(),
});
