import { IsNotEmpty, IsString, IsNumber, IsOptional, IsIn, IsArray, ValidateNested, Min } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { BaseQueryDto } from "./query.dto";

export class CreateOrderItemDto {
    @ApiProperty({
        description: "ID of the product being ordered",
        example: 1,
        type: "number",
    })
    @IsNumber()
    @IsNotEmpty()
    product_id: number;

    @ApiProperty({
        description: "Quantity of the product",
        example: 2,
        minimum: 1,
        type: "number",
    })
    @IsNumber()
    @Min(1)
    quantity: number;

    @ApiProperty({
        description: "Unit price of the product (up to 2 decimal places)",
        example: 99.99,
        minimum: 0,
        type: "number",
    })
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    unit_price: number;
}

export class CreateOrderDto {
    @ApiProperty({
        description: "ID of the user placing the order",
        example: 1,
        type: "number",
    })
    @IsNumber()
    @IsNotEmpty()
    user_id: number;

    @ApiProperty({
        description: "Complete shipping address for the order",
        example: "123 Main St, Toronto, ON M1M 1M1, Canada",
        type: "string",
    })
    @IsString()
    @IsNotEmpty()
    shipping_address: string;

    @ApiProperty({
        description: "Payment method used for the order",
        example: "Credit Card",
        enum: ["Credit Card", "Debit Card", "PayPal", "Cash", "Bank Transfer"],
        type: "string",
    })
    @IsString()
    @IsNotEmpty()
    payment_method: string;

    @ApiPropertyOptional({
        description: "Additional notes or instructions for the order",
        example: "Please deliver after 6 PM",
        type: "string",
    })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiProperty({
        description: "Array of items being ordered",
        type: [CreateOrderItemDto],
        example: [
            {
                product_id: 1,
                quantity: 2,
                unit_price: 1299.99,
            },
            {
                product_id: 2,
                quantity: 1,
                unit_price: 999.99,
            },
        ],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateOrderItemDto)
    order_items: CreateOrderItemDto[];
}

export class UpdateOrderDto {
    @IsOptional()
    @IsIn(["pending", "processing", "shipped", "delivered", "cancelled"])
    status?: string;

    @IsOptional()
    @IsString()
    shipping_address?: string;

    @IsOptional()
    @IsString()
    payment_method?: string;

    @IsOptional()
    @IsString()
    tracking_number?: string;

    @IsOptional()
    @IsString()
    notes?: string;
}

export class OrderQueryDto extends BaseQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    user_id?: number;

    @IsOptional()
    @IsIn(["pending", "processing", "shipped", "delivered", "cancelled"])
    status?: string;

    @IsOptional()
    @IsString()
    payment_method?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    min_total?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    max_total?: number;

    @IsOptional()
    @IsString()
    created_after?: string;

    @IsOptional()
    @IsString()
    created_before?: string;

    @IsOptional()
    @IsString()
    tracking_number?: string;
}
