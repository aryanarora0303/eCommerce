import request from "supertest";

const API_BASE_URL = "http://localhost:3151";

describe("Health Check API Tests", () => {
    describe("GET /health", () => {
        it("should return 200 and health status", async () => {
            const res = await request(API_BASE_URL).get("/health");

            expect(res.status).toBe(200);
            expect(res.body).toBeInstanceOf(Object);
            expect(res.body).toHaveProperty("status", "ok");
            expect(res.body).toHaveProperty("timestamp");
            expect(res.body).toHaveProperty("uptime");
            expect(res.body).toHaveProperty("environment", "development");
            expect(res.body).toHaveProperty("version", "1.0.0");
            expect(res.body).toHaveProperty("database");
            expect(res.body.database).toHaveProperty("type", "SQLite");
            expect(res.body.database).toHaveProperty("status", "connected");
        });

        it("should return valid timestamp format", async () => {
            const res = await request(API_BASE_URL).get("/health");

            expect(res.status).toBe(200);
            expect(new Date(res.body.timestamp).toISOString()).toBe(res.body.timestamp);
        });

        it("should return positive uptime", async () => {
            const res = await request(API_BASE_URL).get("/health");

            expect(res.status).toBe(200);
            expect(typeof res.body.uptime).toBe("number");
            expect(res.body.uptime).toBeGreaterThan(0);
        });
    });

    describe("GET /", () => {
        it("should return welcome message", async () => {
            const res = await request(API_BASE_URL).get("/");

            expect(res.status).toBe(200);
            expect(res.body).toBeInstanceOf(Object);
            expect(res.body).toHaveProperty("message");
            expect(res.body.message).toContain("Welcome to eCommerce API");
        });
    });
});
