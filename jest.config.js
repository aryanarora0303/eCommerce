module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",

    // Test file patterns
    testMatch: [
        "<rootDir>/test/**/*.test.{js,ts}",
        "<rootDir>/test/**/*.spec.{js,ts}",
        "<rootDir>/test2/**/*.test.{js,ts}",
        "<rootDir>/test2/**/*.spec.{js,ts}",
    ],

    // TypeScript configuration
    transform: {
        "^.+\\.ts$": "ts-jest",
    },

    // Module file extensions
    moduleFileExtensions: ["ts", "js", "json"],

    // Coverage configuration
    collectCoverage: false,
    coverageDirectory: "coverage",
    collectCoverageFrom: ["src/**/*.{ts,js}", "!src/**/*.d.ts", "!src/**/index.ts"],
    coverageReporters: ["text", "lcov", "html"],

    // Test timeout - increased for better stability
    testTimeout: 15000,

    // Setup files
    setupFilesAfterEnv: ["<rootDir>/test/setup.ts"],

    // Clear mocks between tests
    clearMocks: true,

    // Reset modules between tests for better isolation
    resetModules: true,

    // Restore mocks between tests
    restoreMocks: true,

    // Verbose output
    verbose: true,

    // Root directory
    rootDir: ".",

    // Ignore patterns
    testPathIgnorePatterns: ["/node_modules/", "/dist/"],

    // Force Jest to exit after all tests complete
    forceExit: true,

    // Run tests serially to avoid conflicts
    maxWorkers: 1,
};
