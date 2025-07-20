import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { User } from "./user.entity";
import { OrderItem } from "./order-item.entity";

@Entity("orders")
export class Order {
    @PrimaryGeneratedColumn()
    order_id: number;

    @Column()
    user_id: number;

    @ManyToOne(() => User, { eager: true })
    @JoinColumn({ name: "user_id" })
    user: User;

    @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
    order_items: OrderItem[];

    @CreateDateColumn()
    order_date: Date;

    @Column({
        type: "simple-enum",
        enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
        default: "pending",
    })
    status: string;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    total_amount: number;

    @Column({ type: "text" })
    shipping_address: string;

    @Column({ length: 50 })
    payment_method: string;

    @Column({ length: 100, nullable: true })
    tracking_number: string;

    @Column({ type: "text", nullable: true })
    notes: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
