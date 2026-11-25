import { z } from "zod";

export const LeadStatusSchema = z.enum([
  "new",
  "qualified",
  "proposal_in_progress",
  "won",
  "lost",
  "archived",
]);
export type LeadStatus = z.infer<typeof LeadStatusSchema>;

export const PublicBriefSubmissionSchema = z.object({
  companyName: z.string().min(2, "Company or brand name is required"),
  contactName: z.string().min(2, "Your name is required"),
  contactEmail: z.string().email("Valid email address is required"),
  contactPhone: z.string().min(7).optional().or(z.literal("")),
  objective: z.string().min(10, "Please describe your campaign objective"),
  targetDistricts: z.array(z.string()).default([]),
  preferredFormats: z.array(z.string()).default([]),
  budgetRange: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  creativeNeeded: z.boolean().default(false),
  consentToContact: z.literal(true, {
    errorMap: () => ({ message: "Consent to contact is required" }),
  }),
  sourceFaceIds: z.array(z.string().uuid()).default([]),
  source: z.enum(["website_brief", "atlas_shortlist", "contact_form"]).default("website_brief"),
});

export type PublicBriefSubmission = z.infer<typeof PublicBriefSubmissionSchema>;
