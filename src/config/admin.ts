import { DataSource } from "typeorm";
import { Usuario } from "../model/Usuarios";
import { hashPassword } from "../utils/password";

type SeedOptions = {
    email?: string;
    password?: string;
    name?: string;
};

const DEFAULT_ADMIN_NAME = "Administrador";

const buildOptionsFromEnv = (): SeedOptions => {
    return {
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        name: process.env.ADMIN_NAME || DEFAULT_ADMIN_NAME,
    };
};

export const ensureDefaultAdmin = async (ds: DataSource, opts: SeedOptions = buildOptionsFromEnv()) => {
    const { email, password, name } = opts;
    if (!email || !password) {
        return;
    }

    const userRepo = ds.getRepository(Usuario);
    const exists = await userRepo.findOne({ where: { email } });
    if (exists) {
        return;
    }

    const hashed = await hashPassword(password);
    const admin = userRepo.create({
        nombre: name || DEFAULT_ADMIN_NAME,
        email,
        password: hashed,
        rol: "admin",
        estado: 1,
    });

    await userRepo.save(admin);
    console.log(`[Seed] Usuario admin creado: ${email}`);
};

