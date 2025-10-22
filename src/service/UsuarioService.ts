import { CrudService } from "./CrudService";
import { Usuario } from "../model/Usuarios";
import { ServiceError } from "./errors";
import { hashPassword } from "../utils/password";
import { toUsuarioView } from "../view/UsuarioView";

type CreateUsuarioInput = {
    nombre: string;
    email: string;
    password: string;
    rol?: "cliente" | "restaurante" | "admin";
    estado?: number;
};

type UpdateUsuarioInput = Partial<{
    nombre: string;
    email: string;
    password: string;
    rol: "cliente" | "restaurante" | "admin";
    estado: number;
}>;

export class UsuarioService extends CrudService<Usuario> {
    private static instance: UsuarioService;

    private constructor() {
        super(Usuario);
    }

    static getInstance(): UsuarioService {
        if (!UsuarioService.instance) {
            UsuarioService.instance = new UsuarioService();
        }
        return UsuarioService.instance;
    }

    async list(): Promise<ReturnType<typeof toUsuarioView>[]> {
        const usuarios = await this.findAll({ order: { fechaRegistro: "DESC" } });
        return usuarios.map((usuario) => toUsuarioView(usuario));
    }

    async get(idUsuario: number): Promise<ReturnType<typeof toUsuarioView>> {
        const usuario = await this.findOneBy({ idUsuario });
        if (!usuario) {
            throw new ServiceError("Usuario no encontrado", 404);
        }
        return toUsuarioView(usuario);
    }

    async createUser(input: CreateUsuarioInput): Promise<ReturnType<typeof toUsuarioView>> {
        const { nombre, email, password, rol, estado } = input;
        if (!nombre || !email || !password) {
            throw new ServiceError("nombre, email y password son requeridos", 400);
        }

        const exists = await this.findOne({ where: { email } });
        if (exists) {
            throw new ServiceError("El email ya se encuentra registrado", 409);
        }

        const usuario = this.create({
            nombre,
            email,
            password: await hashPassword(password),
            rol: rol ?? "cliente",
            estado: estado ?? 1,
        });

        const saved = await this.save(usuario);
        return toUsuarioView(saved);
    }

    async updateUser(
        idUsuario: number,
        input: UpdateUsuarioInput,
    ): Promise<ReturnType<typeof toUsuarioView>> {
        const usuario = await this.findOneBy({ idUsuario });
        if (!usuario) {
            throw new ServiceError("Usuario no encontrado", 404);
        }

        const { email, password, ...rest } = input;

        if (email && email !== usuario.email) {
            const exists = await this.findOne({ where: { email } });
            if (exists) {
                throw new ServiceError("El email ya se encuentra registrado", 409);
            }
            usuario.email = email;
        }

        if (password) {
            usuario.password = await hashPassword(password);
        }

        Object.assign(usuario, rest);
        const saved = await this.save(usuario);
        return toUsuarioView(saved);
    }

    async disableUser(idUsuario: number): Promise<void> {
        const usuario = await this.findOneBy({ idUsuario });
        if (!usuario) {
            throw new ServiceError("Usuario no encontrado", 404);
        }

        usuario.estado = 0;
        await this.save(usuario);
    }
}
