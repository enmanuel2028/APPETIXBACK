import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { Usuario } from "./Usuarios";

@Entity("SESIONES")
export class Sesion {
    @PrimaryGeneratedColumn({ name: "idSesion" })
    idSesion!: number;

    @ManyToOne(() => Usuario)
    @JoinColumn({ name: "idUsuario" })
    usuario!: Usuario;

    @Column({ type: "varchar", length: 255 })
    token!: string;

    @CreateDateColumn({ name: "fechaInicio" })
    fechaInicio!: Date;

    @Column({ type: "timestamp", nullable: true })
    fechaExpira!: Date;
}
