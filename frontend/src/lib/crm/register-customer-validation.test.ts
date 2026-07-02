import { describe, expect, it } from "vitest";
import { normalizePhoneInput, validateCustomerFields } from "./register-customer-validation";

describe("validateCustomerFields", () => {
  it("returns no errors for valid customer", () => {
    expect(validateCustomerFields({ name: "Jane Doe", phone: "0812345678" })).toEqual({});
  });

  it("requires name and phone", () => {
    expect(validateCustomerFields({ name: "", phone: "" }).name).toBe("Name is required");
    expect(validateCustomerFields({ name: "Jane", phone: "" }).phone).toBe("Phone is required");
  });

  it("rejects invalid phone format", () => {
    expect(validateCustomerFields({ name: "Jane", phone: "12345" }).phone).toMatch(/valid Thai mobile/);
  });

  it("accepts phone with spaces", () => {
    expect(validateCustomerFields({ name: "Jane", phone: "081 234 5678" })).toEqual({});
  });
});

describe("normalizePhoneInput", () => {
  it("strips whitespace", () => {
    expect(normalizePhoneInput("081 234 5678")).toBe("0812345678");
  });
});
