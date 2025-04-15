import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    Length,
    Matches,
    MinLength,
} from "class-validator";
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
} from "typeorm";
import { Product } from "./Product";

export enum OrderStatus {
    PLACED = "Placed",
    PROCESSING = "Processing",
    SHIPPED = "Shipping",
    DELIVERED = "Delivered",
    CANCELLED = "Cancelled",
    REFUNDED = "Refunded",
}

@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    @IsNotEmpty({ message: "Username is required." })
    name!: string;

    @Column({ unique: true })
    @IsEmail({}, { message: "Please enter a valid email address." })
    @IsNotEmpty({ message: "Email is required." })
    email!: string;

    @Column()
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
        {
            message:
                "Password must contain at least one uppercase letter, one lowercase letter, one numeric digit, and one special character.",
        }
    )
    @MinLength(8, { message: "Password must be at least 8 characters long." })
    @IsNotEmpty({ message: "Password is required." })
    password!: string;

    @Column({ type: "bigint", nullable: true })
    @Length(10, 10, { message: "Phone number must be exactly 10 digits long." })
    @IsOptional()
    phoneNumber!: number;

    @Column({ type: "jsonb", default: { public_id: "", url: "" } })
    @IsOptional()
    profileImage!: {
        public_id: string;
        url: string;
    };

    @Column({ nullable: true })
    @IsOptional()
    token!: string;

    @OneToMany(() => Address, (address) => address.user, {
        cascade: true,
        eager: true,
    })
    addresses!: Address[];

    @OneToMany(() => Order, (order) => order.user, { cascade: true })
    orders!: Order[];

    @CreateDateColumn({ type: "timestamp" })
    createdAt!: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt!: Date;
}

@Entity()
export class Address {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    @IsString({ message: "Line1 must be a string" })
    @IsNotEmpty({ message: "Line1 is required" })
    line1!: string;

    @Column({ nullable: true })
    @IsString({ message: "Line2 must be a string" })
    @IsNotEmpty({ message: "Line2 is required" })
    line2!: string;

    @Column({ nullable: true })
    @IsNotEmpty({ message: "City is required" })
    city!: string;

    @Column()
    @IsNotEmpty({ message: "State is required" })
    state!: string;

    @Column()
    @Length(6, 6, { message: "Pincode must be exactly 6 digits long." })
    @IsString({ message: "pincode must be a string" })
    @IsNotEmpty({ message: "Pincode is required" })
    pincode!: string;

    @Column({ default: false })
    isDefault!: boolean;

    @ManyToOne(() => User, (user) => user.addresses, {
        onDelete: "CASCADE",
    })
    user!: User;

    @CreateDateColumn({ type: "timestamp" })
    createdAt!: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt!: Date;
}

@Entity()
export class Order {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "float" })
    total!: number;

    @Column({ type: "float", default: 0 })
    discount!: number;

    @Column({ type: "float", default: 0 })
    netTotal!: number;

    @Column({ type: "float" })
    deliveryCharge!: number;

    @Column({ type: "enum", enum: OrderStatus, default: OrderStatus.PLACED })
    status!: OrderStatus;

    @Column({ nullable: true })
    stripeSessionId!: string;

    @ManyToOne(() => User, (user) => user.orders, { onDelete: "CASCADE" })
    user!: User;

    @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
        cascade: true,
    })
    orderItems!: OrderItem[];

    @ManyToOne(() => Address, {
        eager: true,
    })
    address!: Address;

    @CreateDateColumn({ type: "timestamp" })
    createdAt!: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt!: Date;
}

@Entity()
export class OrderItem {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    quantity!: number;

    @Column({ type: "float" })
    price!: number;

    @Column({ type: "float" })
    totalPrice!: number;

    @Column()
    color!: string;

    @ManyToOne(() => Order, (order) => order.orderItems, {
        onDelete: "CASCADE",
    })
    order!: Order;

    @ManyToOne(() => Product, { eager: true })
    product!: Product;

    @CreateDateColumn({ type: "timestamp" })
    createdAt!: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt!: Date;
}
