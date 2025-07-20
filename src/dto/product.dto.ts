import { IsNotEmpty, IsString, IsNumber, IsOptional, IsBoolean, Length, Min } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { BaseQueryDto } from "./query.dto";

export class CreateProductDto {
    @ApiProperty({
        example: "iPhone 15 Pro",
        description: "Product name",
        maxLength: 255,
    })
    @IsString()
    @IsNotEmpty()
    @Length(1, 255)
    name: string;

    @ApiPropertyOptional({
        example: "Latest iPhone with A17 Pro chip, titanium design, and pro camera system",
        description: "Detailed product description",
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({
        example: 1299.99,
        description: "Product price in CAD",
        minimum: 0,
    })
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    price: number;

    @ApiProperty({
        example: "Electronics",
        description: "Product category",
        maxLength: 100,
    })
    @IsString()
    @IsNotEmpty()
    @Length(1, 100)
    category: string;

    @ApiPropertyOptional({
        example: "Apple",
        description: "Product brand",
        maxLength: 100,
    })
    @IsOptional()
    @IsString()
    @Length(0, 100)
    brand?: string;

    @ApiPropertyOptional({
        example: 50,
        description: "Available stock quantity",
        minimum: 0,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    stock_quantity?: number;

    @ApiPropertyOptional({
        example: "https://example.com/images/iphone15pro.jpg",
        description: "Product image URL",
        maxLength: 500,
    })
    @IsOptional()
    @IsString()
    @Length(0, 500)
    image_url?: string;

    @ApiPropertyOptional({
        example: true,
        description: "Whether the product is active/available for sale",
        default: true,
    })
    @IsOptional()
    @IsBoolean()
    is_active?: boolean;
}

export class UpdateProductDto {
    @ApiPropertyOptional({
        example: "iPhone 15 Pro Max",
        description: "Product name",
        maxLength: 255,
    })
    @IsOptional()
    @IsString()
    @Length(1, 255)
    name?: string;

    @ApiPropertyOptional({
        example: "Latest iPhone with A17 Pro chip, titanium design, and pro camera system with 5x zoom",
        description: "Detailed product description",
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({
        example: 1499.99,
        description: "Product price in CAD",
        minimum: 0,
    })
    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    price?: number;

    @ApiPropertyOptional({
        example: "Electronics",
        description: "Product category",
        maxLength: 100,
    })
    @IsOptional()
    @IsString()
    @Length(1, 100)
    category?: string;

    @ApiPropertyOptional({
        example: "Apple",
        description: "Product brand",
        maxLength: 100,
    })
    @IsOptional()
    @IsString()
    @Length(0, 100)
    brand?: string;

    @ApiPropertyOptional({
        example: 25,
        description: "Available stock quantity",
        minimum: 0,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    stock_quantity?: number;

    @ApiPropertyOptional({
        example: "https://example.com/images/iphone15promax.jpg",
        description: "Product image URL",
        maxLength: 500,
    })
    @IsOptional()
    @IsString()
    @Length(0, 500)
    image_url?: string;

    @ApiPropertyOptional({
        example: true,
        description: "Whether the product is active/available for sale",
    })
    @IsOptional()
    @IsBoolean()
    is_active?: boolean;
}

export class ProductQueryDto extends BaseQueryDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsString()
    brand?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    min_price?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    max_price?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    min_stock?: number;

    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    is_active?: boolean;

    @IsOptional()
    @IsString()
    created_after?: string;

    @IsOptional()
    @IsString()
    created_before?: string;
}
