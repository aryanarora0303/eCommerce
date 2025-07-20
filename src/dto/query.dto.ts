import { IsOptional, IsNumber, IsString, IsEnum, Min, Max } from "class-validator";
import { Type, Transform } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";

export enum SortOrder {
    ASC = "ASC",
    DESC = "DESC",
}

export class PaginationDto {
    @ApiPropertyOptional({
        example: 1,
        description: "Page number for pagination",
        minimum: 1,
        default: 1,
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({
        example: 10,
        description: "Number of results per page",
        minimum: 1,
        maximum: 100,
        default: 10,
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(100)
    limit?: number = 10;

    @ApiPropertyOptional({
        example: 0,
        description: "Number of records to skip (overrides page calculation)",
        minimum: 0,
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    offset?: number;
}

export class SortDto {
    @ApiPropertyOptional({
        example: "created_at",
        description: "Field to sort by",
        type: "string",
    })
    @IsOptional()
    @IsString()
    sortBy?: string;

    @ApiPropertyOptional({
        example: "ASC",
        description: "Sort order",
        enum: SortOrder,
        default: SortOrder.ASC,
    })
    @IsOptional()
    @IsEnum(SortOrder)
    sortOrder?: SortOrder = SortOrder.ASC;
}

export class FilterDto {
    @ApiPropertyOptional({
        example: "laptop",
        description: "Search term to filter results",
        type: "string",
    })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({
        example: ["user", "product"],
        description: "Related entities to include in the response (joins)",
        type: [String],
        isArray: true,
    })
    @IsOptional()
    @Transform(({ value }) => {
        if (typeof value === "string") {
            return value.split(",");
        }
        return value;
    })
    include?: string[];
}

export class BaseQueryDto extends PaginationDto {
    @ApiPropertyOptional({
        example: "created_at",
        description: "Field to sort by",
        type: "string",
    })
    @IsOptional()
    @IsString()
    sortBy?: string;

    @ApiPropertyOptional({
        example: "ASC",
        description: "Sort order",
        enum: SortOrder,
        default: SortOrder.ASC,
    })
    @IsOptional()
    @IsEnum(SortOrder)
    sortOrder?: SortOrder = SortOrder.ASC;

    @ApiPropertyOptional({
        example: "laptop",
        description: "Search term to filter results",
        type: "string",
    })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({
        example: ["user", "product"],
        description: "Related entities to include in the response (joins). Can be comma-separated string or array",
        type: [String],
        isArray: true,
    })
    @IsOptional()
    @Transform(({ value }) => {
        if (typeof value === "string") {
            return value.split(",");
        }
        return value;
    })
    include?: string[];
}

export interface PaginatedResult<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}
