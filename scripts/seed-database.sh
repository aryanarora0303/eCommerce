#!/bin/bash

# Script to populate the eCommerce database with sample data
# Make sure your server is running on http://localhost:3151
# This script generates new random data each time it's run

echo "🌱 Seeding eCommerce database with fresh sample data..."

BASE_URL="http://localhost:3151"

# Generate unique data
TIMESTAMP=$(date +%s)
READABLE_TIME=$(date "+%Y%m%d_%H%M%S")

# Arrays for random data generation
FIRST_NAMES=("Alex" "Emma" "Ryan" "Olivia" "Lucas" "Sophia" "Ethan" "Isabella" "Mason" "Ava" "Logan" "Mia" "Noah" "Charlotte" "Liam" "Amelia" "William" "Harper" "James" "Evelyn")
LAST_NAMES=("Smith" "Johnson" "Williams" "Brown" "Jones" "Garcia" "Miller" "Davis" "Rodriguez" "Martinez" "Hernandez" "Lopez" "Gonzalez" "Wilson" "Anderson" "Thomas" "Taylor" "Moore" "Jackson" "Martin")
CITIES=("Toronto" "Vancouver" "Montreal" "Calgary" "Ottawa" "Edmonton" "Mississauga" "Winnipeg" "Quebec City" "Halifax" "Victoria" "Regina" "Saskatoon" "St. Johns" "Fredericton" "Charlottetown" "Whitehorse" "Yellowknife" "Iqaluit")
STATES=("Ontario" "British Columbia" "Quebec" "Alberta" "Manitoba" "Saskatchewan" "Nova Scotia" "New Brunswick" "Newfoundland and Labrador" "Prince Edward Island" "Northwest Territories" "Yukon" "Nunavut")
DOMAINS=("gmail.com" "yahoo.com" "hotmail.com" "outlook.com" "icloud.com" "protonmail.com")

PRODUCT_CATEGORIES=("Electronics" "Clothing" "Footwear" "Home & Kitchen" "Accessories" "Sports & Outdoors" "Books" "Beauty" "Automotive" "Health")
BRANDS=("Apple" "Samsung" "Nike" "Adidas" "Sony" "Dell" "HP" "Logitech" "Canon" "Microsoft" "Google" "Amazon" "Tesla" "Fitbit" "Garmin")
PAYMENT_METHODS=("Credit Card" "Debit Card" "PayPal" "Apple Pay" "Google Pay" "Bank Transfer")

# Function to get random element from array
get_random_element() {
    local arr=("$@")
    echo "${arr[$RANDOM % ${#arr[@]}]}"
}

# Function to generate random number in range
random_range() {
    echo $((RANDOM % ($2 - $1 + 1) + $1))
}

# Check if server is running
if curl -s $BASE_URL/health > /dev/null; then
    echo "✅ Server is running on $BASE_URL"
else
    echo "❌ Server is not running. Please start the server first with: npm run start:dev or npm run docker:up"
    exit 1
fi

echo ""
echo "📊 Creating sample data..."

# Step 1: Create an admin user for authentication
echo "🔐 Creating admin user for authentication..."

ADMIN_EMAIL="admin.seed.${TIMESTAMP}@example.com"
ADMIN_PASSWORD="AdminPass123!"

ADMIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$ADMIN_EMAIL\",
    \"password\": \"$ADMIN_PASSWORD\",
    \"first_name\": \"Admin\",
    \"last_name\": \"Seeder\",
    \"role\": \"admin\",
    \"phone\": \"+1555000000\",
    \"address\": \"123 Admin St\",
    \"city\": \"Toronto\",
    \"state\": \"Ontario\",
    \"zip_code\": \"M1A 1A1\",
    \"country\": \"Canada\"
  }")

