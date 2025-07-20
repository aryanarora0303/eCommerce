import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
    getHello(): object {
        return {
            message: "Welcome to eCommerce API",
            version: "1.0.0",
            docs: "See docs/ directory for complete documentation",
        };
    }

    getHealthCheck(): object {
        return {
            status: "ok",
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || "development",
            database: {
                type: "SQLite",
                file: "ecommerce.db",
                status: "connected",
            },
            version: "1.0.0",
        };
    }
}
