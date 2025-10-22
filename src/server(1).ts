import "reflect-metadata"; // Necesario para TypeORM
import app from "./app";
import { AppDataSource } from "./config/data";

const PORT = process.env.PORT || 4000;

AppDataSource.initialize()
    .then(() => {
        console.log("Conectado a MySQL");
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`);
        });
    })
    .catch((err: any) => {
        console.error("Error al conectar con la base de datos:", err);
    });