# Extract access token
ADMIN_TOKEN=$(echo "$ADMIN_RESPONSE" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$ADMIN_TOKEN" ]; then
    echo "❌ Failed to create admin user or extract token. Response: $ADMIN_RESPONSE"
    exit 1
fi

echo "✅ Admin user created with token for API access"

# Step 2: Create 5 random users
echo "👥 Creating 5 random users..."

# Array to store created user IDs
CREATED_USER_IDS=()

for i in {1..5}; do
    FIRST_NAME=$(get_random_element "${FIRST_NAMES[@]}")
    LAST_NAME=$(get_random_element "${LAST_NAMES[@]}")
    CITY=$(get_random_element "${CITIES[@]}")
    STATE=$(get_random_element "${STATES[@]}")
    DOMAIN=$(get_random_element "${DOMAINS[@]}")
    
    EMAIL="$(echo $FIRST_NAME | tr '[:upper:]' '[:lower:]').$(echo $LAST_NAME | tr '[:upper:]' '[:lower:]').${TIMESTAMP}.${i}@${DOMAIN}"
    PHONE="+1$(random_range 200 999)$(random_range 200 999)$(random_range 1000 9999)"
    ADDRESS="$(random_range 100 9999) $(get_random_element "Main" "Oak" "Pine" "Elm" "Maple" "Cedar" "Birch") $(get_random_element "St" "Ave" "Rd" "Dr" "Ln")"
    ZIP_CODE="$(printf "%c%d%c %d%c%d" $((RANDOM % 26 + 65)) $((RANDOM % 10)) $((RANDOM % 26 + 65)) $((RANDOM % 10)) $((RANDOM % 26 + 65)) $((RANDOM % 10)))"

    USER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
      -H "Content-Type: application/json" \
      -d "{
        \"email\": \"$EMAIL\",
        \"password\": \"password123\",
        \"first_name\": \"$FIRST_NAME\",
        \"last_name\": \"$LAST_NAME\",
        \"phone\": \"$PHONE\",
        \"address\": \"$ADDRESS\",
        \"city\": \"$CITY\",
        \"state\": \"$STATE\",
        \"zip_code\": \"$ZIP_CODE\",
        \"country\": \"Canada\"
      }")
    
    # Extract user ID from response and store it
    USER_ID=$(echo "$USER_RESPONSE" | grep -o '"user_id":[0-9]*' | cut -d':' -f2)
    if [ ! -z "$USER_ID" ]; then
        CREATED_USER_IDS+=($USER_ID)
    fi
done

echo "✅ Created 5 random users"

# Step 3: Create 10 random products
echo "📦 Creating 10 random products..."

# Array to store created product IDs
CREATED_PRODUCT_IDS=()

PRODUCT_NAMES=(
    "Wireless Bluetooth Headphones" "Smart Fitness Watch" "Portable Power Bank" "Wireless Mouse" "USB-C Hub"
    "Eco-Friendly Water Bottle" "Memory Foam Pillow" "LED Desk Lamp" "Bluetooth Speaker" "Phone Case"
    "Laptop Stand" "Wireless Charger" "Coffee Mug" "Backpack" "Running Shoes"
    "Hoodie" "Sunglasses" "Keyboard" "Monitor" "Gaming Chair"
)

PRODUCT_DESCRIPTIONS=(
    "High-quality audio experience with premium sound" "Track your fitness goals with advanced features"
    "Reliable power source for all your devices" "Precision control for productivity and gaming"
    "Expand your connectivity options" "Stay hydrated with sustainable materials"
    "Comfortable sleep support" "Illuminate your workspace" "Crystal clear sound anywhere"
    "Protect your device in style" "Ergonomic solution for better posture" "Convenient wireless charging"
    "Perfect for your daily caffeine fix" "Durable and spacious storage" "Comfortable athletic performance"
    "Cozy and stylish casual wear" "UV protection with modern design" "Responsive typing experience"
    "Crystal clear visual display" "Ultimate comfort for long sessions"
)

