import { z } from "zod";

export const createPromocionSchema = z
    .object({
        idRestaurante: z.number().int().positive(),
        idCategoria: z.number().int().positive().optional(),
        titulo: z.string().min(1).max(150),
        descripcion: z.string().min(1).max(2000),
        precio: z.number().positive(),
        imagenUrl: z.string().url().max(255).optional(),
        fechaInicio: z.union([z.string().refine(v => !Number.isNaN(Date.parse(v)), "fechaInicio inválida"), z.date()]),
        fechaFin: z.union([z.string().refine(v => !Number.isNaN(Date.parse(v)), "fechaFin inválida"), z.date()]),
        estado: z.number().int().min(0).max(1).optional(),
    })
    .strict();

export const updatePromocionSchema = createPromocionSchema.partial().refine(
    data => Object.keys(data).length > 0,
    { message: "Debe enviar al menos un campo" },
);

export type CreatePromocionInput = z.infer<typeof createPromocionSchema>;
export type UpdatePromocionInput = z.infer<typeof updatePromocionSchema>;

