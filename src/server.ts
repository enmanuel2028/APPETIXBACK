import "reflect-metadata"; // Necesario para TypeORM
import app from "./app";
import { AppDataSource } from "./config/data";
import { ensurePasswordResetTable, ensureRestauranteFotoColumn } from "./config/migrations";
import { ensureDefaultAdmin } from "./config/admin";

const PORT = process.env.PORT || 4000;

const startServer = async () => {
    try {
        await AppDataSource.initialize();
        console.log("[DB] Conectado a MySQL");

        await ensurePasswordResetTable(AppDataSource);
        await ensureRestauranteFotoColumn(AppDataSource);
        await ensureDefaultAdmin(AppDataSource);

        app.listen(PORT, () => {
            console.log(`[HTTP] Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (err: unknown) {
        console.error("[DB] Error al conectar con la base de datos:", err);
        process.exit(1);
    }
};

void startServer();
