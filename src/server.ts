import "reflect-metadata"; // Necesario para TypeORM
import app from "./app";
import { AppDataSource } from "./config/data";
import { ensurePasswordResetTable, ensureRestauranteFotoColumn } from "./config/migrations";

const PORT = process.env.PORT || 4000;

AppDataSource.initialize()
    .then(async () => {
        console.log("[DB] Conectado a MySQL");

        await ensurePasswordResetTable(AppDataSource);
        await ensureRestauranteFotoColumn(AppDataSource);

        app.listen(PORT, () => {
            console.log(`[HTTP] Servidor corriendo en http://localhost:${PORT}`);
        });
    })
    .catch((err: unknown) => {
        console.error("[DB] Error al conectar con la base de datos:", err);
    });

