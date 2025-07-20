#!/bin/bash

# Script to completely truncate the eCommerce database
# WARNING: This will delete ALL data from the database
# Make sure your server is running on http://localhost:3151

echo "🗑️  eCommerce Database Truncation Script"
echo "========================================"
echo ""
echo "⚠️  WARNING: This will DELETE ALL DATA from the database!"
echo "⚠️  This action cannot be undone!"
echo ""

BASE_URL="http://localhost:3151"

# Check if server is not running
if curl -s "$BASE_URL/health" > /dev/null; then
	echo "❌ Server is running, cannot truncate database! This action requires the server to be stopped."
	exit 1
else
	echo "✅ Server is not running on $BASE_URL, proceeding with truncation."
fi

# Confirmation prompt
read -p "Are you sure you want to truncate the entire database? (type 'yes' or 'y' to confirm): " confirmation

if [ "$confirmation" != "yes" ] && [ "$confirmation" != "y" ]; then
    echo "❌ Operation cancelled. Database unchanged."
    exit 0
fi

echo ""
echo "🔥 Starting database truncation..."
echo ""

# Truncate all data from the database by deleting the db file and re-creating it
if [ -f "ecommerce.db" ]; then
	echo "🗑️  Deleting existing database file..."
	rm "ecommerce.db"
fi
echo "✅ Database file deleted successfully!"

# Re-create the database file
echo "📂 Re-creating database file..."
touch "ecommerce.db"
echo "✅ Database file created successfully!"

echo ""
echo "💡 Next steps:"
echo "   • Run 'npm run db:seed' to populate with fresh sample data"
echo "   • Or manually create new data through the API endpoints"
echo "   • Use Postman collections to test with the clean database"
echo ""
echo "🔗 Useful commands after truncation:"
echo "   • npm run db:seed              - Populate with sample data"
echo "   • npm run start:dev            - Start development server"
echo "   • npm test                     - Run test suite on clean DB"
echo "   • ./scripts/generate-postman.sh - Update Postman collections"
