import { CrudService } from "./CrudService";
import { Sesion } from "../model/Sesion";
import { ServiceError } from "./errors";
import { Usuario } from "../model/Usuarios";
import { AppDataSource } from "../config/data";

type CreateSesionInput = {
    idUsuario: number;
    token: string;
    fechaExpira?: string | Date;
};

export class SesionService extends CrudService<Sesion> {
    private static instance: SesionService;
    private readonly usuarioRepo = AppDataSource.getRepository(Usuario);

    private constructor() {
        super(Sesion);
    }

    static getInstance(): SesionService {
        if (!SesionService.instance) {
            SesionService.instance = new SesionService();
        }
        return SesionService.instance;
    }

    async list(): Promise<Sesion[]> {
        return this.findAll({ relations: ["usuario"], order: { fechaInicio: "DESC" } });
    }

    async get(idSesion: number): Promise<Sesion> {
        const sesion = await this.findOne({
            where: { idSesion },
            relations: ["usuario"],
        });

        if (!sesion) {
            throw new ServiceError("Sesion no encontrada", 404);
        }

        return sesion;
    }

    async listByUsuario(idUsuario: number): Promise<Sesion[]> {
        return this.findAll({
            where: { usuario: { idUsuario } },
            relations: ["usuario"],
            order: { fechaInicio: "DESC" },
        });
    }

    async createSesion(input: CreateSesionInput): Promise<Sesion> {
        const { idUsuario, token, fechaExpira } = input;

        if (!idUsuario || !token) {
            throw new ServiceError("idUsuario y token son requeridos", 400);
        }

        const usuario = await this.usuarioRepo.findOne({ where: { idUsuario } });
        if (!usuario) {
            throw new ServiceError("Usuario no encontrado", 404);
        }

        const sesion = this.create({
            usuario,
            token,
            fechaExpira: fechaExpira ? new Date(fechaExpira) : undefined,
        });

        const saved = await this.save(sesion);
        return this.get(saved.idSesion);
    }

    async deleteSesion(idSesion: number): Promise<void> {
        const sesion = await this.findOneBy({ idSesion });
        if (!sesion) {
            throw new ServiceError("Sesion no encontrada", 404);
        }

        await this.remove(sesion);
    }

    async deleteByUsuario(idUsuario: number): Promise<void> {
        const sesiones = await this.findAll({ where: { usuario: { idUsuario } } });
        if (!sesiones.length) {
            return;
        }

        await this.remove(sesiones);
    }
}
