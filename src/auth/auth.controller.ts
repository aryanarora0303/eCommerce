import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Get, ValidationPipe, Request } from "@nestjs/common";
import { AuthService, AuthTokens } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { GetUser } from "./decorators/get-user.decorator";
import { User } from "../entities/user.entity";

@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post("register")
    @HttpCode(HttpStatus.CREATED)
    async register(@Body(ValidationPipe) registerDto: RegisterDto): Promise<AuthTokens> {
        return this.authService.register(registerDto);
    }

    @Post("login")
    @HttpCode(HttpStatus.OK)
    async login(@Body(ValidationPipe) loginDto: LoginDto): Promise<AuthTokens> {
        return this.authService.login(loginDto);
    }

    @Post("refresh")
    @HttpCode(HttpStatus.OK)
    async refreshToken(@Body(ValidationPipe) refreshTokenDto: RefreshTokenDto): Promise<AuthTokens> {
        return this.authService.refresh(refreshTokenDto);
    }

    @Post("logout")
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async logout(@GetUser() user: User, @Request() req: any): Promise<{ message: string }> {
        // Extract the access token from the Authorization header
        const authHeader = req.headers.authorization;
        const accessToken = authHeader ? authHeader.replace("Bearer ", "") : undefined;

        await this.authService.logout(user.user_id, accessToken);
        return { message: "Logout successful" };
    }

    @Get("profile")
    @UseGuards(JwtAuthGuard)
    async getProfile(@GetUser() user: User): Promise<Partial<User>> {
        return {
            user_id: user.user_id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            phone: user.phone,
            address: user.address,
            city: user.city,
            state: user.state,
            zip_code: user.zip_code,
            country: user.country,
            role: user.role,
            created_at: user.created_at,
            updated_at: user.updated_at,
        };
    }
}
