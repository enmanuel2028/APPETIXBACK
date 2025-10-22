import { z } from "zod";

export const solicitudRestauranteSchema = z
    .object({
        nombreComercial: z.string().min(1, "El nombre comercial es obligatorio").max(150),
        nit: z.string().min(5).max(50).optional(),
        telefono: z.string().min(5).max(20).optional(),
        direccion: z.string().min(5).max(255).optional(),
        ciudad: z.string().min(2).max(100).optional(),
        descripcion: z.string().min(5).max(500).optional(),
    })
    .strict();

export const resolverSolicitudSchema = z
    .object({
        observaciones: z.string().min(5).max(500).optional(),
    })
    .strict();

export const estadoSolicitudSchema = z
    .object({
        estado: z.enum(["pendiente", "aprobado", "rechazado"]).optional(),
    })
    .strict();

// Para PUT /solicitudes-restaurante/:id (resolver en un solo endpoint)
export const actualizarSolicitudSchema = z
    .object({
        estado: z.enum(["aprobado", "rechazado"]),
        observaciones: z.string().min(5).max(500).optional(),
    })
    .strict();

export type SolicitudRestauranteInput = z.infer<typeof solicitudRestauranteSchema>;
