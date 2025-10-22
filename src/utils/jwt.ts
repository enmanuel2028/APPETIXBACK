import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";

dotenv.config();

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "super-secreto";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "super-secreto-refresh";

export const signAccess = (payload: any) =>
    jwt.sign(payload, ACCESS_SECRET, { expiresIn: "15m" });

export const signRefresh = (payload: any) =>
    jwt.sign(payload, REFRESH_SECRET, { expiresIn: "30d" });

export const verifyAccess = (token: string) =>
    jwt.verify(token, ACCESS_SECRET) as any;

export const verifyRefresh = (token: string) =>
    jwt.verify(token, REFRESH_SECRET) as any;
