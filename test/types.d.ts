// Global test types for Jest
import "@types/jest";
import "@types/supertest";

// Jest globals are automatically available, no need to declare them
// Supertest types are handled by @types/supertest

// Custom test utilities can be declared here if needed
declare global {
    namespace jest {
        interface Matchers<R> {
            // Add custom Jest matchers here if needed
        }
    }
}
