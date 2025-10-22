import { CrudService } from "./CrudService";
import { Calificacion } from "../model/Calificacion";
import { ServiceError } from "./errors";
import { Usuario } from "../model/Usuarios";
import { Restaurante } from "../model/Restaurante";
import { AppDataSource } from "../config/data";

type CreateCalificacionInput = {
    idUsuario: number;
    idRestaurante: number;
    puntuacion: number;
    comentario?: string;
};

type UpdateCalificacionInput = Partial<Pick<CreateCalificacionInput, "puntuacion" | "comentario">>;

export class CalificacionService extends CrudService<Calificacion> {
    private static instance: CalificacionService;
    private readonly usuarioRepo = AppDataSource.getRepository(Usuario);
    private readonly restauranteRepo = AppDataSource.getRepository(Restaurante);

    private constructor() {
        super(Calificacion);
    }

    static getInstance(): CalificacionService {
        if (!CalificacionService.instance) {
            CalificacionService.instance = new CalificacionService();
        }
        return CalificacionService.instance;
    }

    private validatePuntuacion(value: number) {
        return Number.isInteger(value) && value >= 1 && value <= 5;
    }

    async list(): Promise<Calificacion[]> {
        return this.findAll({
            relations: ["usuario", "restaurante"],
            order: { fecha: "DESC" },
        });
    }

    async listByRestaurante(idRestaurante: number): Promise<Calificacion[]> {
        return this.findAll({
            where: { restaurante: { idRestaurante } },
            relations: ["usuario", "restaurante"],
            order: { fecha: "DESC" },
        });
    }

    async listByUsuario(idUsuario: number): Promise<Calificacion[]> {
        return this.findAll({
            where: { usuario: { idUsuario } },
            relations: ["usuario", "restaurante"],
            order: { fecha: "DESC" },
        });
    }

    async createCalificacion(input: CreateCalificacionInput): Promise<Calificacion> {
        const { idUsuario, idRestaurante, puntuacion, comentario } = input;
        if (!idUsuario || !idRestaurante || puntuacion == null) {
            throw new ServiceError("idUsuario, idRestaurante y puntuacion son requeridos", 400);
        }

        if (!this.validatePuntuacion(puntuacion)) {
            throw new ServiceError("puntuacion debe estar entre 1 y 5", 400);
        }

        const usuario = await this.usuarioRepo.findOne({ where: { idUsuario } });
        const restaurante = await this.restauranteRepo.findOne({ where: { idRestaurante } });

        if (!usuario || !restaurante) {
            throw new ServiceError("Usuario o restaurante no encontrado", 404);
        }

        const calificacion = this.create({
            usuario,
            restaurante,
            puntuacion,
            comentario,
        });

        const saved = await this.save(calificacion);

        return this.findOne({
            where: { idCalificacion: saved.idCalificacion },
            relations: ["usuario", "restaurante"],
        }) as Promise<Calificacion>;
    }

    async updateCalificacion(idCalificacion: number, input: UpdateCalificacionInput): Promise<Calificacion> {
        const calificacion = await this.findOne({
            where: { idCalificacion },
            relations: ["usuario", "restaurante"],
        });

        if (!calificacion) {
            throw new ServiceError("Calificacion no encontrada", 404);
        }

        if (input.puntuacion != null) {
            if (!this.validatePuntuacion(input.puntuacion)) {
                throw new ServiceError("puntuacion debe estar entre 1 y 5", 400);
            }
            calificacion.puntuacion = input.puntuacion;
        }

        if (input.comentario !== undefined) {
            calificacion.comentario = input.comentario;
        }

        return this.save(calificacion);
    }

    async deleteCalificacion(idCalificacion: number): Promise<void> {
        const calificacion = await this.findOneBy({ idCalificacion });
        if (!calificacion) {
            throw new ServiceError("Calificacion no encontrada", 404);
        }

        await this.remove(calificacion);
    }
}
