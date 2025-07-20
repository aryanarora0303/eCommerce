import { IsNotEmpty, IsString, IsNumber, IsOptional, IsBoolean, Length, Min, Max } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { BaseQueryDto } from "./query.dto";

export class CreateReviewDto {
    @ApiProperty({
        description: "ID of the user creating the review",
        example: 1,
        type: "number",
    })
    @IsNumber()
    @IsNotEmpty()
    user_id: number;

    @ApiProperty({
        description: "ID of the product being reviewed",
        example: 1,
        type: "number",
    })
    @IsNumber()
    @IsNotEmpty()
    product_id: number;

    @ApiProperty({
        description: "Rating given to the product (1-5 stars)",
        example: 5,
        minimum: 1,
        maximum: 5,
        type: "number",
    })
    @IsNumber()
    @Min(1)
    @Max(5)
    rating: number;

    @ApiPropertyOptional({
        description: "Optional title for the review",
        example: "Great product!",
        maxLength: 255,
        type: "string",
    })
    @IsOptional()
    @IsString()
    @Length(0, 255)
    title?: string;

    @ApiPropertyOptional({
        description: "Detailed comment about the product",
        example: "This product exceeded my expectations. The quality is excellent and delivery was fast.",
        type: "string",
    })
    @IsOptional()
    @IsString()
    comment?: string;

    @ApiPropertyOptional({
        description: "Whether this review is from a verified purchase",
        example: true,
        type: "boolean",
    })
    @IsOptional()
    @IsBoolean()
    is_verified_purchase?: boolean;
}

export class UpdateReviewDto {
    @ApiPropertyOptional({
        description: "Updated rating for the product (1-5 stars)",
        example: 4,
        minimum: 1,
        maximum: 5,
        type: "number",
    })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(5)
    rating?: number;

    @ApiPropertyOptional({
        description: "Updated title for the review",
        example: "Updated title",
        maxLength: 255,
        type: "string",
    })
    @IsOptional()
    @IsString()
    @Length(0, 255)
    title?: string;

    @ApiPropertyOptional({
        description: "Updated comment about the product",
        example: "Updated my review after using it for a longer time.",
        type: "string",
    })
    @IsOptional()
    @IsString()
    comment?: string;

    @ApiPropertyOptional({
        description: "Updated verified purchase status",
        example: false,
        type: "boolean",
    })
    @IsOptional()
    @IsBoolean()
    is_verified_purchase?: boolean;

    @ApiPropertyOptional({
        description: "Number of helpful votes received",
        example: 10,
        minimum: 0,
        type: "number",
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    helpful_votes?: number;
}

export class ReviewQueryDto extends BaseQueryDto {
    @ApiPropertyOptional({
        description: "Filter reviews by user ID",
        example: 1,
        type: "number",
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    user_id?: number;

    @ApiPropertyOptional({
        description: "Filter reviews by product ID",
        example: 1,
        type: "number",
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    product_id?: number;

    @ApiPropertyOptional({
        description: "Filter reviews by exact rating",
        example: 5,
        minimum: 1,
        maximum: 5,
        type: "number",
    })
    @IsOptional()
    @Type(() => Number)
    @Min(1)
    @Max(5)
    rating?: number;

    @ApiPropertyOptional({
        description: "Filter reviews with rating greater than or equal to this value",
        example: 3,
        minimum: 1,
        maximum: 5,
        type: "number",
    })
    @IsOptional()
    @Type(() => Number)
    @Min(1)
    @Max(5)
    min_rating?: number;

    @ApiPropertyOptional({
        description: "Filter reviews with rating less than or equal to this value",
        example: 4,
        minimum: 1,
        maximum: 5,
        type: "number",
    })
    @IsOptional()
    @Type(() => Number)
    @Min(1)
    @Max(5)
    max_rating?: number;

    @ApiPropertyOptional({
        description: "Filter by verified purchase status",
        example: true,
        type: "boolean",
    })
    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    is_verified_purchase?: boolean;

    @ApiPropertyOptional({
        description: "Filter reviews created after this date (ISO 8601 format)",
        example: "2024-01-01T00:00:00Z",
        type: "string",
    })
    @IsOptional()
    @IsString()
    created_after?: string;

    @ApiPropertyOptional({
        description: "Filter reviews created before this date (ISO 8601 format)",
        example: "2024-12-31T23:59:59Z",
        type: "string",
    })
    @IsOptional()
    @IsString()
    created_before?: string;
}
