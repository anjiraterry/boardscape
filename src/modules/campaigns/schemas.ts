import { z } from "zod";

export const CampaignStatusSchema = z.enum([
  "draft",
  "approved",
  "preproduction",
  "ready_to_launch",
  "installation_in_progress",
  "live",
  "completed",
  "reported",
  "blocked",
  "paused",
  "cancelled",
  "makegood_required",
]);
export type CampaignStatus = z.infer<typeof CampaignStatusSchema>;

export const ProofUploadSchema = z.object({
  campaignId: z.string().uuid(),
  faceId: z.string().uuid(),
  storagePath: z.string().min(3),
  capturedAt: z.string().datetime(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  issueFlag: z.string().optional(),
});
