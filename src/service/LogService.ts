import { CrudService } from "./CrudService";
import { Log } from "../model/Log";
import { ServiceError } from "./errors";
import { Usuario } from "../model/Usuarios";
import { AppDataSource } from "../config/data";

type CreateLogInput = {
    accion: string;
    idUsuario?: number;
};

export class LogService extends CrudService<Log> {
    private static instance: LogService;
    private readonly usuarioRepo = AppDataSource.getRepository(Usuario);

    private constructor() {
        super(Log);
    }

    static getInstance(): LogService {
        if (!LogService.instance) {
            LogService.instance = new LogService();
        }
        return LogService.instance;
    }

    async list(): Promise<Log[]> {
        return this.findAll({ relations: ["usuario"], order: { fecha: "DESC" } });
    }

    async listByUsuario(idUsuario: number): Promise<Log[]> {
        return this.findAll({
            where: { usuario: { idUsuario } },
            relations: ["usuario"],
            order: { fecha: "DESC" },
        });
    }

    async createLog(input: CreateLogInput): Promise<Log> {
        const { accion, idUsuario } = input;
        if (!accion) {
            throw new ServiceError("accion es requerida", 400);
        }

        let usuario: Usuario | undefined;
        if (idUsuario) {
            usuario = await this.usuarioRepo.findOne({ where: { idUsuario } }) || undefined;
        }

        const log = this.create({
            accion,
            usuario,
        });

        return this.save(log);
    }

    async deleteLog(idLog: number): Promise<void> {
        const log = await this.findOneBy({ idLog });
        if (!log) {
            throw new ServiceError("Log no encontrado", 404);
        }

        await this.remove(log);
    }
}
