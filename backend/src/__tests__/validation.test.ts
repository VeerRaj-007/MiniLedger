import { phoneSchema, verifyOtpSchema, createLoanSchema } from "../validation/schemas";

describe("phoneSchema", () => {
  it("accepts a plausible phone number", () => {
    expect(phoneSchema.safeParse({ phone: "+919876543210" }).success).toBe(true);
  });

  it("rejects a too-short phone number", () => {
    expect(phoneSchema.safeParse({ phone: "123" }).success).toBe(false);
  });
});

describe("verifyOtpSchema", () => {
  it("requires the otp to be exactly 4 characters", () => {
    expect(verifyOtpSchema.safeParse({ phone: "+919876543210", otp: "1234" }).success).toBe(true);
    expect(verifyOtpSchema.safeParse({ phone: "+919876543210", otp: "12" }).success).toBe(false);
  });
});

describe("createLoanSchema", () => {
  it("accepts a valid loan payload", () => {
    const result = createLoanSchema.safeParse({
      friendName: "Rahul",
      amount: 1500,
      dueDate: "2026-11-01",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a non-positive amount", () => {
    const result = createLoanSchema.safeParse({
      friendName: "Rahul",
      amount: -50,
      dueDate: "2026-11-01",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty friend name", () => {
    const result = createLoanSchema.safeParse({
      friendName: "",
      amount: 100,
      dueDate: "2026-11-01",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a malformed due date", () => {
    const result = createLoanSchema.safeParse({
      friendName: "Rahul",
      amount: 100,
      dueDate: "not-a-date",
    });
    expect(result.success).toBe(false);
  });
});
