import { Module, ValidationPipe } from "@nestjs/common";
import { APP_PIPE } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

// Entities
import { User } from "./entities/user.entity";
import { Product } from "./entities/product.entity";
import { Order } from "./entities/order.entity";
import { OrderItem } from "./entities/order-item.entity";
import { Review } from "./entities/review.entity";

// Controllers
import { UserController } from "./controllers/user.controller";
import { ProductController } from "./controllers/product.controller";
import { OrderController } from "./controllers/order.controller";
import { ReviewController } from "./controllers/review.controller";

// Services
import { UserService } from "./services/user.service";
import { ProductService } from "./services/product.service";
import { OrderService } from "./services/order.service";
import { ReviewService } from "./services/review.service";

// Auth Module
import { AuthModule } from "./auth/auth.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ".env",
        }),
        TypeOrmModule.forRoot({
            type: "sqlite",
            database: "ecommerce.db",
            entities: [User, Product, Order, OrderItem, Review],
            synchronize: true, // Set to false in production
            logging: true,
        }),
        TypeOrmModule.forFeature([User, Product, Order, OrderItem, Review]),
        AuthModule,
    ],
    controllers: [AppController, UserController, ProductController, OrderController, ReviewController],
    providers: [
        AppService,
        UserService,
        ProductService,
        OrderService,
        ReviewService,
        {
            provide: APP_PIPE,
            useClass: ValidationPipe,
        },
    ],
})
export class AppModule {}
