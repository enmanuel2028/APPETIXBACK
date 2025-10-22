export class ServiceError extends Error {
    readonly status: number;
    readonly details?: unknown;

    constructor(message: string, status = 400, details?: unknown) {
        super(message);
        this.name = "ServiceError";
        this.status = status;
        this.details = details;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export function isServiceError(error: unknown): error is ServiceError {
    return error instanceof ServiceError;
}
