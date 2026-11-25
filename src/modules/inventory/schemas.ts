import { z } from "zod";

export const FaceStateSchema = z.enum([
  "draft",
  "surveyed",
  "awaiting_operator",
  "verified_private",
  "published",
  "suspended",
  "archived",
]);
export type FaceState = z.infer<typeof FaceStateSchema>;

export const FaceFormatSchema = z.enum([
  "static_billboard",
  "unipole",
  "gantry",
  "rooftop",
  "wall_drape",
  "digital_led",
  "street_furniture",
]);
export type FaceFormat = z.infer<typeof FaceFormatSchema>;

export const SourceTypeSchema = z.enum([
  "FIELD_OBSERVED",
  "OPERATOR_PROVIDED",
  "BOARDSCAPE_REVIEWED",
  "THIRD_PARTY_LICENSED",
  "MODEL_ESTIMATED",
]);
export type SourceType = z.infer<typeof SourceTypeSchema>;

export interface PublicFaceListing {
  faceId: string;
  slug: string;
  label: string;
  format: FaceFormat;
  widthMeters: number;
  heightMeters: number;
  azimuthDeg: number;
  illumination: string;
  roadDirection: string;
  publicSummary: string | null;
  publicImagePath: string | null;
  lastConfirmedAt: string | null;
  siteId: string;
  sitePublicId: string;
  latitude: number;
  longitude: number;
  address: string;
  roadName: string;
  district: string;
  corridor: string | null;
  availabilityLabel: string;
}

export const PublishFaceInputSchema = z.object({
  faceId: z.string().uuid(),
  hasActiveOperatorAuthorization: z.boolean(),
  reviewNotes: z.string().min(3),
});
