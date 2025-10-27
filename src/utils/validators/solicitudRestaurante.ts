import { z } from "zod";

const emptyStringToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
    z.preprocess(
        (value) => {
            if (typeof value === "string") {
                const trimmed = value.trim();
                return trimmed === "" ? undefined : trimmed;
            }
            return value === null ? undefined : value;
        },
        schema.optional(),
    );

const estadoResolverInput = z
    .string()
    .trim()
    .transform((value) => value.toLowerCase())
    .refine(
        (value) => ["aprobado", "aprobada", "rechazado", "rechazada"].includes(value),
        { message: "Estado invalido" },
    )
    .transform((value) => (value.startsWith("aprob") ? "aprobado" : "rechazado"));

const estadoFiltroInput = z
    .string()
    .trim()
    .transform((value) => value.toLowerCase())
    .refine(
        (value) =>
            ["pendiente", "aprobado", "aprobada", "rechazado", "rechazada"].includes(value),
        { message: "Estado invalido" },
    )
    .transform((value) => {
        if (value === "pendiente") {
            return "pendiente" as const;
        }
        return value.startsWith("aprob") ? "aprobado" : "rechazado";
    });

export const solicitudRestauranteSchema = z
    .object({
        nombreComercial: z
            .string()
            .trim()
            .min(1, "El nombre comercial es obligatorio")
            .max(150),
        nit: emptyStringToUndefined(z.string().min(5).max(50)),
        telefono: emptyStringToUndefined(z.string().min(5).max(20)),
        direccion: emptyStringToUndefined(z.string().min(5).max(255)),
        ciudad: emptyStringToUndefined(z.string().min(2).max(100)),
        descripcion: emptyStringToUndefined(z.string().min(5).max(500)),
    })
    .strict();

export const resolverSolicitudSchema = z
    .object({
        observaciones: emptyStringToUndefined(z.string().min(5).max(500)),
        comentario: emptyStringToUndefined(z.string().min(5).max(500)),
    })
    .strict()
    .transform((data) => ({
        observaciones: data.observaciones ?? data.comentario,
    }));

export const estadoSolicitudSchema = z
    .object({
        estado: estadoFiltroInput.optional(),
    })
    .strict();

// Para PUT /solicitudes-restaurante/:id (resolver en un solo endpoint)
export const actualizarSolicitudSchema = z
    .object({
        estado: estadoResolverInput,
        observaciones: emptyStringToUndefined(z.string().min(5).max(500)),
        comentario: emptyStringToUndefined(z.string().min(5).max(500)),
    })
    .strict()
    .transform((data) => ({
        estado: data.estado,
        observaciones: data.observaciones ?? data.comentario,
    }));

export type SolicitudRestauranteInput = z.infer<typeof solicitudRestauranteSchema>;
