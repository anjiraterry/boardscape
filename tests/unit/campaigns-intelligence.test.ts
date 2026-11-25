import { describe, expect, it } from "vitest";
import { canTransitionCampaignStatus } from "@/modules/campaigns/state-machine";
import { buildObservationSummary } from "@/modules/intelligence/service";

describe("Campaigns & Intelligence Provenance (FR-020–FR-023, FR-027)", () => {
  it("blocks ready_to_launch when required approval tasks are incomplete", () => {
    const res = canTransitionCampaignStatus("preproduction", "ready_to_launch", {
      incompleteRequiredTasks: 2,
      hasApprovedCreative: true,
    });
    expect(res.allowed).toBe(false);
  });

  it("blocks reported state without reviewed proof-of-posting", () => {
    const res = canTransitionCampaignStatus("completed", "reported", {
      hasApprovedProofs: false,
    });
    expect(res.allowed).toBe(false);
  });

  it("labels traffic observations honestly without claiming verified impressions", () => {
    const summary = buildObservationSummary({
      faceId: "00000000-0000-0000-0000-000000000001",
      observedAt: "2026-11-23T08:00:00Z",
      durationMinutes: 30,
      vehicleCount: 420,
      pedestrianCount: 65,
      vehicleDirection: "Inbound Wuse II",
      observationMethod: "manual_tally",
      sourceType: "FIELD_OBSERVED",
      confidence: "medium",
    });
    expect(summary.totalObservedPassers).toBe(485);
    expect(summary.disclaimer).toContain("Not verified impressions");
  });
});
