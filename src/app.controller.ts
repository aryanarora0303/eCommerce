import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { AppService } from "./app.service";

@ApiTags("Health")
@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get("health")
    @ApiOperation({
        summary: "Health check",
        description: "Check the health status of the API and database connection",
    })
    @ApiResponse({
        status: 200,
        description: "Health check successful",
        example: {
            status: "ok",
            timestamp: "2025-07-03T03:14:37.541Z",
            uptime: 14.477015208,
            environment: "development",
            database: {
                type: "SQLite",
                file: "ecommerce.db",
                status: "connected",
            },
            version: "1.0.0",
        },
    })
    getHealth() {
        return this.appService.getHealthCheck();
    }

    @Get()
    @ApiOperation({
        summary: "API information",
        description: "Get basic API information and welcome message",
    })
    @ApiResponse({
        status: 200,
        description: "API information retrieved",
        example: {
            message: "Welcome to the eCommerce API!",
            version: "1.0.0",
            documentation: "/api",
            endpoints: {
                users: "/users",
                products: "/products",
                orders: "/orders",
                reviews: "/reviews",
                health: "/health",
            },
        },
    })
    getHello() {
        return this.appService.getHello();
    }
}
