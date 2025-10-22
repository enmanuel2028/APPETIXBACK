import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { Usuario } from "./Usuarios";
import { Restaurante } from "./Restaurante";

@Entity("CALIFICACIONES")
export class Calificacion {
    @PrimaryGeneratedColumn({ name: "idCalificacion" })
    idCalificacion!: number;

    @ManyToOne(() => Usuario)
    @JoinColumn({ name: "idUsuario" })
    usuario!: Usuario;

    @ManyToOne(() => Restaurante)
    @JoinColumn({ name: "idRestaurante" })
    restaurante!: Restaurante;

    @Column({ type: "int" })
    puntuacion!: number;

    @Column({ type: "text", nullable: true })
    comentario!: string;

    @CreateDateColumn({ name: "fecha" })
    fecha!: Date;
}
