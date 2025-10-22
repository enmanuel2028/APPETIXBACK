import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Restaurante } from "./Restaurante";
import { Categoria } from "./Categoria";

@Entity("PROMOCIONES")
export class Promocion {
    @PrimaryGeneratedColumn({ name: "idPromocion" })
    idPromocion!: number;

    @ManyToOne(() => Restaurante)
    @JoinColumn({ name: "idRestaurante" })
    restaurante!: Restaurante;

    @ManyToOne(() => Categoria, { nullable: true })
    @JoinColumn({ name: "idCategoria" })
    categoria?: Categoria;

    @Column({ type: "varchar", length: 150 })
    titulo!: string;

    @Column({ type: "text" })
    descripcion!: string;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    precio!: number;

    @Column({ type: "varchar", length: 255, nullable: true })
    imagenUrl!: string;

    @Column({ type: "date" })
    fechaInicio!: Date;

    @Column({ type: "date" })
    fechaFin!: Date;

    @Column({ type: "tinyint", default: 1 })
    estado!: number;
}
