import express from "express";
import cors from "cors";
import path from "path";
import routes from "./routes";

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (_req, res) => res.json({ ok: true }));

// Static files for uploads
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// Rutas principales
app.use("/api", routes);

export default app;
