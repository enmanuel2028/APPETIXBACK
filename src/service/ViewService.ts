import { AppDataSource } from "../config/data";

export class ViewService {
    private static instance: ViewService;

    private constructor() {}

    static getInstance(): ViewService {
        if (!ViewService.instance) {
            ViewService.instance = new ViewService();
        }
        return ViewService.instance;
    }

    async getPromocionesActivas() {
        return AppDataSource.query("SELECT * FROM VW_PROMOCIONES_ACTIVAS");
    }

    async getRatingPromedio() {
        return AppDataSource.query("SELECT * FROM VW_RATING_PROMEDIO");
    }
}
