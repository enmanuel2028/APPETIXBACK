import { z } from "zod";

const restauranteCommonFields = {
    nombreComercial: z.string().min(1).max(150),
    direccion: z.string().min(1).max(255).optional(),
    telefono: z.string().min(5).max(20).optional(),
    ciudad: z.string().min(2).max(100).optional(),
    fotoPerfil: z.string().url().max(255).optional(),
};

const createWithUserIdSchema = z
    .object({
        idUsuario: z.number().int().positive(),
        ...restauranteCommonFields,
    })
    .strict();

const createWithNewUserSchema = z
    .object({
        usuario: z
            .object({
                nombre: z.string().min(1).max(100),
                email: z.string().email().max(100),
                password: z.string().min(6).max(100),
            })
            .strict(),
        ...restauranteCommonFields,
    })
    .strict();

export const createRestauranteSchema = z.union([
    createWithUserIdSchema,
    createWithNewUserSchema,
]);

const updateRestauranteBaseSchema = z
    .object({
        idUsuario: z.number().int().positive(),
        ...restauranteCommonFields,
        fotoPerfil: z.string().url().max(255).nullable(),
    })
    .strict();

export const updateRestauranteSchema = updateRestauranteBaseSchema.partial().refine(
    data => Object.keys(data).length > 0,
    { message: "Debe enviar al menos un campo" },
);

export type CreateRestauranteInput = z.infer<typeof createRestauranteSchema>;
export type CreateRestauranteWithUserIdInput = z.infer<typeof createWithUserIdSchema>;
export type CreateRestauranteWithNewUserInput = z.infer<typeof createWithNewUserSchema>;
export type UpdateRestauranteInput = z.infer<typeof updateRestauranteSchema>;
