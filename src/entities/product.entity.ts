import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";

@Entity("products")
export class Product {
    @PrimaryGeneratedColumn()
    product_id: number;

    @Column({ length: 255 })
    name: string;

    @Column({ type: "text", nullable: true })
    description: string;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    price: number;

    @Column({ length: 100 })
    category: string;

    @Column({ length: 100, nullable: true })
    brand: string;

    @Column({ default: 0 })
    stock_quantity: number;

    @Column({ length: 500, nullable: true })
    image_url: string;

    @Column({ default: true })
    is_active: boolean;

    // Reverse relationships (optional - only include if needed)
    // Uncomment these lines if you want to be able to include reviews and order_items with products
    // @OneToMany(() => Review, (review) => review.product)
    // reviews: Review[];

    // @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
    // order_items: OrderItem[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
