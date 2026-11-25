import { z } from "zod";

export const AuditEventSchema = z.object({
  actorId: z.string().uuid().nullable(),
  organizationId: z.string().uuid().nullable(),
  entityType: z.string().min(2),
  entityId: z.string().uuid(),
  action: z.string().min(2),
  beforeState: z.record(z.unknown()).nullable().optional(),
  afterState: z.record(z.unknown()).nullable().optional(),
  source: z.string().default("api"),
});

export type AuditEventInput = z.infer<typeof AuditEventSchema>;
