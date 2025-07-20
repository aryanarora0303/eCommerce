import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Enable CORS for frontend integration
    app.enableCors();

    // Swagger configuration
    const config = new DocumentBuilder()
        .setTitle("eCommerce API")
        .setDescription(
            "Comprehensive eCommerce API with advanced querying capabilities including pagination, filtering, sorting, searching, and joins"
        )
        .setVersion("1.0.0")
        .addServer("http://localhost:3151", "Development server")
        .addTag("Users", "User management operations")
        .addTag("Products", "Product catalog operations")
        .addTag("Orders", "Order management operations")
        .addTag("Reviews", "Product review operations")
        .addTag("Health", "Health check operations")
        .setContact("API Support", "https://github.com/yourusername/ecommerce-api", "support@yourcompany.com")
        .setLicense("MIT", "https://opensource.org/licenses/MIT")
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, config, {
        operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
        deepScanRoutes: true,
    });
    SwaggerModule.setup("api", app, document, {
        customSiteTitle: "eCommerce API Documentation",
        customfavIcon: "/favicon.ico",
        customCss: ".swagger-ui .topbar { display: none }",
        swaggerOptions: {
            persistAuthorization: true,
            displayRequestDuration: true,
            docExpansion: "none",
            filter: true,
            showRequestHeaders: true,
            tryItOutEnabled: true,
        },
    });

    const port = process.env.PORT;
    await app.listen(port);

    console.log(`🚀 eCommerce API Server is running on: http://localhost:${port}`);
    console.log(`📊 Health check available at: http://localhost:${port}/health`);
    console.log(`📖 Swagger API docs available at: http://localhost:${port}/api`);
    console.log(`📄 OpenAPI JSON spec available at: http://localhost:${port}/api-json`);
    console.log(`📁 Database: SQLite (ecommerce.db)`);
    console.log(`📋 Generate Postman collection: npm run docker:postman OR npm run postman`);
    console.log(`🌱 Seed database with test data: npm run docker:seed OR npm run db:seed`);
    console.log(`🗑️ Truncate database: npm run docker:truncate OR npm run db:truncate`);
}

bootstrap();
