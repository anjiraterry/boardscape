import { describe, expect, it } from "vitest";
import { canTransitionFaceState } from "@/modules/inventory/state-machine";

describe("Inventory Face Lifecycle State Machine (FR-008, FR-009)", () => {
  it("blocks publication without active operator listing authorization", () => {
    const res = canTransitionFaceState("verified_private", "published", {
      hasActiveOperatorAuthorization: false,
      hasReviewerSignOff: true,
    });
    expect(res.allowed).toBe(false);
    expect(res.reason).toContain("operator listing authorization");
  });

  it("blocks publication without internal reviewer sign-off", () => {
    const res = canTransitionFaceState("verified_private", "published", {
      hasActiveOperatorAuthorization: true,
      hasReviewerSignOff: false,
    });
    expect(res.allowed).toBe(false);
  });

  it("allows publication when both authorization and review sign-off exist", () => {
    const res = canTransitionFaceState("verified_private", "published", {
      hasActiveOperatorAuthorization: true,
      hasReviewerSignOff: true,
    });
    expect(res.allowed).toBe(true);
  });

  it("prevents skipping directly from draft to published", () => {
    const res = canTransitionFaceState("draft", "published", {
      hasActiveOperatorAuthorization: true,
      hasReviewerSignOff: true,
    });
    expect(res.allowed).toBe(false);
  });
});
