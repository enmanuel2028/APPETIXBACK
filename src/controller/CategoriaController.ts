import { Request, Response } from "express";
import { CategoriaService } from "../service/CategoriaService";
import { handleControllerError } from "../utils/controllerError";
import { toCategoriaView } from "../view/CategoriaView";

const categoriaService = CategoriaService.getInstance();

export class CategoriaController {
    static async create(req: Request, res: Response) {
        try {
            const categoria = await categoriaService.createCategoria(req.body);
            return res.status(201).json(toCategoriaView(categoria));
        } catch (err) {
            return handleControllerError(res, err, "Error al crear categoria");
        }
    }

    static async getAll(_req: Request, res: Response) {
        try {
            const categorias = await categoriaService.list();
            return res.json(categorias.map(toCategoriaView));
        } catch (err) {
            return handleControllerError(res, err, "Error al listar categorias");
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const categoria = await categoriaService.updateCategoria(
                Number(req.params.id),
                req.body,
            );
            return res.json(toCategoriaView(categoria));
        } catch (err) {
            return handleControllerError(res, err, "Error al actualizar categoria");
        }
    }

    static async remove(req: Request, res: Response) {
        try {
            await categoriaService.deleteCategoria(Number(req.params.id));
            return res.json({ success: true });
        } catch (err) {
            return handleControllerError(res, err, "Error al eliminar categoria");
        }
    }
}
