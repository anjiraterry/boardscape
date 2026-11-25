import { z } from "zod";

export const BboxFilterSchema = z.object({
  minLng: z.coerce.number().min(-180).max(180).default(7.2),
  minLat: z.coerce.number().min(-90).max(90).default(8.9),
  maxLng: z.coerce.number().min(-180).max(180).default(7.6),
  maxLat: z.coerce.number().min(-90).max(90).default(9.2),
  district: z.string().optional(),
  format: z.string().optional(),
  keyword: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export type BboxFilter = z.infer<typeof BboxFilterSchema>;
