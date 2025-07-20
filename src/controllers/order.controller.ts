import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ValidationPipe, UseGuards, ForbiddenException } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from "@nestjs/swagger";
import { OrderService } from "../services/order.service";
import { CreateOrderDto, UpdateOrderDto, OrderQueryDto } from "../dto/order.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { GetUser } from "../auth/decorators/get-user.decorator";
import { User } from "../entities/user.entity";

@ApiTags("Orders")
@Controller("orders")
export class OrderController {
    constructor(private readonly orderService: OrderService) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: "Create a new order",
        description:
            "Create a new order with order items. Stock quantities will be automatically updated. Authenticated users can only create orders for themselves.",
    })
    @ApiBody({ type: CreateOrderDto })
    @ApiResponse({ status: 401, description: "Unauthorized - Invalid or missing token" })
    @ApiResponse({
        status: 201,
        description: "Order successfully created",
        example: {
            order_id: 1,
            user_id: 1,
            order_date: "2025-07-03T03:14:15.000Z",
            status: "pending",
            total_amount: 2599.98,
            shipping_address: "123 Main St, Toronto, ON M1M 1M1",
            payment_method: "Credit Card",
            tracking_number: null,
            notes: "Please deliver after 6 PM",
            created_at: "2025-07-03T03:14:15.000Z",
            updated_at: "2025-07-03T03:14:15.000Z",
            user: {
                user_id: 1,
                email: "john.doe@example.com",
                first_name: "John",
                last_name: "Doe",
            },
            order_items: [
                {
                    order_item_id: 1,
                    product_id: 1,
                    quantity: 2,
                    unit_price: 1299.99,
                    total_price: 2599.98,
                    product: {
                        product_id: 1,
                        name: "iPhone 15 Pro",
                        price: 1299.99,
                    },
                },
            ],
        },
    })
    @ApiResponse({ status: 400, description: "Invalid input data or insufficient stock" })
    create(@Body(ValidationPipe) createOrderDto: CreateOrderDto, @GetUser() user: User) {
        // Set the user_id from the authenticated user
        const orderData = {
            ...createOrderDto,
            user_id: user.user_id,
        };
        return this.orderService.create(orderData);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: "Get orders with advanced querying",
        description:
            "Retrieve orders with pagination, filtering, sorting, searching, and includes. Users see only their own orders unless they are admin/moderator.",
    })
    @ApiResponse({ status: 401, description: "Unauthorized - Invalid or missing token" })
    @ApiResponse({
        status: 200,
        description: "Orders retrieved successfully",
        example: {
            data: [
                {
                    order_id: 1,
                    user_id: 1,
                    order_date: "2025-07-03T03:14:15.000Z",
                    status: "pending",
                    total_amount: 2599.98,
                    shipping_address: "123 Main St, Toronto, ON M1M 1M1",
                    payment_method: "Credit Card",
                    tracking_number: null,
                    notes: "Please deliver after 6 PM",
                    created_at: "2025-07-03T03:14:15.000Z",
                    updated_at: "2025-07-03T03:14:15.000Z",
                    user: {
                        user_id: 1,
                        email: "john.doe@example.com",
                        first_name: "John",
                        last_name: "Doe",
                    },
                    order_items: [
                        {
                            order_item_id: 1,
                            product_id: 1,
                            quantity: 2,
                            unit_price: 1299.99,
                            total_price: 2599.98,
                            product: {
                                product_id: 1,
                                name: "iPhone 15 Pro",
                                price: 1299.99,
                                category: "Electronics",
                                brand: "Apple",
                            },
                        },
                    ],
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
    findAll(@Query(ValidationPipe) queryDto: OrderQueryDto, @GetUser() user: User) {
        // If user is not admin/moderator, filter to show only their orders
        if (!["admin", "moderator"].includes(user.role)) {
            queryDto.user_id = user.user_id;
        }
        return this.orderService.findAll(queryDto);
    }

    @Get(":id")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: "Get order by ID",
        description: "Retrieve a specific order. Users can only access their own orders unless they are admin/moderator.",
    })
    @ApiResponse({ status: 401, description: "Unauthorized - Invalid or missing token" })
    @ApiResponse({ status: 403, description: "Forbidden - Cannot access other user's orders" })
    findOne(@Param("id") id: string, @GetUser() user: User) {
        return this.checkOrderAccess(+id, user);
    }

    @Get("user/:userId")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: "Get orders by user",
        description: "Retrieve orders for a specific user. Users can only access their own orders unless they are admin/moderator.",
    })
    @ApiResponse({ status: 401, description: "Unauthorized - Invalid or missing token" })
    @ApiResponse({ status: 403, description: "Forbidden - Cannot access other user's orders" })
    findByUser(@Param("userId") userId: string, @GetUser() user: User) {
        const targetUserId = +userId;

        // Users can only access their own orders unless they are admin/moderator
        if (user.user_id !== targetUserId && !["admin", "moderator"].includes(user.role)) {
            throw new ForbiddenException("You can only access your own orders");
        }

        return this.orderService.findByUser(targetUserId);
    }

    @Patch(":id")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: "Update order",
        description: "Update order information. Users can only update their own orders unless they are admin/moderator.",
    })
    @ApiResponse({ status: 401, description: "Unauthorized - Invalid or missing token" })
    @ApiResponse({ status: 403, description: "Forbidden - Cannot update other user's orders" })
    update(@Param("id") id: string, @Body(ValidationPipe) updateOrderDto: UpdateOrderDto, @GetUser() user: User) {
        return this.checkOrderAccessAndUpdate(+id, user, updateOrderDto);
    }

    @Patch(":id/status")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("admin", "moderator")
    @ApiBearerAuth()
    @ApiOperation({
        summary: "Update order status (Admin/Moderator only)",
        description: "Update order status. Only admin or moderator can change order status.",
    })
    @ApiResponse({ status: 401, description: "Unauthorized - Invalid or missing token" })
    @ApiResponse({ status: 403, description: "Forbidden - Insufficient permissions" })
    updateStatus(@Param("id") id: string, @Body("status") status: string) {
        return this.orderService.updateStatus(+id, status);
    }

    @Delete(":id")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("admin")
    @ApiBearerAuth()
    @ApiOperation({
        summary: "Delete order (Admin only)",
        description: "Delete an order. Only admins can delete orders.",
    })
    @ApiResponse({ status: 401, description: "Unauthorized - Invalid or missing token" })
    @ApiResponse({ status: 403, description: "Forbidden - Admin access required" })
    remove(@Param("id") id: string) {
        return this.orderService.remove(+id);
    }

    // Helper methods for access control
    private async checkOrderAccess(orderId: number, user: User) {
        const order = await this.orderService.findOne(orderId);

        // Users can only access their own orders unless they are admin/moderator
        if (order.user_id !== user.user_id && !["admin", "moderator"].includes(user.role)) {
            throw new ForbiddenException("You can only access your own orders");
        }

        return order;
    }

    private async checkOrderAccessAndUpdate(orderId: number, user: User, updateData: UpdateOrderDto) {
        const order = await this.orderService.findOne(orderId);

        // Users can only update their own orders unless they are admin/moderator
        if (order.user_id !== user.user_id && !["admin", "moderator"].includes(user.role)) {
            throw new ForbiddenException("You can only update your own orders");
        }

        return this.orderService.update(orderId, updateData);
    }
}
