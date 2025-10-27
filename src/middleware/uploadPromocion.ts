import multer from "multer";
import path from "path";
import fs from "fs";

const uploadsBase = path.join(__dirname, "..", "..", "uploads", "promociones");

function ensureDir(dir: string) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        ensureDir(uploadsBase);
        cb(null, uploadsBase);
    },
    filename: (req, file, cb) => {
        const id = req.params.id || "promocion";
        const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
        const safeId = String(id).replace(/[^a-zA-Z0-9_-]/g, "");
        const name = `${safeId}_${Date.now()}${ext}`;
        cb(null, name);
    },
});

function fileFilter(_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
    // Accept images only
    if (!file.mimetype.startsWith("image/")) {
        return cb(new Error("Solo se permiten archivos de imagen"));
    }
    cb(null, true);
}

export const uploadPromocionFoto = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single("foto");

export function publicPromocionFotoPath(filename: string) {
    return `/uploads/promociones/${filename}`;
}