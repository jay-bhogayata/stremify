import generateOTP from "../../src/utils/generateOTP";

describe("generateOTP", () => {
  it("should generate OTP of the specified length", () => {
    const length = 6;
    const OTP = generateOTP(length);
    expect(OTP).toHaveLength(length);
  });

  it("should only contain digits", () => {
    const otp = generateOTP(6);
    expect(otp).toMatch(/^[0-9]+$/);
  });

  it("should generate a different OTP each time", () => {
    const length = 6;
    const OTP1 = generateOTP(length);
    const OTP2 = generateOTP(length);
    expect(OTP1).not.toEqual(OTP2);
  });
});
