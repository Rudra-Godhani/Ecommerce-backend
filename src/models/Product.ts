import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";

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

    @Column({ type: "float"})
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

    @Column()
    brand!: string;

    @Column()
    category!: string;

    @Column()
    additionalInformation!: string;

    @CreateDateColumn({ type: "timestamp" })
    createdAt!: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt!: Date;
}
