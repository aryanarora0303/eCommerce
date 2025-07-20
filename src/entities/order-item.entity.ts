import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Order } from "./order.entity";
import { Product } from "./product.entity";

@Entity("order_items")
export class OrderItem {
    @PrimaryGeneratedColumn()
    order_item_id: number;

    @Column()
    order_id: number;

    @ManyToOne(() => Order, (order) => order.order_items)
    @JoinColumn({ name: "order_id" })
    order: Order;

    @Column()
    product_id: number;

    @ManyToOne(() => Product, { eager: true })
    @JoinColumn({ name: "product_id" })
    product: Product;

    @Column({ type: "int" })
    quantity: number;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    unit_price: number;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    total_price: number;

    @CreateDateColumn()
    created_at: Date;
}