for i in {1..10}; do
    NAME_INDEX=$((RANDOM % ${#PRODUCT_NAMES[@]}))
    DESC_INDEX=$((RANDOM % ${#PRODUCT_DESCRIPTIONS[@]}))
    
    PRODUCT_NAME="${PRODUCT_NAMES[$NAME_INDEX]} ${READABLE_TIME}-${i}"
    DESCRIPTION="${PRODUCT_DESCRIPTIONS[$DESC_INDEX]} - Model ${READABLE_TIME}-${i}"
    CATEGORY=$(get_random_element "${PRODUCT_CATEGORIES[@]}")
    BRAND=$(get_random_element "${BRANDS[@]}")
    PRICE=$(echo "scale=2; $(random_range 20 2000) + $(random_range 0 99)/100" | bc)
    STOCK=$(random_range 10 100)
    
    PRODUCT_RESPONSE=$(curl -s -X POST "$BASE_URL/products" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $ADMIN_TOKEN" \
      -d "{
        \"name\": \"$PRODUCT_NAME\",
        \"description\": \"$DESCRIPTION\",
        \"price\": $PRICE,
        \"category\": \"$CATEGORY\",
        \"brand\": \"$BRAND\",
        \"stock_quantity\": $STOCK,
        \"image_url\": \"https://example.com/product-${READABLE_TIME}-${i}.jpg\",
        \"is_active\": true
      }")
    
    # Extract product ID from response and store it
    PRODUCT_ID=$(echo "$PRODUCT_RESPONSE" | grep -o '"product_id":[0-9]*' | cut -d':' -f2)
    if [ ! -z "$PRODUCT_ID" ]; then
        CREATED_PRODUCT_IDS+=($PRODUCT_ID)
    fi
done

echo "✅ Created 10 random products"

# Get current users and products to create realistic orders and reviews
echo "📋 Fetching current users and products for orders..."

# Get current users and products to create realistic orders and reviews
echo "📋 Determining user and product counts for orders and reviews..."

# Use the IDs we collected from creation, but also get total counts for better estimates
USER_COUNT=${#CREATED_USER_IDS[@]}
PRODUCT_COUNT=${#CREATED_PRODUCT_IDS[@]}

# Get total products count from the public API for a more accurate count
PRODUCTS_RESPONSE=$(curl -s "$BASE_URL/products?limit=1" 2>/dev/null)
TOTAL_PRODUCTS=$(echo "$PRODUCTS_RESPONSE" | grep -o '"total":[0-9]*' | cut -d':' -f2 | head -1)
if [ ! -z "$TOTAL_PRODUCTS" ] && [ "$TOTAL_PRODUCTS" -gt "$PRODUCT_COUNT" ]; then
    PRODUCT_COUNT=$TOTAL_PRODUCTS
fi

# For users, we'll use a conservative estimate since we can't query the endpoint without auth
# We'll assume there might be existing users from previous runs
if [ "$USER_COUNT" -eq 0 ]; then
    USER_COUNT=5
fi

echo "📊 Using $USER_COUNT users and $PRODUCT_COUNT products for order and review creation"

# Step 4: Create 6 random orders
echo "🛒 Creating 6 random orders..."

ORDER_NOTES=(
    "Please deliver after 6 PM" "Leave at front door" "Call before delivery" "Gift wrap please"
    "Business delivery" "Expedite shipping" "Handle with care" "Birthday gift"
    "First order - excited!" "Second order - love the service!" "Express shipping please"
    "Moving gift for new apartment" "Please ring doorbell twice" "Contactless delivery preferred"
)

for i in {1..6}; do
    # Use actual created user IDs when possible, otherwise use estimated range
    if [ ${#CREATED_USER_IDS[@]} -gt 0 ]; then
        USER_ID=${CREATED_USER_IDS[$((RANDOM % ${#CREATED_USER_IDS[@]}))]}
    else
        USER_ID=$(random_range 1 $USER_COUNT)
    fi
    
    # Random payment method
    PAYMENT_METHOD=$(get_random_element "${PAYMENT_METHODS[@]}")
    
    # Random address components
    CITY=$(get_random_element "${CITIES[@]}")
    STATE=$(get_random_element "${STATES[@]}")
    ADDRESS="$(random_range 100 9999) $(get_random_element "Main" "Oak" "Pine" "Elm" "Maple") $(get_random_element "St" "Ave" "Rd")"
    ZIP_CODE="$(printf "%c%d%c %d%c%d" $((RANDOM % 26 + 65)) $((RANDOM % 10)) $((RANDOM % 26 + 65)) $((RANDOM % 10)) $((RANDOM % 26 + 65)) $((RANDOM % 10)))"
    SHIPPING_ADDRESS="$ADDRESS, $CITY, $STATE $ZIP_CODE"
    
    # Random note
    NOTES=$(get_random_element "${ORDER_NOTES[@]}")
    
    # Random number of items (1-3)
    ITEM_COUNT=$(random_range 1 3)
    
    # Build order items JSON
    ORDER_ITEMS="["
    for j in $(seq 1 $ITEM_COUNT); do
        # Use actual created product IDs when possible, otherwise use estimated range
        if [ ${#CREATED_PRODUCT_IDS[@]} -gt 0 ]; then
            PRODUCT_ID=${CREATED_PRODUCT_IDS[$((RANDOM % ${#CREATED_PRODUCT_IDS[@]}))]}
        else
            PRODUCT_ID=$(random_range 1 $PRODUCT_COUNT)
        fi
        QUANTITY=$(random_range 1 3)
        UNIT_PRICE=$(echo "scale=2; $(random_range 20 1000) + $(random_range 0 99)/100" | bc)
        
        if [ $j -gt 1 ]; then
            ORDER_ITEMS="$ORDER_ITEMS,"
        fi
        ORDER_ITEMS="$ORDER_ITEMS{\"product_id\":$PRODUCT_ID,\"quantity\":$QUANTITY,\"unit_price\":$UNIT_PRICE}"
    done
    ORDER_ITEMS="$ORDER_ITEMS]"
    
    curl -s -X POST "$BASE_URL/orders" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $ADMIN_TOKEN" \
      -d "{
        \"user_id\": $USER_ID,
        \"shipping_address\": \"$SHIPPING_ADDRESS\",
        \"payment_method\": \"$PAYMENT_METHOD\",
        \"notes\": \"$NOTES\",
        \"order_items\": $ORDER_ITEMS
      }" > /dev/null
done

echo "✅ Created 6 random orders"

# Step 5: Create reviews for all products
echo "⭐ Creating reviews for all products..."

REVIEW_TITLES=(
    "Excellent product!" "Great quality" "Love it!" "Highly recommend" "Perfect for my needs"
    "Amazing value" "Top quality" "Fantastic purchase" "Couldn't be happier" "Outstanding"
    "Great experience" "Solid choice" "Very satisfied" "Impressive quality" "Worth every penny"
    "Superb product" "Exceeded expectations" "Perfect fit" "Great design" "Reliable and durable"
)

REVIEW_COMMENTS=(
    "This product exceeded my expectations. Great quality and fast delivery."
    "Exactly what I was looking for. Highly recommend to anyone."
    "Fantastic quality and great value for money. Very satisfied with my purchase."
    "Perfect product, arrived quickly and works exactly as described."
    "Great build quality and excellent performance. Will definitely buy again."
    "Love this product! It'\''s become an essential part of my daily routine."
    "Outstanding quality and attention to detail. Worth every penny."
    "Impressed with the craftsmanship and durability. Highly recommend."
    "Perfect for my needs. Great customer service and fast shipping."
    "Excellent product that delivers on all promises. Very happy with my purchase."
    "Top-notch quality and design. Couldn'\''t ask for more."
    "Reliable and well-made. This product has made my life so much easier."
    "Fantastic value for the price. Quality exceeds expectations."
    "Amazing product that works perfectly. Great addition to my collection."
    "Impressive performance and sleek design. Very pleased with this purchase."
)

# Create 2-3 reviews per product to ensure all products have reviews
REVIEWS_PER_PRODUCT=$(random_range 2 3)
TOTAL_REVIEWS=0

# If we have actual product IDs, use them; otherwise use range
if [ ${#CREATED_PRODUCT_IDS[@]} -gt 0 ]; then
    PRODUCTS_TO_REVIEW=("${CREATED_PRODUCT_IDS[@]}")
else
    PRODUCTS_TO_REVIEW=($(seq 1 $PRODUCT_COUNT))
fi

for product_id in "${PRODUCTS_TO_REVIEW[@]}"; do
    # Create 2-3 reviews for each product
    REVIEWS_FOR_THIS_PRODUCT=$(random_range 2 3)
    
    for review_num in $(seq 1 $REVIEWS_FOR_THIS_PRODUCT); do
        # Use actual created user IDs when possible, otherwise use estimated range
        if [ ${#CREATED_USER_IDS[@]} -gt 0 ]; then
            USER_ID=${CREATED_USER_IDS[$((RANDOM % ${#CREATED_USER_IDS[@]}))]}
        else
            USER_ID=$(random_range 1 $USER_COUNT)
        fi
        
        # Random rating (weighted towards higher ratings)
        RATING_RAND=$((RANDOM % 100))
        if [ $RATING_RAND -lt 40 ]; then
            RATING=5
        elif [ $RATING_RAND -lt 70 ]; then
            RATING=4
        elif [ $RATING_RAND -lt 85 ]; then
            RATING=3
        elif [ $RATING_RAND -lt 95 ]; then
            RATING=2
        else
            RATING=1
        fi
        
        # Random title and comment
        TITLE=$(get_random_element "${REVIEW_TITLES[@]}")
        COMMENT=$(get_random_element "${REVIEW_COMMENTS[@]}")
        
        # Random verified purchase (70% chance of being verified)
        VERIFIED=$((RANDOM % 100))
        if [ $VERIFIED -lt 70 ]; then
            IS_VERIFIED="true"
        else
            IS_VERIFIED="false"
        fi
        
        curl -s -X POST "$BASE_URL/reviews" \
          -H "Content-Type: application/json" \
          -H "Authorization: Bearer $ADMIN_TOKEN" \
          -d "{
            \"user_id\": $USER_ID,
            \"product_id\": $product_id,
            \"rating\": $RATING,
            \"title\": \"$TITLE - ${READABLE_TIME}\",
            \"comment\": \"$COMMENT\",
            \"is_verified_purchase\": $IS_VERIFIED
          }" > /dev/null
        
        TOTAL_REVIEWS=$((TOTAL_REVIEWS + 1))
    done
done

echo "✅ Created $TOTAL_REVIEWS reviews for all $PRODUCT_COUNT products"

echo ""
echo "🎉 Database seeding completed successfully!"
echo "⏰ Timestamp: $READABLE_TIME"
echo ""
echo "📊 Summary of created data this run:"
echo "   👥 Users: 5 new random users"
echo "   📦 Products: 10 new random products"
echo "   🛒 Orders: 6 new random orders"
echo "   ⭐ Reviews: $TOTAL_REVIEWS new reviews (covering all products)"
echo ""
echo "📈 Current database totals:"
echo "   👥 Total Users: $USER_COUNT"
echo "   📦 Total Products: $PRODUCT_COUNT" 
echo ""
echo "🔍 You can now test your API with:"
echo "   • GET $BASE_URL/users?sortBy=created_at&sortOrder=DESC"
echo "   • GET $BASE_URL/products?sortBy=created_at&sortOrder=DESC"
echo "   • GET $BASE_URL/orders?include=user,order_items.product&sortBy=created_at&sortOrder=DESC"
echo "   • GET $BASE_URL/reviews?include=user,product&sortBy=created_at&sortOrder=DESC"
echo ""
echo "🌟 Try advanced querying with the new data:"
echo "   • GET $BASE_URL/products?search=${READABLE_TIME}&sortBy=price&sortOrder=DESC"
echo "   • GET $BASE_URL/reviews?min_rating=4&created_after=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "   • GET $BASE_URL/orders?include=user,order_items.product&page=1&limit=5"
echo "   • GET $BASE_URL/users?search=@${DOMAINS[0]}&sortBy=first_name"
echo ""
echo "🧪 Test with correct primary key field names:"
echo "   • curl -s \"$BASE_URL/users?limit=3\" | jq '.data[] | {user_id: .user_id, email: .email, name: (.first_name + \" \" + .last_name)}'"
echo "   • curl -s \"$BASE_URL/products?limit=3\" | jq '.data[] | {product_id: .product_id, name: .name, price: .price}'"
echo "   • curl -s \"$BASE_URL/orders?include=user,order_items.product&limit=3\" | jq '.data[] | {order_id: .order_id, user_email: .user?.email, items_count: (.order_items | length)}'"
echo "   • curl -s \"$BASE_URL/reviews?include=user,product&limit=3\" | jq '.data[] | {review_id: .review_id, user_email: .user?.email, product_name: .product?.name, rating: .rating}'"
echo ""
echo "💡 Run this script multiple times to generate more random data!"
echo "   Each run creates unique users, products, orders, and reviews."
