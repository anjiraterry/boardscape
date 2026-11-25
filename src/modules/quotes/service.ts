import { sumMoneyMinor } from "@/lib/money";
import type { CreateProposalInputSchema } from "@/modules/quotes/schemas";
import type { z } from "zod";

type CreateProposalInput = z.infer<typeof CreateProposalInputSchema>;

export function computeProposalTotals(input: CreateProposalInput) {
  const mediaSubtotalMinor = sumMoneyMinor(input.lines.map((l) => l.mediaCostMinor));
  const productionSubtotalMinor = sumMoneyMinor(input.lines.map((l) => l.productionCostMinor));
  const agencyFeeMinor = sumMoneyMinor(input.lines.map((l) => l.serviceFeeMinor));
  const totalMinor =
    mediaSubtotalMinor + productionSubtotalMinor + agencyFeeMinor + input.taxMinor;

  return {
    mediaSubtotalMinor,
    productionSubtotalMinor,
    agencyFeeMinor,
    taxMinor: input.taxMinor,
    totalMinor,
  };
}
