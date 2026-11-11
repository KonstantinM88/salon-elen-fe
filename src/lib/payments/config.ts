/** Shared by the booking UI and payment APIs. Change to true and redeploy to resume. */
export const PAYMENT_OPTIONS: Readonly<{ onlineEnabled: boolean }> = {
  onlineEnabled: false,
};

export function isPaymentMethodAvailable(method: 'onsite' | 'cash' | 'card' | 'stripe' | 'paypal'): boolean {
  return method === 'onsite' || method === 'cash' || PAYMENT_OPTIONS.onlineEnabled;
}
