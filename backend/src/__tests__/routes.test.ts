import request from "supertest";

// The real Prisma client needs a generated query engine (`npx prisma
// generate`, which needs network access) before it can even be
// constructed — so it's mocked out here. That's fine for what this suite
// actually exercises: the auth guard rejecting missing/invalid tokens,
// and input validation on /auth/send-otp. Neither of those code paths
// ever reaches Prisma, so a mock that's never called is all we need.
// (Routes that DO touch Prisma are covered by the pure-function tests in
// loanCalculations.test.ts instead, by testing the logic they call.)
jest.mock("../db", () => ({ prisma: {} }));

import { createApp } from "../app";

const app = createApp();

describe("GET /", () => {
  it("returns a status message", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body.status).toMatch(/running/i);
  });
});

describe("auth guard", () => {
  it("rejects /loans with no Authorization header", async () => {
    const res = await request(app).get("/loans");
    expect(res.status).toBe(401);
  });

  it("rejects /loans with a malformed token", async () => {
    const res = await request(app).get("/loans").set("Authorization", "Bearer not-a-real-token");
    expect(res.status).toBe(401);
  });

  it("rejects /summary with no Authorization header", async () => {
    const res = await request(app).get("/summary");
    expect(res.status).toBe(401);
  });
});

describe("POST /auth/send-otp validation", () => {
  it("rejects a missing phone number", async () => {
    const res = await request(app).post("/auth/send-otp").send({});
    expect(res.status).toBe(400);
  });

  it("rejects an obviously too-short phone number", async () => {
    const res = await request(app).post("/auth/send-otp").send({ phone: "123" });
    expect(res.status).toBe(400);
  });
});
