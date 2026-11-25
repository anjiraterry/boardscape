import { z } from "zod";

export const ComplianceReviewStatusSchema = z.enum([
  "evidence_missing",
  "document_supplied",
  "document_reviewed",
  "expired_or_flagged",
]);
export type ComplianceReviewStatus = z.infer<typeof ComplianceReviewStatusSchema>;

export const COMPLIANCE_DISCLAIMER =
  "Document review records operator-supplied evidence and expiry dates. Boardscape does not issue official permits or claim government certification.";

export const PermitRecordInputSchema = z.object({
  operatorOrgId: z.string().uuid(),
  siteId: z.string().uuid().optional(),
  faceId: z.string().uuid().optional(),
  claimedAuthority: z.enum(["FCTA_DOAS", "AMAC", "ARCON_VETTING", "OTHER"]),
  issuer: z.string().min(2),
  referenceNumber: z.string().optional(),
  expiresAt: z.string().optional(),
  documentPath: z.string().optional(),
});
