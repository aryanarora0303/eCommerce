import request from "supertest";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { UserFactory, ProductFactory, PremiumProductFactory } from "../fixtures/factories";
import { setupTestServer, teardownTestServer, createAdminUser, createCustomerUser } from "../setup";

describe("Product API with Fishery Factories", () => {
    let app: INestApplication;
    let adminToken: string;
    let userToken: string;
    let API_BASE_URL: any;
    let createdProductId: number;

    beforeAll(async () => {
        // Use setupTestServer for isolated environment
        const setup = await setupTestServer(true, false);
        app = setup.app;
        API_BASE_URL = app.getHttpServer();

        // Create admin user using test utility
        const adminUser = await createAdminUser(app);
        adminToken = adminUser.accessToken;

        // Create regular user using test utility
        const customerUser = await createCustomerUser(app);
        userToken = customerUser.accessToken;
    });

    afterAll(async () => {
        await teardownTestServer();
    });

    describe("POST /products", () => {
        it("should create a new product with factory data", async () => {
            const productData = ProductFactory.build();
            const res = await request(API_BASE_URL).post("/products").set("Authorization", `Bearer ${adminToken}`).send(productData);
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty("product_id");
            expect(res.body).toHaveProperty("name", productData.name);
            expect(res.body).toHaveProperty("price", productData.price);
            createdProductId = res.body.product_id;
        });

        it("should create premium products with specific traits", async () => {
            const premiumProduct = PremiumProductFactory.build();
            const res = await request(API_BASE_URL).post("/products").set("Authorization", `Bearer ${adminToken}`).send(premiumProduct);
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty("price", 999.99);
            expect(res.body).toHaveProperty("category", "Electronics");
            expect(res.body).toHaveProperty("brand", "Apple");
        });

        it("should handle multiple unique products", async () => {
            const products = ProductFactory.buildList(3);
            for (const product of products) {
                const res = await request(API_BASE_URL).post("/products").set("Authorization", `Bearer ${adminToken}`).send(product);
                expect(res.status).toBe(201);
                expect(res.body).toHaveProperty("name", product.name);
            }
        });

        it("should create product with custom overrides", async () => {
            const customProduct = ProductFactory.build({
                name: "Custom Override Product",
                price: 1234.56,
            });
            const res = await request(API_BASE_URL).post("/products").set("Authorization", `Bearer ${adminToken}`).send(customProduct);
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty("name", "Custom Override Product");
            expect(res.body).toHaveProperty("price", 1234.56);
        });
    });

    describe("User creation with factories", () => {
        it("should create unique users", async () => {
            const user1 = UserFactory.build();
            const user2 = UserFactory.build();
            expect(user1.email).not.toBe(user2.email);
            expect(user1.phone).not.toBe(user2.phone);
        });

        it("should create user with associations", async () => {
            // Register user with unique email
            const userData = UserFactory.build({
                email: `test-user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@factory-test.com`,
            });
            const userRes = await request(API_BASE_URL).post("/auth/register").send(userData);
            expect(userRes.status).toBe(201);
            const userId = userRes.body.user.user_id;
            const newUserToken = userRes.body.access_token;

            // Create product for the order
            const productData = ProductFactory.build();
            const productRes = await request(API_BASE_URL).post("/products").set("Authorization", `Bearer ${adminToken}`).send(productData);
            const productId = productRes.body.product_id;

            // Create order with real IDs using the newly created user's token
            const orderData = {
                user_id: userId, // Required for DTO validation, but will be overridden by the controller
                shipping_address: userData.address,
                payment_method: "Credit Card",
                notes: "Factory-generated order",
                order_items: [
                    {
                        product_id: productId,
                        quantity: 2,
                        unit_price: productData.price,
                    },
                ],
            };

            const orderRes = await request(API_BASE_URL).post("/orders").set("Authorization", `Bearer ${newUserToken}`).send(orderData);
            expect(orderRes.status).toBe(201);
            expect(orderRes.body.user_id).toBe(userId);
        });
    });
});
