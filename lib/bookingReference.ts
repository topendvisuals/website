// The short reference customers are asked to include in their bank
// transfer description. Deriving it from the booking's own ID (rather than
// storing a separate value) means it's automatically identical everywhere
// it's shown — the transfer step, both emails, and the admin dashboard —
// with zero chance of the copies drifting out of sync.
export function getBookingReference(bookingId: string): string {
  return bookingId.slice(0, 8).toUpperCase();
}
