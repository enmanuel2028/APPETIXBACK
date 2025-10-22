import "reflect-metadata"; // Necesario para TypeORM
import app from "./app";
import { AppDataSource } from "./config/data";
import { ensureRestauranteFotoColumn } from "./config/migrations";

const PORT = process.env.PORT || 4000;

async function bootstrap() {
    try {
        await AppDataSource.initialize();
        console.log("📦 Conectado a MySQL");

        try {
            console.log("🔄 Verificando migraciones iniciales...");
            await ensureRestauranteFotoColumn(AppDataSource);
            console.log("✅ Migraciones de base de datos completadas");
        } catch (migrationError) {
            console.error("❌ Error al ejecutar migraciones iniciales:", migrationError);

            if (AppDataSource.isInitialized) {
                try {
                    await AppDataSource.destroy();
                } catch (closeError) {
                    console.error(
                        "⚠️ Error al cerrar la conexión tras fallo de migración:",
                        closeError,
                    );
                }
            }

            process.exit(1);
        }

        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (err: unknown) {
        console.error("❌ Error al conectar con la base de datos:", err);
        process.exit(1);
    }
}

void bootstrap();
