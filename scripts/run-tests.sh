#!/bin/bash

# Test runner script for the eCommerce API
# This script runs comprehensive test suites

echo "🧪 Starting eCommerce API Test Suite"
echo "===================================="

# Check if server is running
SERVER_URL="http://localhost:3151"
echo "📡 Checking if server is running on $SERVER_URL..."

if curl -s "$SERVER_URL/health" > /dev/null; then
    echo "✅ Server is running"
else
    echo "❌ Server is not running. Please start the server first with: npm run start:dev"
    echo "   The tests require the API server to be running."
    exit 1
fi

echo ""
echo "🔄 Running tests..."
echo ""

# Run unit tests
echo "📋 Running Unit Tests..."
npx jest --testPathPattern=unit --verbose || echo "⚠️  Some unit tests failed"

echo ""

# Run integration tests
echo "🔗 Running Integration Tests..."
npx jest --testPathPattern=integration --verbose || echo "⚠️  Some integration tests failed"

echo ""
echo "✅ Test suite completed!"
echo ""
echo "📊 To run specific test types:"
echo "   Unit tests:        npm run test:unit"
echo "   Integration tests: npm run test:integration"
echo "   All tests:         npm test"
echo "   Watch mode:        npm run test:watch"
echo "   Coverage report:   npm run test:coverage"
echo ""
echo "🗄️  Database management:"
echo "   Seed database:     npm run db:seed"
echo "   Truncate database: npm run db:truncate"
