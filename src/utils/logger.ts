import { inspect } from "util";

type LogContext = Record<string, unknown>;

const safeStringify = (value: unknown): string => {
    try {
        return JSON.stringify(value);
    } catch {
        return inspect(value, { depth: null, breakLength: Infinity });
    }
};

const serializeContext = (context?: LogContext) => {
    if (!context || Object.keys(context).length === 0) {
        return "";
    }
    return ` | ${safeStringify(context)}`;
};

const formatValue = (value: unknown): string => {
    if (value instanceof Error) {
        return value.stack ?? value.message;
    }
    if (typeof value === "object" && value !== null) {
        return safeStringify(value);
    }
    return String(value);
};

export const logInfo = (message: string, context?: LogContext) => {
    console.info(`[INFO] ${message}${serializeContext(context)}`);
};

export const logWarn = (message: string, context?: LogContext) => {
    console.warn(`[WARN] ${message}${serializeContext(context)}`);
};

export const logError = (message: string, error?: unknown, context?: LogContext) => {
    const parts = [`[ERROR] ${message}${serializeContext(context)}`];
    if (error) {
        parts.push(formatValue(error));
    }
    console.error(parts.join(" | "));
};
