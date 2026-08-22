// One switch controls how deposits are collected across the whole site.
// Flip this back to 'stripe' whenever you're ready to re-enable card
// payments — none of the Stripe code (DepositPaymentForm, the webhook, the
// create-deposit-intent route) is touched or removed, it's just not called
// while this is set to 'bank_transfer'.
export const DEPOSIT_METHOD: 'stripe' | 'bank_transfer' = 'bank_transfer';

// TODO: fill in your real bank details before going live with this.
// These are shown to the customer on the "Transfer your deposit" step, and
// included in the confirmation email so they have a record of what to pay.
export const BANK_DETAILS = {
  accountName: 'Jethro Llewellyn',
  bsb: '923-100',
  accountNumber: '825333748',
};
