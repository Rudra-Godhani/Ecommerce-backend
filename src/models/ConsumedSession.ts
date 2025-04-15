import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ConsumedSession {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ unique: true })
    sessionId!: string;

    @Column()
    consumedAt!: Date;
}
