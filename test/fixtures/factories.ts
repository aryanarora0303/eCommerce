import { Factory } from "fishery";

// User Factory
export const UserFactory = Factory.define<any>(({ sequence }) => ({
    email: `user${sequence}@example.com`,
    password: "password123",
    first_name: "Test",
    last_name: `User${sequence}`,
    phone: `+123456789${String(sequence).padStart(2, "0")}`,
    address: `${100 + sequence} Test St`,
    city: "Toronto",
    state: "Ontario",
    zip_code: `M1M ${sequence}M${sequence}`,
    country: "Canada",
}));

// Product Factory
export const ProductFactory = Factory.define<any>(({ sequence }) => ({
    name: `Test Product ${sequence}`,
    description: `Test product ${sequence} for testing purposes`,
    price: 99.99 + sequence * 10,
    category: sequence % 2 === 0 ? "Electronics" : "Clothing",
    brand: sequence % 3 === 0 ? "Apple" : sequence % 3 === 1 ? "Samsung" : "Generic",
    stock_quantity: 10 + sequence,
    image_url: `https://example.com/product${sequence}.jpg`,
    is_active: true,
}));

// Order Factory
export const OrderFactory = Factory.define<any>(({ sequence }) => ({
    user_id: sequence,
    shipping_address: `${100 + sequence} Test St, Toronto, ON M1M ${sequence}M${sequence}, Canada`,
    payment_method: sequence % 2 === 0 ? "Credit Card" : "PayPal",
    notes: `Test order ${sequence} for testing`,
    order_items: [
        {
            product_id: sequence,
            quantity: (sequence % 3) + 1,
            unit_price: 99.99 + sequence * 10,
        },
    ],
}));

// Review Factory
export const ReviewFactory = Factory.define<any>(({ sequence }) => ({
    user_id: sequence,
    product_id: sequence,
    rating: (sequence % 5) + 1, // 1-5 rating
    title: `Review ${sequence} Title`,
    comment: `This is test review ${sequence} for testing purposes.`,
    verified_purchase: sequence % 2 === 0,
}));

// Invalid data factories for error testing
export const InvalidUserFactory = Factory.define<any>(({ sequence }) => ({
    email: `invalid-email-${sequence}`, // Invalid email format
    password: "123", // Too short
    first_name: "",
    last_name: "",
}));

export const InvalidProductFactory = Factory.define<any>(({ sequence }) => ({
    name: "",
    price: -10 - sequence, // Negative price
    category: "",
}));

// Traits for variations (using params instead of traits)
export const PremiumProductFactory = ProductFactory.params({
    price: 999.99,
    category: "Electronics",
    brand: "Apple",
});

export const BudgetProductFactory = ProductFactory.params({
    price: 19.99,
    category: "Clothing",
    brand: "Generic",
});
