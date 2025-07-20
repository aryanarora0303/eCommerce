import { Injectable, ExecutionContext } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { TokenBlacklistService } from "../token-blacklist.service";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
    constructor(private readonly tokenBlacklistService: TokenBlacklistService) {
        super();
    }

    canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        if (authHeader) {
            const token = authHeader.replace("Bearer ", "");
            if (this.tokenBlacklistService.isTokenBlacklisted(token)) {
                return false; // Token is blacklisted, deny access
            }
        }

        return super.canActivate(context);
    }
}
