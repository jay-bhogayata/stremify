import * as password from "../../src/utils/password";

describe("hash the password", () => {
  it("should hash password", async () => {
    const randomPassword = Math.random().toString(36).slice(-10);
    const hashedPassword = await password.hashPassword(randomPassword);
    expect(hashedPassword).toBeDefined();
    expect(hashedPassword).not.toEqual(randomPassword);
  });

  it("should throw an error if password is not a string", async () => {
    await expect(password.hashPassword(123 as any)).rejects.toThrow();
  });
});

describe("compare hash and password", () => {
  it("should return true if hash and password match", async () => {
    const randomPassword = Math.random().toString(36).slice(-10);
    const hashedPassword = await password.hashPassword(randomPassword);
    const match = await password.comparePassword(
      randomPassword,
      hashedPassword
    );
    expect(match).toBe(true);
  });

  it("should return false if password and hash does not match", async () => {
    const hashedPassword = await password.hashPassword(
      Math.random().toString(36).slice(-10)
    );
    const match = await password.comparePassword(
      Math.random().toString(36).slice(-10),
      hashedPassword
    );
    expect(match).toBe(false);
  });

  it("should throw an error if password is not a string", async () => {
    const hashedPassword = await password.hashPassword(
      Math.random().toString(36).slice(-10)
    );
    await expect(
      password.comparePassword(123 as any, hashedPassword)
    ).rejects.toThrow();
  });
});
