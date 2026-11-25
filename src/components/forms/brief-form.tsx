"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ABUJA_DISTRICTS } from "@/modules/geospatial/abuja";
import {
  PublicBriefSubmissionSchema,
  type PublicBriefSubmission,
} from "@/modules/crm/schemas";

interface BriefFormProps {
  initialFaceIds?: string[];
  source?: "website_brief" | "atlas_shortlist" | "contact_form";
}

export function BriefForm({
  initialFaceIds = [],
  source = "website_brief",
}: BriefFormProps) {
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PublicBriefSubmission>({
    resolver: zodResolver(PublicBriefSubmissionSchema),
    defaultValues: {
      source,
      sourceFaceIds: initialFaceIds,
      consentToContact: true,
      creativeNeeded: false,
      targetDistricts: [],
      preferredFormats: [],
    },
  });

  const toggleDistrict = (district: string) => {
    setSelectedDistricts((prev) =>
      prev.includes(district) ? prev.filter((d) => d !== district) : [...prev, district]
    );
  };

  const onSubmit = async (values: PublicBriefSubmission) => {
    setServerMessage(null);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/briefs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          targetDistricts: selectedDistricts,
          sourceFaceIds: initialFaceIds,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrorMessage(json.error ?? "Unable to submit campaign brief.");
        return;
      }
      setServerMessage(
        json.message ?? "Your campaign brief has been received by the Boardscape team."
      );
      reset();
      setSelectedDistricts([]);
    } catch {
      setErrorMessage("Network error while submitting brief. Please retry.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="companyName">Brand / Company Name</Label>
          <Input id="companyName" placeholder="e.g. Zuma Properties Ltd" {...register("companyName")} />
          {errors.companyName && (
            <p className="text-xs text-destructive">{errors.companyName.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactName">Your Name</Label>
          <Input id="contactName" placeholder="Full name" {...register("contactName")} />
          {errors.contactName && (
            <p className="text-xs text-destructive">{errors.contactName.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contactEmail">Work Email</Label>
          <Input id="contactEmail" type="email" placeholder="name@company.com" {...register("contactEmail")} />
          {errors.contactEmail && (
            <p className="text-xs text-destructive">{errors.contactEmail.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactPhone">Phone Number (optional)</Label>
          <Input id="contactPhone" placeholder="+234..." {...register("contactPhone")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="objective">Campaign Objective</Label>
        <Textarea
          id="objective"
          placeholder="Describe your target audience, launch goal, and key locations in Abuja..."
          {...register("objective")}
        />
        {errors.objective && (
          <p className="text-xs text-destructive">{errors.objective.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Target Abuja Districts</Label>
        <div className="flex flex-wrap gap-2">
          {ABUJA_DISTRICTS.map((d) => {
            const active = selectedDistricts.includes(d);
            return (
              <button
                key={d}
                type="button"
                onClick={() => toggleDistrict(d)}
                className={`rounded-sm border px-2.5 py-1 text-xs transition-colors ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:bg-secondary"
                }`}
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="budgetRange">Estimated Budget Range (NGN)</Label>
          <Input id="budgetRange" placeholder="e.g. ₦3M – ₦8M" {...register("budgetRange")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="startDate">Target Start Date</Label>
          <Input id="startDate" type="date" {...register("startDate")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">Target End Date</Label>
          <Input id="endDate" type="date" {...register("endDate")} />
        </div>
      </div>

      <div className="flex flex-col gap-3 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" {...register("creativeNeeded")} className="h-4 w-4" />
          <span>We also need creative strategy / artwork adaptation support</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" {...register("consentToContact")} className="h-4 w-4" />
          <span>I consent to Boardscape contacting me regarding this campaign brief.</span>
        </label>
        {errors.consentToContact && (
          <p className="text-xs text-destructive">{errors.consentToContact.message}</p>
        )}
      </div>

      {errorMessage && (
        <div role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {errorMessage}
        </div>
      )}

      {serverMessage && (
        <div role="status" className="rounded-md border border-emerald-700/30 bg-emerald-50 p-4 text-sm text-emerald-900">
          {serverMessage}
        </div>
      )}

      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Submitting Brief..." : "Submit Campaign Brief"}
      </Button>
    </form>
  );
}
