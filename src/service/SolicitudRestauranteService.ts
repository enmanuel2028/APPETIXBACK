import { AppDataSource } from "../config/data";
import { SolicitudRestaurante, EstadoSolicitud } from "../model/SolicitudRestaurante";
import { Usuario } from "../model/Usuarios";
import { Restaurante } from "../model/Restaurante";
import { ServiceError } from "./errors";
import { SolicitudRestauranteInput } from "../utils/validators/solicitudRestaurante";
import { RestauranteService } from "./RestauranteService";
import { logInfo, logWarn } from "../utils/logger";

type ResolverInput = {
    observaciones?: string;
};

export class SolicitudRestauranteService {
    private static instance: SolicitudRestauranteService;
    private readonly repo = AppDataSource.getRepository(SolicitudRestaurante);
    private readonly usuarioRepo = AppDataSource.getRepository(Usuario);
    private readonly restauranteRepo = AppDataSource.getRepository(Restaurante);

    private constructor() {}

    static getInstance(): SolicitudRestauranteService {
        if (!SolicitudRestauranteService.instance) {
            SolicitudRestauranteService.instance = new SolicitudRestauranteService();
        }
        return SolicitudRestauranteService.instance;
    }

    async createSolicitud(idUsuario: number, input: SolicitudRestauranteInput): Promise<SolicitudRestaurante> {
        logInfo("SolicitudRestauranteService.createSolicitud", { idUsuario });
        const usuario = await this.usuarioRepo.findOne({ where: { idUsuario } });
        if (!usuario) {
            logWarn("SolicitudRestauranteService.createSolicitud usuario no encontrado", { idUsuario });
            throw new ServiceError("Usuario no encontrado", 404);
        }

        if (usuario.rol === "restaurante") {
            logWarn("SolicitudRestauranteService.createSolicitud usuario ya es restaurante", { idUsuario });
            throw new ServiceError("El usuario ya es un restaurante", 400);
        }

        const pendiente = await this.repo.findOne({ where: { usuario: { idUsuario }, estado: "pendiente" } });

        if (pendiente) {
            logWarn("SolicitudRestauranteService.createSolicitud pendiente existente", { idUsuario, idSolicitud: pendiente.idSolicitud });
            throw new ServiceError("Ya existe una solicitud pendiente por revisar", 400);
        }

        const solicitud = this.repo.create({
            usuario,
            nombreComercial: input.nombreComercial,
            nit: input.nit ?? null,
            telefono: input.telefono ?? null,
            direccion: input.direccion ?? null,
            ciudad: input.ciudad ?? null,
            descripcion: input.descripcion ?? null,
            estado: "pendiente",
            observaciones: null,
            fechaResolucion: null,
        });

        const saved = await this.repo.save(solicitud);
        logInfo("SolicitudRestauranteService.createSolicitud creada", {
            idUsuario,
            idSolicitud: saved.idSolicitud,
        });
        return this.getById(saved.idSolicitud);
    }

    async list(estado?: EstadoSolicitud): Promise<SolicitudRestaurante[]> {
        logInfo("SolicitudRestauranteService.list", { estado: estado ?? "todos" });
        return this.repo.find({
            where: estado ? { estado } : undefined,
            order: { fechaSolicitud: "DESC" },
        });
    }

    async getById(idSolicitud: number): Promise<SolicitudRestaurante> {
        logInfo("SolicitudRestauranteService.getById", { idSolicitud });
        const solicitud = await this.repo.findOne({
            where: { idSolicitud },
        });

        if (!solicitud) {
            logWarn("SolicitudRestauranteService.getById no encontrada", { idSolicitud });
            throw new ServiceError("Solicitud no encontrada", 404);
        }

        return solicitud;
    }

    async getByUsuario(idUsuario: number): Promise<SolicitudRestaurante | null> {
        logInfo("SolicitudRestauranteService.getByUsuario", { idUsuario });
        return this.repo.findOne({
            where: {
                usuario: { idUsuario },
            },
            order: { fechaSolicitud: "DESC" },
        });
    }

    async approveSolicitud(idSolicitud: number, input: ResolverInput = {}): Promise<SolicitudRestaurante> {
        logInfo("SolicitudRestauranteService.approveSolicitud", { idSolicitud });
        await AppDataSource.transaction(async (manager) => {
            const repo = manager.getRepository(SolicitudRestaurante);
            const usuarioRepo = manager.getRepository(Usuario);
            const restauranteRepo = manager.getRepository(Restaurante);

            const solicitud = await repo.findOne({ where: { idSolicitud } });
            if (!solicitud) throw new ServiceError("Solicitud no encontrada", 404);
            if (solicitud.estado !== "pendiente") {
                logWarn("SolicitudRestauranteService.approveSolicitud ya resuelta", {
                    idSolicitud,
                    estado: solicitud.estado,
                });
                throw new ServiceError("La solicitud ya fue resuelta", 400);
            }

            solicitud.estado = "aprobado";
            solicitud.fechaResolucion = new Date();
            solicitud.observaciones = input.observaciones ?? null;
            await repo.save(solicitud);

            const usuario = await usuarioRepo.findOne({ where: { idUsuario: solicitud.usuario.idUsuario } });
            if (!usuario) throw new ServiceError("Usuario asociado no encontrado", 404);

            usuario.rol = "restaurante";
            usuario.estado = 1;
            await usuarioRepo.save(usuario);

            const existeRestaurante = await restauranteRepo.findOne({
                where: { usuario: { idUsuario: usuario.idUsuario } },
                relations: ["usuario"],
            });

            if (!existeRestaurante) {
                const restaurante = restauranteRepo.create({
                    usuario,
                    nombreComercial: solicitud.nombreComercial,
                    direccion: solicitud.direccion ?? undefined,
                    telefono: solicitud.telefono ?? undefined,
                    ciudad: solicitud.ciudad ?? undefined,
                });
                await restauranteRepo.save(restaurante);
                logInfo("SolicitudRestauranteService.approveSolicitud restaurante creado", {
                    idSolicitud,
                    idUsuario: usuario.idUsuario,
                });
            }
        });

        logInfo("SolicitudRestauranteService.approveSolicitud completada", { idSolicitud });
        return this.getById(idSolicitud);
    }

    async rejectSolicitud(idSolicitud: number, input: ResolverInput = {}): Promise<SolicitudRestaurante> {
        logInfo("SolicitudRestauranteService.rejectSolicitud", { idSolicitud });
        await AppDataSource.transaction(async (manager) => {
            const repo = manager.getRepository(SolicitudRestaurante);
            const solicitud = await repo.findOne({ where: { idSolicitud } });
            if (!solicitud) throw new ServiceError("Solicitud no encontrada", 404);
            if (solicitud.estado !== "pendiente") {
                logWarn("SolicitudRestauranteService.rejectSolicitud ya resuelta", {
                    idSolicitud,
                    estado: solicitud.estado,
                });
                throw new ServiceError("La solicitud ya fue resuelta", 400);
            }

            solicitud.estado = "rechazado";
            solicitud.fechaResolucion = new Date();
            solicitud.observaciones = input.observaciones ?? null;
            await repo.save(solicitud);
        });

        logInfo("SolicitudRestauranteService.rejectSolicitud completada", { idSolicitud });
        return this.getById(idSolicitud);
    }
}
