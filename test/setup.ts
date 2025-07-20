import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { AppModule } from "../src/app.module";
import { DataSource } from "typeorm";
import { User } from "../src/entities/user.entity";
import { Order } from "../src/entities/order.entity";
import { OrderItem } from "../src/entities/order-item.entity";
import { Product } from "../src/entities/product.entity";
import { Review } from "../src/entities/review.entity";
import { UserFactory } from "./fixtures/factories";
import { TokenBlacklistService } from "../src/auth/token-blacklist.service";
import * as bcrypt from "bcryptjs";
import request from "supertest";

// Jest setup file for global test configuration

// Extend Jest timeout for integration tests
jest.setTimeout(15000); // Increased timeout

// Global test setup
beforeAll(async () => {
    // Wait for server to be ready
    await new Promise((resolve) => setTimeout(resolve, 2000));
});

// Global test utilities
global.API_BASE_URL = "http://localhost:3001";

let app: INestApplication;
let dataSource: DataSource;

export const clearAllTables = async (dataSource: DataSource): Promise<void> => {
    const userRepository = dataSource.getRepository(User);
    const orderRepository = dataSource.getRepository(Order);
    const orderItemRepository = dataSource.getRepository(OrderItem);
    const productRepository = dataSource.getRepository(Product);
    const reviewRepository = dataSource.getRepository(Review);

    // Clear in correct order to avoid foreign key constraints
    await reviewRepository.clear();
    await orderItemRepository.clear();
    await orderRepository.clear();
    await productRepository.clear();
    await userRepository.clear();
};

export const clearTokenBlacklist = async (app: INestApplication): Promise<void> => {
    try {
        const tokenBlacklistService = app.get(TokenBlacklistService);
        // Clear the blacklist using the proper method
        tokenBlacklistService.clearAll();
    } catch (error) {
        // Service might not be available in all test contexts
        console.warn("TokenBlacklistService not available for clearing:", error.message);
    }
};

export const seedTestData = async (dataSource: DataSource): Promise<void> => {
    // Seed the database with Fishery fixtures (with unique emails to avoid conflicts)
    const users = UserFactory.buildList(10); // Create 10 users

    // Hash passwords for the seeded users and ensure unique emails
    const usersWithHashedPasswords = await Promise.all(
        users.map(async (user, index) => {
            const hashedPassword = await bcrypt.hash(user.password, 12);
            return {
                ...user,
                email: `seeded-${index}-${Date.now()}@example.com`, // Make emails unique
                password_hash: hashedPassword,
                password: undefined, // Remove the plain password field
            };
        })
    );

    const userRepository = dataSource.getRepository(User);
    await userRepository.save(usersWithHashedPasswords);
};

export const setupTestServer = async (
    clearDatabase: boolean = true,
    seedData: boolean = false
): Promise<{ app: INestApplication; dataSource: DataSource }> => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = app.get(DataSource);

    // Always clear token blacklist for fresh start
    await clearTokenBlacklist(app);

    // Clear database if requested
    if (clearDatabase) {
        await clearAllTables(dataSource);
    }

    // Seed test data if requested
    if (seedData) {
        await seedTestData(dataSource);
    }

    return { app, dataSource };
};

export const teardownTestServer = async (): Promise<void> => {
    if (dataSource) {
        await clearTokenBlacklist(app); // Clear blacklist before teardown
        await dataSource.destroy();
    }
    if (app) {
        await app.close();
    }
};

// Enhanced cleanup utility for complete test isolation
export const fullCleanup = async (app: INestApplication, dataSource: DataSource): Promise<void> => {
    await clearTokenBlacklist(app);
    await clearAllTables(dataSource);
};

// Auth-specific test utilities
export interface AuthTestUser {
    user: any;
    accessToken: string;
    refreshToken: string;
}

export const createTestUser = async (
    app: INestApplication,
    overrides: any = {},
    role: "customer" | "admin" | "moderator" = "customer"
): Promise<AuthTestUser> => {
    // Create a unique user using the factory
    const userData = UserFactory.build({
        email: `${role}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@test.com`,
        role,
        ...overrides,
    });

    // Register the user through the API
    const res = await request(app.getHttpServer()).post("/auth/register").send(userData).expect(201);

    return {
        user: { ...userData, user_id: res.body.user.user_id },
        accessToken: res.body.access_token,
        refreshToken: res.body.refresh_token,
    };
};

export const createAdminUser = async (app: INestApplication, overrides: any = {}): Promise<AuthTestUser> => {
    return createTestUser(app, overrides, "admin");
};

export const createCustomerUser = async (app: INestApplication, overrides: any = {}): Promise<AuthTestUser> => {
    return createTestUser(app, overrides, "customer");
};

export const createInvalidUserData = (type: "invalidEmail" | "weakPassword" | "missingFields" | "duplicate" = "invalidEmail") => {
    const baseUser = UserFactory.build();

    switch (type) {
        case "invalidEmail":
            return { ...baseUser, email: "invalid-email-format" };
        case "weakPassword":
            return { ...baseUser, password: "123", email: `weak-${Date.now()}@test.com` };
        case "missingFields":
            return { email: `incomplete-${Date.now()}@test.com` }; // Missing required fields
        case "duplicate":
            return baseUser; // Will be used twice to test duplicates
        default:
            return baseUser;
    }
};
