# eCommerce Database Design

## Overview

This document outlines the database design for an eCommerce application with 5 core tables and their relationships. The design supports essential eCommerce functionalities including user management, product catalog, order processing, and customer reviews.

> 🐳 **Docker Support**: This application is fully containerized! See the [Docker Setup Guide](../DOCKER.md) for detailed instructions on running with Docker, or use the Quick Start Docker options below.

## Quick Start

### Option 1: Local Development (Node.js)

#### 1. Install Dependencies

```bash
npm install
```

#### 2. Start the Server

```bash
npm run start:dev
```

#### 3. Seed the Database

```bash
# Using npm scripts (recommended)
npm run db:seed

# Or run script directly
./scripts/seed-database.sh
```

#### 4. Manage Database (Optional)

```bash
# Clear all data from database
npm run db:truncate

# Seed fresh data after truncation
npm run db:seed
```

### Option 2: Docker Development

#### 1. Build and Start with Docker Compose

```bash
# Start in development mode (with hot reload)
docker-compose up --build

# Or run in detached mode
docker-compose up --build -d
```

#### 2. Seed the Database (Docker)

```bash
# Using npm scripts (recommended)
docker-compose exec ecommerce-api npm run db:seed

# Or run script directly
docker-compose exec ecommerce-api ./scripts/seed-database.sh
```

#### 3. Manage Database (Docker)

```bash
# Clear all data from database
docker-compose exec ecommerce-api npm run db:truncate

# Seed fresh data
docker-compose exec ecommerce-api npm run db:seed
```

#### 3. View Logs (when running detached)

```bash
docker-compose logs -f ecommerce-api
```

#### 4. Stop the Services

```bash
docker-compose down
```

The seeding script will generate fresh, random data every time you run it. You can run it multiple times to create more test data.

### Access the API

-   API Base URL: `http://localhost:3151`
-   Swagger Documentation: `http://localhost:3151/api`
-   OpenAPI JSON: `http://localhost:3151/api-json`

## Database Management

The project includes two scripts for database management:

### Database Seeding

The `scripts/seed-database.sh` script generates realistic test data for the eCommerce API:

#### Features

-   **Unique Data Every Run**: Uses timestamps and random IDs to ensure no duplicates
-   **Dynamic Database Awareness**: Fetches current counts to create realistic relationships
-   **Comprehensive Data**: Creates users, products, orders, and reviews with realistic relationships
-   **Random but Realistic**: Uses arrays of realistic names, addresses, product types, and review content

#### What Gets Created Each Run

-   **5 Random Users**: Unique emails with timestamp, random names, addresses, and phone numbers
-   **10 Random Products**: Varied categories, brands, prices, and stock quantities
-   **6 Random Orders**: Different users, multiple items per order, varied payment methods
-   **Reviews for All Products**: 2-3 reviews per product with varied ratings and realistic comments

### Database Truncation

The `scripts/truncate-database.sh` script completely clears the database:

#### Features

-   **Complete Data Removal**: Deletes all records from all tables
-   **Safe Deletion Order**: Respects foreign key constraints
-   **Confirmation Required**: Asks for explicit confirmation before deletion
-   **Verification**: Shows before/after counts to confirm successful truncation

### Usage Examples

```bash
# Seed database with sample data
npm run db:seed

# Clear entire database (with confirmation)
npm run db:truncate

# Clear and reseed in one workflow
npm run db:truncate && npm run db:seed

# Legacy commands (still work)
./scripts/seed-database.sh
./scripts/truncate-database.sh
```

Each run will show a summary like:

```
📊 Summary of created data this run:
   👥 Users: 5 new random users
   📦 Products: 10 new random products
   🛒 Orders: 6 new random orders
   ⭐ Reviews: 54 new reviews (covering all products)

📈 Current database totals:
   👥 Total Users: 16
   📦 Total Products: 41
```

## Docker Setup

This application is fully containerized for easy development and practice:

### Docker Files Overview

-   **`Dockerfile`**: Development-optimized image with hot reload support
-   **`docker-compose.yml`**: Development environment with volume mounting
-   **`.dockerignore`**: Optimizes build context by excluding unnecessary files

