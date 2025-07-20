import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./user.entity";
import { Product } from "./product.entity";

@Entity("reviews")
export class Review {
    @PrimaryGeneratedColumn()
    review_id: number;

    @Column()
    user_id: number;

    @ManyToOne(() => User, { eager: true })
    @JoinColumn({ name: "user_id" })
    user: User;

    @Column()
    product_id: number;

    @ManyToOne(() => Product, { eager: true })
    @JoinColumn({ name: "product_id" })
    product: Product;

    @Column({ type: "int" })
    rating: number;

    @Column({ length: 255, nullable: true })
    title: string;

    @Column({ type: "text", nullable: true })
    comment: string;

    @Column({ default: false })
    is_verified_purchase: boolean;

    @Column({ default: 0 })
    helpful_votes: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
