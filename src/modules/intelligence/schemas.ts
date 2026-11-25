import { z } from "zod";
import { SourceTypeSchema } from "@/modules/inventory/schemas";

export const TrafficObservationSchema = z.object({
  faceId: z.string().uuid(),
  observedAt: z.string().datetime(),
  durationMinutes: z.number().int().positive().max(1440),
  vehicleCount: z.number().int().nonnegative(),
  pedestrianCount: z.number().int().nonnegative(),
  vehicleDirection: z.string().min(2),
  observationMethod: z.enum(["manual_tally", "video_sample", "structured_panel"]),
  weatherConditions: z.string().optional(),
  roadSpeedEstimate: z.enum(["slow_congested", "moderate", "fast_highway"]).optional(),
  sourceType: SourceTypeSchema.default("FIELD_OBSERVED"),
  confidence: z.enum(["low", "medium", "high"]).default("low"),
});

export type TrafficObservationInput = z.infer<typeof TrafficObservationSchema>;