### Development with Docker

The development setup includes:

-   Hot reload support via volume mounting
-   Automatic restart on file changes
-   Database persistence through volume mounting
-   Health checks for container monitoring

```bash
# Start development environment
docker-compose up --build

# Run in background
docker-compose up --build -d

# View real-time logs
docker-compose logs -f ecommerce-api

# Execute commands in the running container
docker-compose exec ecommerce-api npm run test
docker-compose exec ecommerce-api ./scripts/seed-database.sh

# Stop all services
docker-compose down
```

### Docker Commands Reference

```bash
# Build only
docker build -t ecommerce-api .

# Run standalone container
docker run -p 3151:3151 -v $(pwd)/ecommerce.db:/app/ecommerce.db ecommerce-api

# Interactive shell access
docker-compose exec ecommerce-api /bin/sh

# Remove all containers and images
docker-compose down --rmi all --volumes
```

### Database Persistence

The SQLite database is mounted as a volume to ensure data persistence:

-   Development: `./ecommerce.db:/app/ecommerce.db`

### Troubleshooting Docker

```bash
# Check container health
docker-compose ps

# View detailed container information
docker inspect <container-id>

# Clean up unused Docker resources
docker system prune -a

# Rebuild from scratch (no cache)
docker-compose build --no-cache
```

## User Stories

### 1. User Management

-   **As a customer**, I want to create an account so that I can save my personal information and track my orders.
-   **As a customer**, I want to update my profile information including shipping addresses.
-   **As a returning customer**, I want to log in to access my order history and saved preferences.

### 2. Product Catalog

-   **As a customer**, I want to browse products by categories so that I can find what I'm looking for easily.
-   **As a customer**, I want to view detailed product information including price, description, and availability.
-   **As a store manager**, I want to add new products and manage inventory levels.

### 3. Shopping Cart & Orders

-   **As a customer**, I want to add products to my cart and modify quantities before checkout.
-   **As a customer**, I want to place orders and receive confirmation with order details.
-   **As a customer**, I want to track my order status from processing to delivery.

### 4. Product Reviews

-   **As a customer**, I want to read reviews from other customers to make informed purchasing decisions.
-   **As a customer**, I want to write reviews for products I've purchased to help other customers.
-   **As a customer**, I want to rate products on a scale to express my satisfaction level.

### 5. Order Management

-   **As a customer**, I want to view my order history and details of past purchases.
-   **As a store manager**, I want to process orders and update their status.
-   **As a customer**, I want to see individual items in my orders with their quantities and prices.

## Database Tables

### 1. Users Table

**Purpose**: Stores customer account information and authentication details.

| Column Name   | Data Type    | Constraints                                           | Description                           |
| ------------- | ------------ | ----------------------------------------------------- | ------------------------------------- |
| user_id       | INT          | PRIMARY KEY, AUTO_INCREMENT                           | Unique identifier for each user       |
| email         | VARCHAR(255) | UNIQUE, NOT NULL                                      | User's email address (used for login) |
| password_hash | VARCHAR(255) | NOT NULL                                              | Encrypted password                    |
| first_name    | VARCHAR(100) | NOT NULL                                              | User's first name                     |
| last_name     | VARCHAR(100) | NOT NULL                                              | User's last name                      |
| phone         | VARCHAR(20)  | NULL                                                  | Contact phone number                  |
| address       | TEXT         | NULL                                                  | Shipping address                      |
| city          | VARCHAR(100) | NULL                                                  | City                                  |
| state         | VARCHAR(100) | NULL                                                  | State/Province                        |
| zip_code      | VARCHAR(20)  | NULL                                                  | Postal/ZIP code                       |
| country       | VARCHAR(100) | DEFAULT 'Canada'                                      | Country                               |
| created_at    | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP                             | Account creation date                 |
| updated_at    | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Last update date                      |

### 2. Products Table

**Purpose**: Stores product catalog information including details and inventory.

