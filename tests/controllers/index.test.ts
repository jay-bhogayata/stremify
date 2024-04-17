import request from "supertest";
import app from "../../src/server";

describe("GET /api/v1/health", () => {
  it("responds with OK", async () => {
    const response = await request(app).get("/api/v1/health");
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ message: "OK" });
  });
});
