import { z } from "zod";
import { FaceFormatSchema } from "@/modules/inventory/schemas";

export const SurveyFaceInputSchema = z.object({
  label: z.string().min(1, "Face label is required"),
  format: FaceFormatSchema,
  widthMeters: z.coerce.number().positive().max(100),
  heightMeters: z.coerce.number().positive().max(50),
  azimuthDeg: z.coerce.number().int().min(0).max(359),
  illumination: z.enum(["none", "frontlit", "backlit", "digital_led"]),
  obstructionLevel: z.enum(["clear", "minor", "moderate", "severe"]),
  roadDirection: z.string().min(2),
});

export const SurveySubmissionSchema = z.object({
  syncKey: z.string().min(8).max(128),
  recordedAt: z.string().datetime(),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  gpsAccuracyMeters: z.coerce.number().nonnegative().max(5000),
  address: z.string().min(3),
  roadName: z.string().min(2),
  district: z.string().min(2),
  corridor: z.string().optional(),
  structureType: z.string().min(2).default("unipole"),
  displayedOperatorName: z.string().optional(),
  displayedOperatorContact: z.string().optional(),
  conditionNotes: z.string().optional(),
  attachmentCount: z.coerce.number().int().min(1, "At least one photograph is required (FR-004)"),
  faces: z.array(SurveyFaceInputSchema).min(1, "At least one advertising face is required (FR-005)"),
});

export type SurveySubmissionInput = z.infer<typeof SurveySubmissionSchema>;
