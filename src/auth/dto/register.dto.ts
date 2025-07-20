import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsIn } from "class-validator";

export class RegisterDto {
    @IsEmail({}, { message: "Please provide a valid email address" })
    @IsNotEmpty({ message: "Email is required" })
    email: string;

    @IsString({ message: "Password must be a string" })
    @IsNotEmpty({ message: "Password is required" })
    @MinLength(6, { message: "Password must be at least 6 characters long" })
    password: string;

    @IsString({ message: "First name must be a string" })
    @IsNotEmpty({ message: "First name is required" })
    first_name: string;

    @IsString({ message: "Last name must be a string" })
    @IsNotEmpty({ message: "Last name is required" })
    last_name: string;

    @IsOptional()
    @IsString({ message: "Phone must be a string" })
    phone?: string;

    @IsOptional()
    @IsString({ message: "Address must be a string" })
    address?: string;

    @IsOptional()
    @IsString({ message: "City must be a string" })
    city?: string;

    @IsOptional()
    @IsString({ message: "State must be a string" })
    state?: string;

    @IsOptional()
    @IsString({ message: "Zip code must be a string" })
    zip_code?: string;

    @IsOptional()
    @IsString({ message: "Country must be a string" })
    country?: string;

    @IsOptional()
    @IsIn(["admin", "customer", "moderator"], {
        message: "Role must be one of: admin, customer, moderator",
    })
    role?: string;
}
