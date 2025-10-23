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

export async function ensurePasswordResetTable(ds: DataSource) {
    const queryRunner = ds.createQueryRunner();
    await queryRunner.connect();
    try {
        const hasTable = await queryRunner.hasTable("PASSWORD_RESETS");
        if (!hasTable) {
            await queryRunner.query(`
                CREATE TABLE \`PASSWORD_RESETS\` (
                    \`idReset\` INT NOT NULL AUTO_INCREMENT,
                    \`idUsuario\` INT NOT NULL,
                    \`token\` VARCHAR(255) NOT NULL,
                    \`fechaSolicitud\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    \`fechaExpira\` DATETIME NOT NULL,
                    \`usado\` TINYINT(1) NOT NULL DEFAULT 0,
                    PRIMARY KEY (\`idReset\`),
                    INDEX \`IDX_PASSWORD_RESETS_USER\` (\`idUsuario\`),
                    CONSTRAINT \`FK_PASSWORD_RESETS_USUARIO\` FOREIGN KEY (\`idUsuario\`) REFERENCES \`USUARIOS\`(\`idUsuario\`) ON DELETE CASCADE
                );
            `);
            console.log("[DB] Tabla PASSWORD_RESETS creada");
        }
    } catch (err) {
        console.error("[DB] Error asegurando tabla PASSWORD_RESETS:", err);
    } finally {
        await queryRunner.release();
    }
}

