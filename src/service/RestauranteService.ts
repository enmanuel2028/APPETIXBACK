import { CrudService } from "./CrudService";
import { Restaurante } from "../model/Restaurante";
import { ServiceError } from "./errors";
import { Usuario } from "../model/Usuarios";
import { AppDataSource } from "../config/data";
import { hashPassword } from "../utils/password";

type CreateRestauranteInput = {
    idUsuario: number;
    nombreComercial: string;
    direccion?: string;
    telefono?: string;
    ciudad?: string;
};

type UpdateRestauranteInput = Partial<CreateRestauranteInput> & {
    fotoPerfil?: string | null;
};

export class RestauranteService extends CrudService<Restaurante> {
    private static instance: RestauranteService;
    private readonly usuarioRepo = AppDataSource.getRepository(Usuario);

    private constructor() {
        super(Restaurante);
    }

    static getInstance(): RestauranteService {
        if (!RestauranteService.instance) {
            RestauranteService.instance = new RestauranteService();
        }
        return RestauranteService.instance;
    }

    async list(): Promise<Restaurante[]> {
        return this.findAll({ relations: ["usuario"] });
    }

    async listPaged(page: number, limit: number): Promise<{ items: Restaurante[]; total: number }> {
        const skip = (page - 1) * limit;
        const [items, total] = await this.repo.findAndCount({
            relations: ["usuario"],
            skip,
            take: limit,
            order: { idRestaurante: "ASC" },
        });
        return { items, total };
    }

    async get(idRestaurante: number): Promise<Restaurante> {
        const restaurante = await this.findOne({
            where: { idRestaurante },
            relations: ["usuario"],
        });

        if (!restaurante) {
            throw new ServiceError("Restaurante no encontrado", 404);
        }

        return restaurante;
    }

    async createRestaurante(input: CreateRestauranteInput): Promise<Restaurante> {
        const { idUsuario, nombreComercial, direccion, telefono, ciudad } = input;

        if (!idUsuario || !nombreComercial) {
            throw new ServiceError("idUsuario y nombreComercial son requeridos", 400);
        }

        const usuario = await this.usuarioRepo.findOne({ where: { idUsuario } });
        if (!usuario) {
            throw new ServiceError("Usuario asociado no encontrado", 404);
        }

        const restaurante = this.create({
            usuario,
            nombreComercial,
            direccion,
            telefono,
            ciudad,
        });

        const saved = await this.save(restaurante);

        return this.get(saved.idRestaurante);
    }

    async createRestauranteWithNewUser(input: {
        usuario: { nombre: string; email: string; password: string };
        nombreComercial: string;
        direccion?: string;
        telefono?: string;
        ciudad?: string;
        fotoPerfil?: string;
    }): Promise<Restaurante> {
        const { usuario: u, nombreComercial, direccion, telefono, ciudad, fotoPerfil } = input;

        return AppDataSource.transaction(async (manager) => {
            const usuarioRepo = manager.getRepository(Usuario);
            const restauranteRepo = manager.getRepository(Restaurante);

            const exists = await usuarioRepo.findOne({ where: { email: u.email } });
            if (exists) {
                throw new ServiceError("Email ya registrado", 400);
            }

            const hashed = await hashPassword(u.password);
            const nuevoUsuario = usuarioRepo.create({
                nombre: u.nombre,
                email: u.email,
                password: hashed,
                rol: "restaurante",
                estado: 1,
            });
            const savedUser = await usuarioRepo.save(nuevoUsuario);

            const restaurante = restauranteRepo.create({
                usuario: savedUser,
                nombreComercial,
                direccion,
                telefono,
                ciudad,
                fotoPerfil,
            });

            const savedR = await restauranteRepo.save(restaurante);

            // Cargar relaciones completas
            return this.get(savedR.idRestaurante);
        });
    }

    async updateRestaurante(idRestaurante: number, input: UpdateRestauranteInput): Promise<Restaurante> {
        const restaurante = await this.get(idRestaurante);
        const { idUsuario, ...rest } = input;

        if (idUsuario && idUsuario !== restaurante.usuario.idUsuario) {
            const usuario = await this.usuarioRepo.findOne({ where: { idUsuario } });
            if (!usuario) {
                throw new ServiceError("Usuario asociado no encontrado", 404);
            }
            restaurante.usuario = usuario;
        }

        Object.assign(restaurante, rest);
        await this.save(restaurante);

        return this.get(idRestaurante);
    }

    async deleteRestaurante(idRestaurante: number): Promise<void> {
        const restaurante = await this.findOneBy({ idRestaurante });
        if (!restaurante) {
            throw new ServiceError("Restaurante no encontrado", 404);
        }

        await this.remove(restaurante);
    }
}