| Column Name    | Data Type     | Constraints                                           | Description                                    |
| -------------- | ------------- | ----------------------------------------------------- | ---------------------------------------------- |
| product_id     | INT           | PRIMARY KEY, AUTO_INCREMENT                           | Unique identifier for each product             |
| name           | VARCHAR(255)  | NOT NULL                                              | Product name                                   |
| description    | TEXT          | NULL                                                  | Detailed product description                   |
| price          | DECIMAL(10,2) | NOT NULL                                              | Product price                                  |
| category       | VARCHAR(100)  | NOT NULL                                              | Product category (Electronics, Clothing, etc.) |
| brand          | VARCHAR(100)  | NULL                                                  | Product brand                                  |
| stock_quantity | INT           | DEFAULT 0                                             | Available inventory                            |
| image_url      | VARCHAR(500)  | NULL                                                  | Product image URL                              |
| is_active      | BOOLEAN       | DEFAULT TRUE                                          | Whether product is available for sale          |
| created_at     | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP                             | Product creation date                          |
| updated_at     | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Last update date                               |

### 3. Orders Table

**Purpose**: Stores order header information and tracks order status.

| Column Name      | Data Type     | Constraints                                                    | Description                      |
| ---------------- | ------------- | -------------------------------------------------------------- | -------------------------------- |
| order_id         | INT           | PRIMARY KEY, AUTO_INCREMENT                                    | Unique identifier for each order |
| user_id          | INT           | FOREIGN KEY REFERENCES Users(user_id)                          | Customer who placed the order    |
| order_date       | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP                                      | When the order was placed        |
| status           | ENUM          | ('pending', 'processing', 'shipped', 'delivered', 'cancelled') | Order status                     |
| total_amount     | DECIMAL(10,2) | NOT NULL                                                       | Total order value                |
| shipping_address | TEXT          | NOT NULL                                                       | Delivery address                 |
| payment_method   | VARCHAR(50)   | NOT NULL                                                       | Payment method used              |
| tracking_number  | VARCHAR(100)  | NULL                                                           | Shipping tracking number         |
| notes            | TEXT          | NULL                                                           | Special instructions or notes    |
| created_at       | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP                                      | Order creation timestamp         |
| updated_at       | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP          | Last status update               |

### 4. Order_Items Table

**Purpose**: Stores individual items within each order (order line items).

| Column Name   | Data Type     | Constraints                                 | Description                              |
| ------------- | ------------- | ------------------------------------------- | ---------------------------------------- |
| order_item_id | INT           | PRIMARY KEY, AUTO_INCREMENT                 | Unique identifier for each order item    |
| order_id      | INT           | FOREIGN KEY REFERENCES Orders(order_id)     | Associated order                         |
| product_id    | INT           | FOREIGN KEY REFERENCES Products(product_id) | Product being ordered                    |
| quantity      | INT           | NOT NULL, CHECK (quantity > 0)              | Number of items ordered                  |
| unit_price    | DECIMAL(10,2) | NOT NULL                                    | Price per unit at time of order          |
| total_price   | DECIMAL(10,2) | NOT NULL                                    | Calculated total (quantity × unit_price) |
| created_at    | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP                   | Item added to order timestamp            |

### 5. Reviews Table

**Purpose**: Stores customer reviews and ratings for products.

| Column Name          | Data Type    | Constraints                                           | Description                                |
| -------------------- | ------------ | ----------------------------------------------------- | ------------------------------------------ |
| review_id            | INT          | PRIMARY KEY, AUTO_INCREMENT                           | Unique identifier for each review          |
| user_id              | INT          | FOREIGN KEY REFERENCES Users(user_id)                 | Customer who wrote the review              |
| product_id           | INT          | FOREIGN KEY REFERENCES Products(product_id)           | Product being reviewed                     |
| rating               | INT          | NOT NULL, CHECK (rating >= 1 AND rating <= 5)         | Star rating (1-5)                          |
| title                | VARCHAR(255) | NULL                                                  | Review title/summary                       |
| comment              | TEXT         | NULL                                                  | Detailed review text                       |
| is_verified_purchase | BOOLEAN      | DEFAULT FALSE                                         | Whether reviewer purchased the product     |
| helpful_votes        | INT          | DEFAULT 0                                             | Number of "helpful" votes from other users |
| created_at           | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP                             | Review creation date                       |
| updated_at           | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Last update date                           |

