import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn,
} from "typeorm";
import { User } from "./User";
import { Product } from "./Product";

@Entity()
export class Cart {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @OneToMany(() => CartItem, (cartItem) => cartItem.cart, {
        cascade: true
    })
    cartItems!: CartItem[];

    @OneToOne(() => User, { eager: true, onDelete: "CASCADE" })
    @JoinColumn()
    user!: User;

    @CreateDateColumn({ type: "timestamp" })
    createdAt!: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt!: Date;
}

@Entity()
@Unique(["cart", "product"])
export class CartItem {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => Cart, (cart) => cart.cartItems, { onDelete: "CASCADE" })
    cart!: Cart;

    @Column({ type: "int" })
    quantity!: number;

    @ManyToOne(() => Product, { eager: true })
    product!: Product;

    @CreateDateColumn({ type: "timestamp" })
    createdAt!: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt!: Date;
}
