import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'products' })
export class Product {
    @PrimaryGeneratedColumn()
    id: number
    @Column({ type: 'varchar', nullable: false })
    name: string
    @Column({ type: 'varchar', nullable: false })
    description: string
    @Column({ type: 'int', nullable: false })
    price: number
}

