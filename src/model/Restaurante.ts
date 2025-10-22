import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Usuario } from "./Usuarios";

@Entity("RESTAURANTES")
export class Restaurante {
    @PrimaryGeneratedColumn({ name: "idRestaurante" })
    idRestaurante!: number;

    @Column()
    nombreComercial!: string;

    @Column({ nullable: true })
    direccion!: string;

    @Column({ nullable: true })
    telefono!: string;

    @Column({ nullable: true })
    ciudad!: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    fotoPerfil?: string;

    @ManyToOne(() => Usuario)
    @JoinColumn({ name: "idUsuario" })
    usuario!: Usuario;
}
