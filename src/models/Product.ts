// import {
//     Entity,
//     PrimaryGeneratedColumn,
//     Column,
//     CreateDateColumn,
//     UpdateDateColumn,
//     OneToMany,
//     ManyToOne,
// } from "typeorm";

// @Entity()
// export class Category {
//     @PrimaryGeneratedColumn("uuid")
//     id!: string;

//     @Column()
//     name!: string;

//     @OneToMany(() => Product, (product) => product.category, {
//         cascade: true,
//     })
//     products!: Product[];

//     @OneToMany(() => Brand, (brand) => brand.category, {
//         cascade: true,
//     })
//     brands!: Brand[];

//     @CreateDateColumn({ type: "timestamp" })
//     createdAt!: Date;

//     @UpdateDateColumn({ type: "timestamp" })
//     updatedAt!: Date;
// }

// @Entity()
// export class Brand {
//     @PrimaryGeneratedColumn("uuid")
//     id!: string;

//     @Column()
//     name!: string;

//     @ManyToOne(() => Category, (category) => category.brands, {
//         onDelete: "CASCADE",
//         eager: true
//     })
//     category!: Category;

//     @OneToMany(() => Product, (product) => product.brand)
//     products!: Product[];

//     @CreateDateColumn({ type: "timestamp" })
//     createdAt!: Date;

//     @UpdateDateColumn({ type: "timestamp" })
//     updatedAt!: Date;
// }

// @Entity()
// export class Product {
//     @PrimaryGeneratedColumn("uuid")
//     id!: string;

//     @Column()
//     title!: string;

//     @Column()
//     descriptionSmall!: string;

//     @Column({ type: "jsonb" })
//     descriptionLong!: string[];

//     @Column({ type: "float" })
//     price!: number;

//     @Column({ type: "float" })
//     retailPrice!: number;

//     @Column({ type: "jsonb" })
//     images!: string[];

//     @Column({ type: "jsonb" })
//     colors!: string[];

//     @Column()
//     availability!: boolean;

//     @Column({ type: "jsonb" })
//     reviewsText!: string[];

//     @Column()
//     noOfReviews!: number;

//     @Column({ type: "float" })
//     rating!: number;

//     @ManyToOne(() => Category, (category) => category.products, {
//         onDelete: "CASCADE",
//         eager: true,
//     })
//     category!: Category;

//     @ManyToOne(() => Brand, (brand) => brand.products, {
//         onDelete: "CASCADE",
//         eager: true,
//     })
//     brand!: Brand;

//     @Column()
//     additionalInformation!: string;

//     @CreateDateColumn({ type: "timestamp" })
//     createdAt!: Date;

//     @UpdateDateColumn({ type: "timestamp" })
//     updatedAt!: Date;
// }

import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    ManyToOne,
    ManyToMany,
    JoinTable,
} from "typeorm";

@Entity()
export class Category {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    name!: string;

    @OneToMany(() => Product, (product) => product.category, {
        cascade: true,
    })
    products!: Product[];

    @ManyToMany(() => Brand, (brand) => brand.categories, {
        cascade: true,
    })
    @JoinTable()
    brands!: Brand[];

    @CreateDateColumn({ type: "timestamp" })
    createdAt!: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt!: Date;
}

@Entity()
export class Brand {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    name!: string;

    @ManyToMany(() => Category, (category) => category.brands, {
        onDelete: "CASCADE",
        eager: true,
    })
    categories!: Category[];

    @OneToMany(() => Product, (product) => product.brand)
    products!: Product[];

    @CreateDateColumn({ type: "timestamp" })
    createdAt!: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt!: Date;
}

@Entity()
export class Product {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    title!: string;

    @Column()
    descriptionSmall!: string;

    @Column({ type: "jsonb" })
    descriptionLong!: string[];

    @Column({ type: "float" })
    price!: number;

    @Column({ type: "float" })
    retailPrice!: number;

    @Column({ type: "jsonb" })
    images!: string[];

    @Column({ type: "jsonb" })
    colors!: string[];

    @Column()
    availability!: boolean;

    @Column({ type: "jsonb" })
    reviewsText!: string[];

    @Column()
    noOfReviews!: number;

    @Column({ type: "float" })
    rating!: number;

    @ManyToOne(() => Category, (category) => category.products, {
        onDelete: "CASCADE",
        eager: true,
    })
    category!: Category;

    @ManyToOne(() => Brand, (brand) => brand.products, {
        onDelete: "CASCADE",
        eager: true,
    })
    brand!: Brand;

    @Column()
    additionalInformation!: string;

    @CreateDateColumn({ type: "timestamp" })
    createdAt!: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt!: Date;
}
