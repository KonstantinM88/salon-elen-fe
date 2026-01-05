export const normalizePhoneDigits = (value: string): string =>
  value.replace(/\D/g, "");

export const isPhoneDigitsValid = (digits: string): boolean =>
  digits.length >= 10 && digits.length <= 15;
