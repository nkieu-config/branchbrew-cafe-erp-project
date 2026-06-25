import { PaymentMethod } from '@prisma/client';

export const PAYMENT_ACCOUNT_CODES: Record<PaymentMethod, string> = {
  CASH: '1010',
  CREDIT_CARD: '1040',
  QR_PROMPTPAY: '1050',
};

export function resolvePaymentAccountCode(method: PaymentMethod): string {
  return PAYMENT_ACCOUNT_CODES[method] ?? PAYMENT_ACCOUNT_CODES.CASH;
}

export function paymentAccountLabel(method: PaymentMethod): string {
  switch (method) {
    case 'CREDIT_CARD':
      return 'Card payment received';
    case 'QR_PROMPTPAY':
      return 'PromptPay payment received';
    default:
      return 'Cash received';
  }
}
