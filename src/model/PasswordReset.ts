import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column, CreateDateColumn } from "typeorm";
import { Usuario } from "./Usuarios";

@Entity("PASSWORD_RESETS")
export class PasswordReset {
    @PrimaryGeneratedColumn({ name: "idReset" })
    idReset!: number;

    @ManyToOne(() => Usuario)
    @JoinColumn({ name: "idUsuario" })
    usuario!: Usuario;

    @Column({ type: "varchar", length: 255 })
    token!: string;

    @CreateDateColumn({ name: "fechaSolicitud" })
    fechaSolicitud!: Date;

    @Column({ type: "timestamp" })
    fechaExpira!: Date;

    @Column({ type: "boolean", default: false })
    usado!: boolean;
}
