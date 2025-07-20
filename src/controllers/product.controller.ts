import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ValidationPipe, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from "@nestjs/swagger";
import { ProductService } from "../services/product.service";
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from "../dto/product.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";

@ApiTags("Products")
@Controller("products")
export class ProductController {
    constructor(private readonly productService: ProductService) {}

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("admin", "moderator")
    @ApiBearerAuth()
    @ApiOperation({
        summary: "Create a new product (Admin/Moderator only)",
        description: "Add a new product to the catalog. Requires admin or moderator role.",
    })
    @ApiBody({ type: CreateProductDto })
    @ApiResponse({ status: 401, description: "Unauthorized - Invalid or missing token" })
    @ApiResponse({ status: 403, description: "Forbidden - Insufficient permissions" })
    @ApiResponse({
        status: 201,
        description: "Product successfully created",
        example: {
            product_id: 1,
            name: "iPhone 15 Pro",
            description: "Latest iPhone with advanced features",
            price: 1299.99,
            category: "Electronics",
            brand: "Apple",
            stock_quantity: 10,
            image_url: "https://example.com/iphone15pro.jpg",
            is_active: true,
            created_at: "2025-07-03T03:14:08.000Z",
            updated_at: "2025-07-03T03:14:08.000Z",
        },
    })
    @ApiResponse({ status: 400, description: "Invalid input data" })
    create(@Body(ValidationPipe) createProductDto: CreateProductDto) {
        return this.productService.create(createProductDto);
    }

    @Get()
    @ApiOperation({
        summary: "Get all products with advanced querying",
        description:
            "Retrieve products with pagination, filtering, sorting, searching, and includes. Supports price ranges, category filtering, brand filtering, stock level filtering, and more.",
    })
    @ApiResponse({
        status: 200,
        description: "Products retrieved successfully",
        example: {
            data: [
                {
                    product_id: 1,
                    name: "iPhone 15 Pro",
                    description: "Latest iPhone with advanced features",
                    price: 1299.99,
                    category: "Electronics",
                    brand: "Apple",
                    stock_quantity: 10,
                    image_url: "https://example.com/iphone15pro.jpg",
                    is_active: true,
                    created_at: "2025-07-03T03:14:08.000Z",
                    updated_at: "2025-07-03T03:14:08.000Z",
                },
            ],
            pagination: {
                page: 1,
                limit: 10,
                total: 1,
                totalPages: 1,
                hasNext: false,
                hasPrev: false,
            },
        },
    })
    findAll(@Query(ValidationPipe) queryDto: ProductQueryDto) {
        return this.productService.findAll(queryDto);
    }

    @Get("category/:category")
    findByCategory(@Param("category") category: string) {
        return this.productService.findByCategory(category);
    }

    @Get(":id")
    findOne(@Param("id") id: string) {
        return this.productService.findOne(+id);
    }

    @Patch(":id")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("admin", "moderator")
    @ApiBearerAuth()
    @ApiOperation({
        summary: "Update product (Admin/Moderator only)",
        description: "Update product information. Requires admin or moderator role.",
    })
    @ApiResponse({ status: 401, description: "Unauthorized - Invalid or missing token" })
    @ApiResponse({ status: 403, description: "Forbidden - Insufficient permissions" })
    update(@Param("id") id: string, @Body(ValidationPipe) updateProductDto: UpdateProductDto) {
        return this.productService.update(+id, updateProductDto);
    }

    @Patch(":id/stock")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("admin", "moderator")
    @ApiBearerAuth()
    @ApiOperation({
        summary: "Update product stock (Admin/Moderator only)",
        description: "Update product stock quantity. Requires admin or moderator role.",
    })
    @ApiResponse({ status: 401, description: "Unauthorized - Invalid or missing token" })
    @ApiResponse({ status: 403, description: "Forbidden - Insufficient permissions" })
    updateStock(@Param("id") id: string, @Body("quantity") quantity: number) {
        return this.productService.updateStock(+id, quantity);
    }

    @Delete(":id")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("admin")
    @ApiBearerAuth()
    @ApiOperation({
        summary: "Delete product (Admin only)",
        description: "Delete a product from the catalog. Only admins can delete products.",
    })
    @ApiResponse({ status: 401, description: "Unauthorized - Invalid or missing token" })
    @ApiResponse({ status: 403, description: "Forbidden - Admin access required" })
    remove(@Param("id") id: string) {
        return this.productService.remove(+id);
    }
}
