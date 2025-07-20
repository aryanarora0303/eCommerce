import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";

@Entity("users")
export class User {
    @PrimaryGeneratedColumn()
    user_id: number;

    @Column({ unique: true, length: 255 })
    email: string;

    @Column({ length: 255 })
    password_hash: string;

    @Column({ length: 100 })
    first_name: string;

    @Column({ length: 100 })
    last_name: string;

    @Column({ length: 20, nullable: true })
    phone: string;

    @Column({ type: "text", nullable: true })
    address: string;

    @Column({ length: 100, nullable: true })
    city: string;

    @Column({ length: 100, nullable: true })
    state: string;

    @Column({ length: 20, nullable: true })
    zip_code: string;

    @Column({ length: 100, default: "Canada" })
    country: string;

    @Column({
        type: "varchar",
        length: 20,
        default: "customer",
        enum: ["admin", "customer", "moderator"],
    })
    role: string;

    @Column({ type: "text", nullable: true })
    refresh_token: string;

    @Column({ type: "boolean", default: true })
    is_active: boolean;

    // Reverse relationships (optional - only include if needed)
    // Uncomment these lines if you want to be able to include orders and reviews with users
    // @OneToMany(() => Order, (order) => order.user)
    // orders: Order[];

    // @OneToMany(() => Review, (review) => review.user)
    // reviews: Review[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
