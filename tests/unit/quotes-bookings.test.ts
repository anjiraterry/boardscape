import { describe, expect, it } from "vitest";
import { canTransitionQuoteStatus } from "@/modules/quotes/state-machine";
import { computeProposalTotals } from "@/modules/quotes/service";
import { hasExclusiveDateOverlap } from "@/modules/bookings/service";
import { formatNgnFromKobo, ngnToKobo } from "@/lib/money";

describe("Quotes, Proposals & Bookings (FR-016, FR-017, FR-018)", () => {
  it("computes proposal totals accurately in integer kobo", () => {
    const totals = computeProposalTotals({
      leadId: "00000000-0000-0000-0000-000000000001",
      clientOrgId: "00000000-0000-0000-0000-000000000002",
      title: "Abuja Q1 Launch",
      assumptions: "Subject to operator reconfirmation",
      validUntil: "2026-12-31T00:00:00Z",
      taxMinor: ngnToKobo(75000),
      lines: [
        {
          faceId: "00000000-0000-0000-0000-000000000003",
          flightStart: "2026-12-01",
          flightEnd: "2026-12-31",
          mediaCostMinor: ngnToKobo(1500000),
          productionCostMinor: ngnToKobo(200000),
          serviceFeeMinor: ngnToKobo(150000),
          rateSource: "Operator quote",
          rateValidUntil: "2026-12-15T00:00:00Z",
        },
      ],
    });
    expect(totals.totalMinor).toBe(ngnToKobo(1925000));
    expect(formatNgnFromKobo(totals.totalMinor)).toContain("1,925,000");
  });

  it("never allows client_accepted to jump straight to booked without supplier confirmation", () => {
    const res = canTransitionQuoteStatus("client_accepted", "booked", {
      hasClientAcceptance: true,
      hasOperatorConfirmation: false,
    });
    expect(res.allowed).toBe(false);
  });

  it("detects overlapping exclusive bookings on the same face", () => {
    const overlap = hasExclusiveDateOverlap("face-1", "2026-12-10", "2026-12-20", [
      {
        id: "b-1",
        faceId: "face-1",
        startDate: "2026-12-01",
        endDate: "2026-12-15",
        isExclusive: true,
        status: "confirmed",
      },
    ]);
    expect(overlap.overlap).toBe(true);
    expect(overlap.conflictingBookingId).toBe("b-1");
  });

  it("allows non-overlapping bookings on the same face", () => {
    const overlap = hasExclusiveDateOverlap("face-1", "2026-12-16", "2026-12-31", [
      {
        id: "b-1",
        faceId: "face-1",
        startDate: "2026-12-01",
        endDate: "2026-12-15",
        isExclusive: true,
        status: "confirmed",
      },
    ]);
    expect(overlap.overlap).toBe(false);
  });
});
