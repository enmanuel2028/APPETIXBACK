import { DataSource } from "typeorm";

export async function ensureRestauranteFotoColumn(ds: DataSource) {
    const queryRunner = ds.createQueryRunner();
    await queryRunner.connect();
    try {
        const result = await queryRunner.query(
            "SHOW COLUMNS FROM `RESTAURANTES` LIKE 'fotoPerfil';",
        );
        if (!Array.isArray(result) || result.length === 0) {
            await queryRunner.query(
                "ALTER TABLE `RESTAURANTES` ADD COLUMN `fotoPerfil` VARCHAR(255) NULL;",
            );
            // eslint-disable-next-line no-console
            console.log("[DB] Columna fotoPerfil agregada a RESTAURANTES");
        }
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error("[DB] Error comprobando/agregando columna fotoPerfil:", err);
    } finally {
        await queryRunner.release();
    }
}

