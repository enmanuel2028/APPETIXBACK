import { CrudService } from "./CrudService";
import { Categoria } from "../model/Categoria";
import { ServiceError } from "./errors";

type CreateCategoriaInput = {
    nombre: string;
};

type UpdateCategoriaInput = CreateCategoriaInput;

export class CategoriaService extends CrudService<Categoria> {
    private static instance: CategoriaService;

    private constructor() {
        super(Categoria);
    }

    static getInstance(): CategoriaService {
        if (!CategoriaService.instance) {
            CategoriaService.instance = new CategoriaService();
        }
        return CategoriaService.instance;
    }

    async list(): Promise<Categoria[]> {
        return this.findAll({ order: { nombre: "ASC" } });
    }

    async createCategoria(input: CreateCategoriaInput): Promise<Categoria> {
        const { nombre } = input;
        if (!nombre) {
            throw new ServiceError("nombre es requerido", 400);
        }

        const exists = await this.findOne({ where: { nombre } });
        if (exists) {
            throw new ServiceError("La categoria ya existe", 409);
        }

        const categoria = this.create({ nombre });
        return this.save(categoria);
    }

    async updateCategoria(idCategoria: number, input: UpdateCategoriaInput): Promise<Categoria> {
        const categoria = await this.findOneBy({ idCategoria });
        if (!categoria) {
            throw new ServiceError("Categoria no encontrada", 404);
        }

        const exists = await this.findOne({ where: { nombre: input.nombre } });
        if (exists && exists.idCategoria !== categoria.idCategoria) {
            throw new ServiceError("La categoria ya existe", 409);
        }

        categoria.nombre = input.nombre;
        return this.save(categoria);
    }

    async deleteCategoria(idCategoria: number): Promise<void> {
        const categoria = await this.findOneBy({ idCategoria });
        if (!categoria) {
            throw new ServiceError("Categoria no encontrada", 404);
        }

        await this.remove(categoria);
    }
}
