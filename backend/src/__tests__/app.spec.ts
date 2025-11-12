import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import app from "../server";
import { closePool, resetData, runMigrations } from "../testing/test-db";
import config from "../config";

const login = async () =>
  request(app).post("/auth/login").send({
    email: config.seedEmail,
    password: config.seedPassword,
  });

beforeAll(async () => {
  await runMigrations();
});

beforeEach(async () => {
  await resetData();
});

afterAll(async () => {
  await closePool();
});

describe("Authentication", () => {
  it("allows a seeded user to log in and receive a token", async () => {
    const response = await login();
    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
    expect(response.body.user.email).toBe(config.seedEmail);
  });

  it("rejects invalid credentials", async () => {
    const response = await request(app).post("/auth/login").send({
      email: config.seedEmail,
      password: "wrong-password",
    });

    expect(response.status).toBe(401);
  });

  it("protects /me without a token", async () => {
    const response = await request(app).get("/me");
    expect(response.status).toBe(401);
  });

  it("returns the current user with a valid token", async () => {
    const auth = await login();
    const token = auth.body.token as string;

    const response = await request(app).get("/me").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.email).toBe(config.seedEmail);
  });
});

describe("Orders", () => {
  it("blocks creating an order in the past", async () => {
    const auth = await login();
    const token = auth.body.token as string;

    const response = await request(app)
      .post("/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({
        deliveryType: "DELIVERY",
        scheduledTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        contactPhone: "1234567890",
        deliveryAddress: "123 Main St",
      });

    expect(response.status).toBe(400);
  });

  it("requires vehicle info for curbside orders", async () => {
    const auth = await login();
    const token = auth.body.token as string;

    const createResponse = await request(app)
      .post("/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({
        deliveryType: "CURBSIDE",
        scheduledTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        contactPhone: "1234567890",
      });

    expect(createResponse.status).toBe(400);
  });

  it("creates and fetches an order successfully", async () => {
    const auth = await login();
    const token = auth.body.token as string;

    const createResponse = await request(app)
      .post("/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({
        deliveryType: "DELIVERY",
        scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        contactPhone: "1234567890",
        deliveryAddress: "123 Main St",
      });

    expect(createResponse.status).toBe(201);
    const orderId = createResponse.body.id as string;

    const fetchResponse = await request(app)
      .get(`/orders/${orderId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(fetchResponse.status).toBe(200);
    expect(fetchResponse.body.id).toBe(orderId);
  });
});

