import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class TokenBlacklistService {
    private blacklistedTokens = new Set<string>();

    // In production, you'd want to use Redis or a database table
    // and implement TTL (time-to-live) based on token expiration

    blacklistToken(token: string): void {
        // Extract the token without 'Bearer ' prefix if present
        const cleanToken = token.startsWith("Bearer ") ? token.slice(7) : token;
        this.blacklistedTokens.add(cleanToken);

        // Optional: Clean up expired tokens periodically to prevent memory leaks
        // this.cleanupExpiredTokens();
    }

    isTokenBlacklisted(token: string): boolean {
        const cleanToken = token.startsWith("Bearer ") ? token.slice(7) : token;
        return this.blacklistedTokens.has(cleanToken);
    }

    // Clean up expired tokens to prevent memory leaks
    private cleanupExpiredTokens(): void {
        // Implementation would check token expiration and remove expired ones
        // For now, this is a placeholder for a production implementation
    }

    // Clear all blacklisted tokens (for testing purposes)
    clearAll(): void {
        this.blacklistedTokens.clear();
    }
}
