export type CustomerFieldErrors = {
  name?: string;
  phone?: string;
};

export type CustomerFieldValues = {
  name: string;
  phone: string;
};

const PHONE_PATTERN = /^0\d{8,9}$/;

export function normalizePhoneInput(phone: string): string {
  return phone.replace(/\s+/g, "");
}

export function validateCustomerFields(values: CustomerFieldValues): CustomerFieldErrors {
  const errors: CustomerFieldErrors = {};
  const name = values.name.trim();
  const phone = normalizePhoneInput(values.phone);

  if (!name) {
    errors.name = "Name is required";
  }
  if (!phone) {
    errors.phone = "Phone is required";
  } else if (!PHONE_PATTERN.test(phone)) {
    errors.phone = "Enter a valid Thai mobile number (e.g. 0812345678)";
  }

  return errors;
}
