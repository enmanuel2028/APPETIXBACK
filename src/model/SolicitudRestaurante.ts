import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";
import { Usuario } from "./Usuarios";

export type EstadoSolicitud = "pendiente" | "aprobado" | "rechazado";

@Entity("SOLICITUDES_RESTAURANTE")
export class SolicitudRestaurante {
    @PrimaryGeneratedColumn({ name: "idSolicitud" })
    idSolicitud!: number;

    @ManyToOne(() => Usuario, { eager: true })
    @JoinColumn({ name: "idUsuario" })
    usuario!: Usuario;

    @Column({ length: 150 })
    nombreComercial!: string;

    @Column({ type: "varchar", length: 50, nullable: true })
    nit?: string | null;

    @Column({ type: "varchar", length: 20, nullable: true })
    telefono?: string | null;

    @Column({ type: "varchar", length: 255, nullable: true })
    direccion?: string | null;

    @Column({ type: "varchar", length: 100, nullable: true })
    ciudad?: string | null;

    @Column({ type: "text", nullable: true })
    descripcion?: string | null;

    @Column({
        type: "enum",
        enum: ["pendiente", "aprobado", "rechazado"],
        default: "pendiente",
    })
    estado!: EstadoSolicitud;

    @CreateDateColumn({ name: "fechaSolicitud" })
    fechaSolicitud!: Date;

    @UpdateDateColumn({ name: "fechaActualizacion" })
    fechaActualizacion!: Date;

    @Column({ type: "datetime", nullable: true })
    fechaResolucion?: Date | null;

    @Column({ type: "text", nullable: true })
    observaciones?: string | null;
}
