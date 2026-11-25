export interface ExistingBookingSpan {
  id: string;
  faceId: string;
  startDate: string;
  endDate: string;
  isExclusive: boolean;
  status: string;
}

export function hasExclusiveDateOverlap(
  faceId: string,
  requestedStart: string,
  requestedEnd: string,
  existingBookings: ExistingBookingSpan[]
): { overlap: boolean; conflictingBookingId?: string } {
  const reqStartMs = Date.parse(requestedStart);
  const reqEndMs = Date.parse(requestedEnd);

  if (Number.isNaN(reqStartMs) || Number.isNaN(reqEndMs) || reqEndMs < reqStartMs) {
    throw new Error("Invalid booking date range");
  }

  for (const booking of existingBookings) {
    if (
      booking.faceId !== faceId ||
      booking.status !== "confirmed" ||
      !booking.isExclusive
    ) {
      continue;
    }
    const bStartMs = Date.parse(booking.startDate);
    const bEndMs = Date.parse(booking.endDate);

    if (reqStartMs <= bEndMs && reqEndMs >= bStartMs) {
      return { overlap: true, conflictingBookingId: booking.id };
    }
  }

  return { overlap: false };
}
