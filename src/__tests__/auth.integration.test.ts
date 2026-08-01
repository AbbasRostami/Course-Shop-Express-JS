// [TEST] Mock nodemailer
import { vi } from "vitest";

vi.mock("nodemailer", () => ({
  default: {
    createTransport: vi.fn().mockReturnValue({
      sendMail: vi.fn().mockResolvedValue({ messageId: "mock-message-id" }),
    }),
  },
}));

import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import app from "../app.js";
import { prisma } from "../lib/prisma.js";

// [TEST] Test user credentials
const TEST_USER = {
  email: "integration-test@example.com",
  password: "Test123456",
  name: "تست اینتگریشن",
};

let accessToken: string;
let refreshTokenCookie: string;
let verificationCode: string;

describe("🔐 Auth Integration Flow: register → verify → login → protected → refresh", () => {
  // [DB] Cleanup before tests
  beforeAll(async () => {
    await prisma.user.deleteMany({
      where: { email: TEST_USER.email },
    });
  });

  // [DB] Cleanup after tests
  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: TEST_USER.email },
    });
    await prisma.$disconnect();
  });

  describe("Step 1: Register", () => {
    it("✅ should successfully register a new user", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send(TEST_USER)
        .expect(201);

      expect(res.body.status).toBe("success");
      expect(res.body.data.email).toBe(TEST_USER.email);

      // [DB] Verify user created with unverified state
      const user = await prisma.user.findUnique({
        where: { email: TEST_USER.email },
      });
      expect(user).not.toBeNull();
      expect(user!.isVerified).toBe(false);
      expect(user!.verificationCode).toBeTruthy();
      verificationCode = user!.verificationCode!;
    });

    it("❌ should reject duplicate email", async () => {
      await request(app).post("/api/auth/register").send(TEST_USER).expect(400);
    });

    it("❌ should reject invalid email format", async () => {
      await request(app)
        .post("/api/auth/register")
        .send({ email: "not-an-email", password: "Test123456", name: "تست" })
        .expect(400);
    });
  });

  describe("Step 2: Verify Email", () => {
    it("❌ should reject wrong code", async () => {
      await request(app)
        .post("/api/auth/verify-email")
        .send({ email: TEST_USER.email, code: "000000" })
        .expect(400);
    });

    it("✅ should verify with correct code and auto-login", async () => {
      const res = await request(app)
        .post("/api/auth/verify-email")
        .send({ email: TEST_USER.email, code: verificationCode })
        .expect(200);

      expect(res.body.status).toBe("success");

      // [AUTH] Check access token in response and cookie
      expect(res.body.data.accessToken).toBeDefined();

      const cookies = res.headers["set-cookie"] as unknown as string[];
      expect(cookies).toBeDefined();
      expect(cookies.some((c) => c.startsWith("accessToken="))).toBe(true);
    });
  });

  describe("Step 3: Login", () => {
    it("❌ should reject wrong password", async () => {
      await request(app)
        .post("/api/auth/login")
        .send({ email: TEST_USER.email, password: "WrongPassword123" })
        .expect(401);
    });

    it("✅ should login with correct credentials", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: TEST_USER.email, password: TEST_USER.password })
        .expect(200);

      expect(res.body.status).toBe("success");

      // [AUTH] Store tokens for next steps
      accessToken = res.body.data.accessToken;

      const cookies = res.headers["set-cookie"] as unknown as string[];
      const refreshCookieRaw = cookies.find((c) =>
        c.startsWith("refreshToken="),
      );
      expect(refreshCookieRaw).toBeDefined();
      refreshTokenCookie = refreshCookieRaw!.split(";")[0];
    });
  });

  describe("Step 4: Access Protected Route", () => {
    it("❌ should reject without token", async () => {
      await request(app).get("/api/users/profile").expect(401);
    });

    it("✅ should access profile with Bearer token", async () => {
      const res = await request(app)
        .get("/api/users/profile")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.status).toBe("success");
      expect(res.body.data.profile.email).toBe(TEST_USER.email);
    });

    it("✅ should access profile with Cookie", async () => {
      const res = await request(app)
        .get("/api/users/profile")
        .set("Cookie", `accessToken=${accessToken}`)
        .expect(200);

      expect(res.body.status).toBe("success");
    });
  });

  describe("Step 5: Refresh Token", () => {
    it("✅ should refresh access token successfully", async () => {
      const res = await request(app)
        .post("/api/auth/refresh")
        .set("Cookie", refreshTokenCookie)
        .expect(200);

      expect(res.body.status).toBe("success");

      // [AUTH] Confirm new access token returned
      expect(res.body.data.accessToken).toBeDefined();
    });
  });

  describe("Step 6: Logout", () => {
    it("✅ should logout and invalidate refresh token", async () => {
      await request(app)
        .post("/api/auth/logout")
        .set("Cookie", refreshTokenCookie)
        .expect(200);

      // [AUTH] Confirm refresh token is invalidated
      await request(app)
        .post("/api/auth/refresh")
        .set("Cookie", refreshTokenCookie)
        .expect(401);
    });
  });
});
