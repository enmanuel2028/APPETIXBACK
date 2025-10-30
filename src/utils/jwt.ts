import { randomBytes } from "crypto";
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import { logWarn } from "./logger";

dotenv.config();

const ensureSecret = (value: string | undefined, envName: string) => {
    if (value && value.trim().length > 0) {
        return value;
    }

    const fallback = randomBytes(32).toString("hex");
    logWarn(`Missing ${envName}. Generated a temporary secret; configure ${envName} to persist tokens across restarts.`);
    return fallback;
};

const ACCESS_SECRET = ensureSecret(process.env.JWT_ACCESS_SECRET, "JWT_ACCESS_SECRET");
const REFRESH_SECRET = ensureSecret(process.env.JWT_REFRESH_SECRET, "JWT_REFRESH_SECRET");

export const signAccess = (payload: any) =>
    jwt.sign(payload, ACCESS_SECRET, { expiresIn: "15m" });

export const signRefresh = (payload: any) =>
    jwt.sign(payload, REFRESH_SECRET, { expiresIn: "30d" });

export const verifyAccess = (token: string) =>
    jwt.verify(token, ACCESS_SECRET) as any;

export const verifyRefresh = (token: string) =>
    jwt.verify(token, REFRESH_SECRET) as any;
