import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("USUARIOS")
export class Usuario {
    @PrimaryGeneratedColumn({ name: "idUsuario" })
    idUsuario!: number;

    @Column({ type: "varchar", length: 100 })
    nombre!: string;

    @Column({ type: "varchar", length: 100, unique: true })
    email!: string;

    @Column({ type: "varchar", length: 255 })
    password!: string;

    @Column({
        type: "enum",
        enum: ["cliente", "restaurante", "admin"],
        default: "cliente",
    })
    rol!: "cliente" | "restaurante" | "admin";

    @CreateDateColumn({ name: "fechaRegistro" })
    fechaRegistro!: Date;

    @Column({ type: "tinyint", default: 1 })
    estado!: number;
}
