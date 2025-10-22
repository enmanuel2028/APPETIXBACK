import "reflect-metadata";
import { DataSource } from "typeorm";
import { Usuario } from "../model/Usuarios";
import { Restaurante } from "../model/Restaurante";
import { Categoria } from "../model/Categoria";
import { Promocion } from "../model/Promocion";
import { Calificacion } from "../model/Calificacion";
import { Sesion } from "../model/Sesion";
import { Log } from "../model/Log";
import * as dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "",
    database: process.env.DB_NAME || "APP_RESTAURANTES",
    synchronize: false, // ⚠️ NO usar en producción (puede modificar tablas)
    logging: process.env.NODE_ENV !== "production",
    entities: [Usuario, Restaurante, Categoria, Promocion, Calificacion, Sesion, Log],
});
