import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserService } from "../../services/user.service";
import { User } from "../../entities/user.entity";

export interface JwtPayload {
    sub: number;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly userService: UserService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || "default-secret-key",
        });
    }

    async validate(payload: JwtPayload): Promise<User> {
        const user = await this.userService.findOne(payload.sub);

        if (!user) {
            throw new UnauthorizedException("User not found");
        }

        if (!user.is_active) {
            throw new UnauthorizedException("User account is inactive");
        }

        return user;
    }
}
