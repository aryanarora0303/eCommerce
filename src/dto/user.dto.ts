import { IsEmail, IsNotEmpty, IsOptional, IsString, Length } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { BaseQueryDto } from "./query.dto";

export class CreateUserDto {
    @ApiProperty({
        example: "john.doe@example.com",
        description: "User's email address",
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        example: "securepassword123",
        description: "User's password (minimum 6 characters)",
        minLength: 6,
        maxLength: 255,
    })
    @IsString()
    @IsNotEmpty()
    @Length(6, 255)
    password: string;

    @ApiProperty({
        example: "John",
        description: "User's first name",
        maxLength: 100,
    })
    @IsString()
    @IsNotEmpty()
    @Length(1, 100)
    first_name: string;

    @ApiProperty({
        example: "Doe",
        description: "User's last name",
        maxLength: 100,
    })
    @IsString()
    @IsNotEmpty()
    @Length(1, 100)
    last_name: string;

    @ApiPropertyOptional({
        example: "+1234567890",
        description: "User's phone number",
        maxLength: 20,
    })
    @IsOptional()
    @IsString()
    @Length(0, 20)
    phone?: string;

    @ApiPropertyOptional({
        example: "123 Main St",
        description: "User's street address",
    })
    @IsOptional()
    @IsString()
    address?: string;

    @ApiPropertyOptional({
        example: "Toronto",
        description: "User's city",
        maxLength: 100,
    })
    @IsOptional()
    @IsString()
    @Length(0, 100)
    city?: string;

    @ApiPropertyOptional({
        example: "Ontario",
        description: "User's state/province",
        maxLength: 100,
    })
    @IsOptional()
    @IsString()
    @Length(0, 100)
    state?: string;

    @ApiPropertyOptional({
        example: "M1M 1M1",
        description: "User's postal/zip code",
        maxLength: 20,
    })
    @IsOptional()
    @IsString()
    @Length(0, 20)
    zip_code?: string;

    @ApiPropertyOptional({
        example: "Canada",
        description: "User's country",
        maxLength: 100,
    })
    @IsOptional()
    @IsString()
    @Length(0, 100)
    country?: string;
}

export class UpdateUserDto {
    @ApiPropertyOptional({
        example: "jane.doe@example.com",
        description: "User's email address",
    })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional({
        example: "newsecurepassword456",
        description: "User's new password (minimum 6 characters)",
        minLength: 6,
        maxLength: 255,
    })
    @IsOptional()
    @IsString()
    @Length(6, 255)
    password?: string;

    @ApiPropertyOptional({
        example: "Jane",
        description: "User's first name",
        maxLength: 100,
    })
    @IsOptional()
    @IsString()
    @Length(1, 100)
    first_name?: string;

    @ApiPropertyOptional({
        example: "Smith",
        description: "User's last name",
        maxLength: 100,
    })
    @IsOptional()
    @IsString()
    @Length(1, 100)
    last_name?: string;

    @ApiPropertyOptional({
        example: "+1987654321",
        description: "User's phone number",
        maxLength: 20,
    })
    @IsOptional()
    @IsString()
    @Length(0, 20)
    phone?: string;

    @ApiPropertyOptional({
        example: "456 Oak St",
        description: "User's street address",
    })
    @IsOptional()
    @IsString()
    address?: string;

    @ApiPropertyOptional({
        example: "Vancouver",
        description: "User's city",
        maxLength: 100,
    })
    @IsOptional()
    @IsString()
    @Length(0, 100)
    city?: string;

    @ApiPropertyOptional({
        example: "British Columbia",
        description: "User's state/province",
        maxLength: 100,
    })
    @IsOptional()
    @IsString()
    @Length(0, 100)
    state?: string;

    @ApiPropertyOptional({
        example: "V6B 1A1",
        description: "User's postal/zip code",
        maxLength: 20,
    })
    @IsOptional()
    @IsString()
    @Length(0, 20)
    zip_code?: string;

    @ApiPropertyOptional({
        example: "Canada",
        description: "User's country",
        maxLength: 100,
    })
    @IsOptional()
    @IsString()
    @Length(0, 100)
    country?: string;
}

export class UserQueryDto extends BaseQueryDto {
    @ApiPropertyOptional({
        example: "john.doe@example.com",
        description: "Filter by user email",
    })
    @IsOptional()
    @IsString()
    email?: string;

    @ApiPropertyOptional({
        example: "John",
        description: "Filter by first name",
    })
    @IsOptional()
    @IsString()
    first_name?: string;

    @ApiPropertyOptional({
        example: "Doe",
        description: "Filter by last name",
    })
    @IsOptional()
    @IsString()
    last_name?: string;

    @ApiPropertyOptional({
        example: "Toronto",
        description: "Filter by city",
    })
    @IsOptional()
    @IsString()
    city?: string;

    @ApiPropertyOptional({
        example: "Ontario",
        description: "Filter by state/province",
    })
    @IsOptional()
    @IsString()
    state?: string;

    @ApiPropertyOptional({
        example: "Canada",
        description: "Filter by country",
    })
    @IsOptional()
    @IsString()
    country?: string;

    @ApiPropertyOptional({
        example: "2025-01-01",
        description: "Filter users created after this date (ISO 8601 format)",
    })
    @IsOptional()
    @IsString()
    created_after?: string;

    @ApiPropertyOptional({
        example: "2025-12-31",
        description: "Filter users created before this date (ISO 8601 format)",
    })
    @IsOptional()
    @IsString()
    created_before?: string;
}
