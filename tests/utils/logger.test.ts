import request from "supertest";
import express, { Application } from "express";
import { logger, morganMiddleware } from "../../src/utils/logger";

describe("Logger", () => {
  let app: Application;

  beforeEach(() => {
    app = express();
    app.use(morganMiddleware);
    app.get("/test", (req, res) => {
      res.status(200).send("Hello, World!");
    });
  });

  it("should log info level for 200 status code", async () => {
    const logSpy = jest.spyOn(logger, "info");
    await request(app).get("/test");
    expect(logSpy).toHaveBeenCalled();
  });

  it("should log warn level for 4xx status code", async () => {
    app.get("/test4xx", (req, res) => {
      res.status(400).send("Bad Request");
    });
    const logSpy = jest.spyOn(logger, "warn");
    await request(app).get("/test4xx");
    expect(logSpy).toHaveBeenCalled();
  });

  it("should log error level for 5xx status code", async () => {
    app.get("/test5xx", (req, res) => {
      res.status(500).send("Internal Server Error");
    });
    const logSpy = jest.spyOn(logger, "error");
    await request(app).get("/test5xx");
    expect(logSpy).toHaveBeenCalled();
  });
});