## Entity Relationship Diagram (ERD)

```
Users (1) ←→ (M) Orders ←→ (M) Order_Items (M) ←→ (1) Products
  ↓                                                      ↑
  └─────────────── (M) Reviews (M) ──────────────────────┘
```

## Relationships Explanation

### 1. Users → Orders (One-to-Many)

-   **Relationship**: One user can place multiple orders
-   **Foreign Key**: `orders.user_id` references `users.user_id`
-   **Business Rule**: Each order must belong to exactly one user

### 2. Orders → Order_Items (One-to-Many)

-   **Relationship**: One order can contain multiple items
-   **Foreign Key**: `order_items.order_id` references `orders.order_id`
-   **Business Rule**: Each order item belongs to exactly one order

### 3. Products → Order_Items (One-to-Many)

-   **Relationship**: One product can appear in multiple order items
-   **Foreign Key**: `order_items.product_id` references `products.product_id`
-   **Business Rule**: Each order item references exactly one product

### 4. Users → Reviews (One-to-Many)

-   **Relationship**: One user can write multiple reviews
-   **Foreign Key**: `reviews.user_id` references `users.user_id`
-   **Business Rule**: Each review must be written by exactly one user

### 5. Products → Reviews (One-to-Many)

-   **Relationship**: One product can have multiple reviews
-   **Foreign Key**: `reviews.product_id` references `products.product_id`
-   **Business Rule**: Each review is for exactly one product

## Key Features Supported

### 1. **User Account Management**

-   User registration and authentication
-   Profile management with shipping information
-   Order history tracking

### 2. **Product Catalog**

-   Comprehensive product information
-   Category-based organization
-   Inventory management
-   Product status control

### 3. **Order Processing**

-   Complete order lifecycle management
-   Detailed order items tracking
-   Status updates and tracking
-   Multiple payment methods support

### 4. **Customer Reviews**

-   Product rating system (1-5 stars)
-   Detailed review comments
-   Verified purchase indicators
-   Community engagement (helpful votes)

### 5. **Business Intelligence**

-   Sales tracking through orders
-   Customer behavior analysis
-   Product performance metrics
-   Inventory monitoring

## Sample Queries

### Get all orders for a specific user:

```sql
SELECT o.*, oi.product_id, oi.quantity, oi.unit_price, p.name as product_name
FROM Orders o
JOIN Order_Items oi ON o.order_id = oi.order_id
JOIN Products p ON oi.product_id = p.product_id
WHERE o.user_id = ?
ORDER BY o.order_date DESC;
```

### Get average rating for a product:

```sql
SELECT p.name, AVG(r.rating) as average_rating, COUNT(r.review_id) as total_reviews
FROM Products p
LEFT JOIN Reviews r ON p.product_id = r.product_id
WHERE p.product_id = ?
GROUP BY p.product_id, p.name;
```

### Get top-selling products:

```sql
SELECT p.name, SUM(oi.quantity) as total_sold
FROM Products p
JOIN Order_Items oi ON p.product_id = oi.product_id
JOIN Orders o ON oi.order_id = o.order_id
WHERE o.status = 'delivered'
GROUP BY p.product_id, p.name
ORDER BY total_sold DESC
LIMIT 10;
```

## Constraints and Business Rules

1. **Data Integrity**

    - All foreign key relationships enforced
    - Email addresses must be unique per user
    - Ratings must be between 1 and 5
    - Order quantities must be positive

2. **Business Logic**

    - Users can only review products after purchase (optional enforcement)
    - Order total must match sum of order items
    - Products cannot be ordered if stock is insufficient

3. **Security Considerations**
    - Passwords stored as hashes, never plain text
    - User access control for orders and reviews
    - Input validation for all user-submitted data

This database design provides a solid foundation for an eCommerce application with room for future enhancements such as wishlists, shopping carts, promotions, and advanced inventory management.
