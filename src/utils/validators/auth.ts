import { z } from "zod";

export const registerSchema = z
    .object({
        nombre: z.string().min(1, "El nombre es obligatorio"),
        email: z.string().email("Email inválido"),
        password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    })
    .strict();

export const loginSchema = z.object({
    email: z.string().email("Email inválido"),
    password: z.string().min(1, "La contraseña es obligatoria"),
});

export const refreshSchema = z.object({
    refreshToken: z.string().min(1, "refreshToken requerido"),
});

export const logoutSchema = z.object({
    refreshToken: z.string().min(1, "refreshToken requerido"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
