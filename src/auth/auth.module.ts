import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { UserService } from "../services/user.service";
import { User } from "../entities/user.entity";
import { TokenBlacklistService } from "./token-blacklist.service";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        PassportModule.register({ defaultStrategy: "jwt" }),
        JwtModule.register({
            secret: process.env.JWT_SECRET || "default-secret-key",
            signOptions: {
                expiresIn: process.env.JWT_EXPIRES_IN || "15m",
            },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, UserService, JwtStrategy, TokenBlacklistService, JwtAuthGuard],
    exports: [AuthService, JwtStrategy, PassportModule, JwtAuthGuard, TokenBlacklistService],
})
export class AuthModule {}
