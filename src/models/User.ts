import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({
        length: 100,
    })
    name!: string;

    @Column({ unique: true })
    email!: string;

    @Column()
    password!: string;

    @Column({type: "bigint", nullable: true })
    phoneNumber!: number;

    @Column({ nullable:true })
    address!: string;

    @Column({ type: "jsonb", default: { public_id: "", url: "" } })
    profileImage!: {
        public_id: string;
        url: string;
    };

    @Column({ nullable: true })
    token!: string;

    @CreateDateColumn({ type: "timestamp" })
    createdAt!: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt!: Date;
}
