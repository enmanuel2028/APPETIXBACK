import { Response } from "express";
import { isServiceError } from "../service/errors";
import { logError, logWarn } from "./logger";

export function handleControllerError(res: Response, error: unknown, fallback: string) {
    if (isServiceError(error)) {
        logWarn("Service error in controller response", {
            message: error.message,
            status: error.status,
        });
        const payload: Record<string, unknown> = { message: error.message };
        if (error.details !== undefined) {
            payload.details = error.details;
        }
        return res.status(error.status).json(payload);
    }

    logError("Unexpected controller error", error);
    return res.status(500).json({ message: fallback });
}
