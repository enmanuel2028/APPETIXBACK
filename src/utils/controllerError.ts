import { Response } from "express";
import { isServiceError } from "../service/errors";

export function handleControllerError(res: Response, error: unknown, fallback: string) {
    if (isServiceError(error)) {
        const payload: Record<string, unknown> = { message: error.message };
        if (error.details !== undefined) {
            payload.details = error.details;
        }
        return res.status(error.status).json(payload);
    }

    console.error(error);
    return res.status(500).json({ message: fallback });
}
