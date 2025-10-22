import { CrudService } from "./CrudService";
import { Promocion } from "../model/Promocion";
import { ServiceError } from "./errors";
import { Restaurante } from "../model/Restaurante";
import { Categoria } from "../model/Categoria";
import { AppDataSource } from "../config/data";

type CreatePromocionInput = {
    idRestaurante: number;
    idCategoria?: number;
    titulo: string;
    descripcion: string;
    precio: number;
    imagenUrl?: string;
    fechaInicio: string | Date;
    fechaFin: string | Date;
    estado?: number;
};

type UpdatePromocionInput = Partial<CreatePromocionInput>;

export class PromocionService extends CrudService<Promocion> {
    private static instance: PromocionService;
    private readonly restauranteRepo = AppDataSource.getRepository(Restaurante);
    private readonly categoriaRepo = AppDataSource.getRepository(Categoria);

    private constructor() {
        super(Promocion);
    }

    static getInstance(): PromocionService {
        if (!PromocionService.instance) {
            PromocionService.instance = new PromocionService();
        }
        return PromocionService.instance;
    }

    async listActivas(): Promise<Promocion[]> {
        return this.findAll({
            relations: ["restaurante", "restaurante.usuario", "categoria"],
            where: { estado: 1 },
        });
    }

    async listActivasPaged(page: number, limit: number): Promise<{ items: Promocion[]; total: number }> {
        const skip = (page - 1) * limit;
        const [items, total] = await this.repo.findAndCount({
            relations: ["restaurante", "restaurante.usuario", "categoria"],
            where: { estado: 1 },
            skip,
            take: limit,
            order: { idPromocion: "DESC" },
        });
        return { items, total };
    }

    async listByRestaurante(idRestaurante: number): Promise<Promocion[]> {
        return this.findAll({
            where: { restaurante: { idRestaurante }, estado: 1 },
            relations: ["restaurante", "restaurante.usuario", "categoria"],
        });
    }

    async listByRestaurantePaged(
        idRestaurante: number,
        page: number,
        limit: number,
    ): Promise<{ items: Promocion[]; total: number }> {
        const skip = (page - 1) * limit;
        const [items, total] = await this.repo.findAndCount({
            where: { restaurante: { idRestaurante }, estado: 1 },
            relations: ["restaurante", "restaurante.usuario", "categoria"],
            skip,
            take: limit,
            order: { idPromocion: "DESC" },
        });
        return { items, total };
    }

    async createPromocion(input: CreatePromocionInput): Promise<Promocion> {
        const {
            idRestaurante,
            idCategoria,
            titulo,
            descripcion,
            precio,
            imagenUrl,
            fechaInicio,
            fechaFin,
            estado,
        } = input;

        const restaurante = await this.restauranteRepo.findOne({ where: { idRestaurante } });
        if (!restaurante) {
            throw new ServiceError("Restaurante no encontrado", 404);
        }

        let categoria: Categoria | undefined;
        if (idCategoria) {
            categoria = await this.categoriaRepo.findOne({ where: { idCategoria } }) || undefined;
        }

        const promocion = this.create({
            restaurante,
            categoria,
            titulo,
            descripcion,
            precio,
            imagenUrl,
            fechaInicio: new Date(fechaInicio),
            fechaFin: new Date(fechaFin),
            estado: estado ?? 1,
        });

        const saved = await this.save(promocion);
        return this.get(saved.idPromocion);
    }

    async get(idPromocion: number): Promise<Promocion> {
        const promocion = await this.findOne({
            where: { idPromocion },
            relations: ["restaurante", "restaurante.usuario", "categoria"],
        });

        if (!promocion) {
            throw new ServiceError("Promocion no encontrada", 404);
        }

        return promocion;
    }

    async updatePromocion(idPromocion: number, input: UpdatePromocionInput): Promise<Promocion> {
        const promocion = await this.get(idPromocion);
        const { idRestaurante, idCategoria, fechaInicio, fechaFin, ...rest } = input;

        if (idRestaurante && idRestaurante !== promocion.restaurante.idRestaurante) {
            const restaurante = await this.restauranteRepo.findOne({ where: { idRestaurante } });
            if (!restaurante) {
                throw new ServiceError("Restaurante no encontrado", 404);
            }
            promocion.restaurante = restaurante;
        }

        if (idCategoria !== undefined) {
            if (idCategoria === null) {
                promocion.categoria = undefined;
            } else {
                const categoria = await this.categoriaRepo.findOne({ where: { idCategoria } });
                if (!categoria) {
                    throw new ServiceError("Categoria no encontrada", 404);
                }
                promocion.categoria = categoria;
            }
        }

        if (fechaInicio) {
            promocion.fechaInicio = new Date(fechaInicio);
        }

        if (fechaFin) {
            promocion.fechaFin = new Date(fechaFin);
        }

        Object.assign(promocion, rest);
        await this.save(promocion);

        return this.get(idPromocion);
    }

    async deletePromocion(idPromocion: number): Promise<void> {
        const promocion = await this.findOneBy({ idPromocion });
        if (!promocion) {
            throw new ServiceError("Promocion no encontrada", 404);
        }

        await this.remove(promocion);
    }
}
