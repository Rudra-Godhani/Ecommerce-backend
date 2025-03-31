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
export class WishList {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @OneToMany(() => WishListItem, (wishListItem) => wishListItem.wishList, {
        cascade: true,
    })
    wishListItems!: WishListItem[];

    @OneToOne(() => User, { eager: true, onDelete: "CASCADE" })
    @JoinColumn()
    user!: User;

    @CreateDateColumn({ type: "timestamp" })
    createdAt!: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt!: Date;
}

@Entity()
@Unique(["wishList", "product"])
export class WishListItem {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => WishList, (wishList) => wishList.wishListItems, {
        onDelete: "CASCADE",
    })
    wishList!: WishList;

    @Column()
    color!: string;

    @ManyToOne(() => Product, { eager: true })
    product!: Product;

    @CreateDateColumn({ type: "timestamp" })
    createdAt!: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt!: Date;
}
