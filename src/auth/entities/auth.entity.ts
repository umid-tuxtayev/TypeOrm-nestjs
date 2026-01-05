import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "users" })
export class Auth {
    @PrimaryGeneratedColumn()
    id: number;
    @Column({ type: 'varchar', nullable: false })
    username: string
    @Column({ type: 'varchar', nullable: false })
    email: string
    @Column({ type: 'varchar', nullable: false })
    password: string
    @Column({ type: 'varchar', default: null, nullable: true })
    otp: string | null
    @Column({ type: 'bigint', default: null , nullable: true})
    otpTime: number | null
    @Column({ type: 'boolean', default: false })
    isVerified: boolean
    @Column({ type: 'varchar', nullable: true })
    declare refreshToken: string | null;
}
