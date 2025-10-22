import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("CATEGORIAS")
export class Categoria {
    @PrimaryGeneratedColumn({ name: "idCategoria" })
    idCategoria!: number;

    @Column({ type: "varchar", length: 100, unique: true })
    nombre!: string;
}
