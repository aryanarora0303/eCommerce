import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../services/user.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { TokenBlacklistService } from "./token-blacklist.service";
import * as bcrypt from "bcryptjs";

export interface AuthTokens {
    user: any;
    access_token: string;
    refresh_token: string;
}

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly tokenBlacklistService: TokenBlacklistService
    ) {}

    async register(registerDto: RegisterDto) {
        try {
            // Check if user already exists
            const existingUser = await this.userService.findByEmail(registerDto.email);
            if (existingUser) {
                throw new ConflictException("User with this email already exists");
            }

            // Hash password
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

            // Create user with hashed password and default role
            const userData = {
                ...registerDto,
                password_hash: hashedPassword,
                role: registerDto.role || "customer",
                is_active: true,
            };

            const user = await this.userService.create(userData);

            // Generate tokens
            const tokens = await this.generateTokens(user);

            // Save refresh token
            await this.updateRefreshToken(user.user_id, tokens.refresh_token);

            // Return user without password_hash and tokens
            const { password_hash, ...userResult } = user;
            return {
                user: userResult,
                ...tokens,
            };
        } catch (error) {
            if (error instanceof ConflictException) {
                throw error;
            }
            throw new BadRequestException("Failed to register user");
        }
    }

    async login(loginDto: LoginDto) {
        try {
            // Find user by email
            const user = await this.userService.findByEmail(loginDto.email);
            if (!user) {
                throw new UnauthorizedException("Invalid credentials");
            }

            // Check if user is active
            if (!user.is_active) {
                throw new UnauthorizedException("Account is deactivated");
            }

            // Check password
            const isPasswordValid = await bcrypt.compare(loginDto.password, user.password_hash);
            if (!isPasswordValid) {
                throw new UnauthorizedException("Invalid credentials");
            }

            // Generate tokens
            const tokens = await this.generateTokens(user);

            // Save refresh token
            await this.updateRefreshToken(user.user_id, tokens.refresh_token);

            // Return user without password_hash and tokens
            const { password_hash, ...userResult } = user;
            return {
                user: userResult,
                ...tokens,
            };
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new BadRequestException("Failed to login");
        }
    }

    async refresh(refreshTokenDto: RefreshTokenDto) {
        try {
            // Verify refresh token
            const decoded = this.jwtService.verify(refreshTokenDto.refresh_token, {
                secret: process.env.JWT_REFRESH_SECRET || "refresh-secret-key",
            });

            // Find user and check if refresh token matches
            const user = await this.userService.findOne(decoded.sub);
            if (!user) {
                throw new UnauthorizedException("Invalid refresh token");
            }

            if (!user.refresh_token) {
                throw new BadRequestException("Invalid refresh token");
            }

            // Compare refresh tokens directly (since they're stored as plain text)
            if (refreshTokenDto.refresh_token !== user.refresh_token) {
                throw new UnauthorizedException("Invalid refresh token");
            }

            // Check if user is active
            if (!user.is_active) {
                throw new UnauthorizedException("Account is deactivated");
            }

            // Generate new tokens
            const tokens = await this.generateTokens(user);

            // Save new refresh token
            await this.updateRefreshToken(user.user_id, tokens.refresh_token);

            // Return user without password_hash and tokens
            const { password_hash, ...userResult } = user;
            return {
                user: userResult,
                ...tokens,
            };
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new BadRequestException("Invalid refresh token");
        }
    }

    async logout(userId: number, accessToken?: string) {
        try {
            // Clear refresh token from database
            await this.updateRefreshToken(userId, null);

            // Add access token to blacklist if provided
            if (accessToken) {
                this.tokenBlacklistService.blacklistToken(accessToken);
            }

            return { message: "Successfully logged out" };
        } catch (error) {
            throw new BadRequestException("Failed to logout");
        }
    }

    private async generateTokens(user: any) {
        const payload = {
            sub: user.user_id,
            email: user.email,
            role: user.role,
        };

        const [access_token, refresh_token] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: process.env.JWT_SECRET || "default-secret-key",
                expiresIn: process.env.JWT_EXPIRES_IN || "15m",
            }),
            this.jwtService.signAsync(payload, {
                secret: process.env.JWT_REFRESH_SECRET || "refresh-secret-key",
                expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
            }),
        ]);

        return {
            access_token,
            refresh_token,
        };
    }

    private async updateRefreshToken(userId: number, refreshToken: string | null) {
        await this.userService.updateRefreshToken(userId, refreshToken);
    }
}
