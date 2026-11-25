import { z } from "zod";

/**
 * Billing domain reserved for P1 (invoices, receipts, Paystack split payments).
 * P0 stores all commercial totals in integer minor units (NGN kobo).
 */
export const BillingDocumentTypeSchema = z.enum(["invoice", "receipt", "credit_note"]);

export interface ReservedPaymentIntent {
  proposalId: string;
  amountMinor: number;
  currency: "NGN";
  status: "reserved_p1";
}
