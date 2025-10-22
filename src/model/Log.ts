import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { Usuario } from "./Usuarios";

@Entity("LOGS")
export class Log {
  @PrimaryGeneratedColumn({ name: "idLog" })
  idLog!: number;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: "idUsuario" })
  usuario!: Usuario;

  @Column({ type: "varchar", length: 100 })
  accion!: string;

  @CreateDateColumn({ name: "fecha" })
  fecha!: Date;
}
