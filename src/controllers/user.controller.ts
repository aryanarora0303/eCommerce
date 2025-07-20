import { Controller, Get, Body, Patch, Param, Delete, ValidationPipe, Query, UseGuards, ForbiddenException } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from "@nestjs/swagger";
import { UserService } from "../services/user.service";
import { UpdateUserDto, UserQueryDto } from "../dto/user.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { GetUser } from "../auth/decorators/get-user.decorator";
import { User } from "../entities/user.entity";

@ApiTags("Users")
@Controller("users")
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("admin", "moderator")
    @ApiBearerAuth()
    @ApiOperation({
        summary: "Get all users with advanced querying (Admin/Moderator only)",
        description: "Retrieve users with pagination, filtering, sorting, searching, and includes. Requires admin or moderator role.",
    })
    @ApiResponse({ status: 401, description: "Unauthorized - Invalid or missing token" })
    @ApiResponse({ status: 403, description: "Forbidden - Insufficient permissions" })
    @ApiResponse({
        status: 200,
        description: "Users retrieved successfully",
        example: {
            data: [
                {
                    user_id: 1,
                    email: "john.doe@example.com",
                    first_name: "John",
                    last_name: "Doe",
                    phone: "+1234567890",
                    address: "123 Main St",
                    city: "Toronto",
                    state: "Ontario",
                    zip_code: "M1M 1M1",
                    country: "Canada",
                    created_at: "2025-07-03T03:14:01.000Z",
                    updated_at: "2025-07-03T03:14:01.000Z",
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
    findAll(@Query(ValidationPipe) queryDto: UserQueryDto) {
        return this.userService.findAll(queryDto);
    }

    @Get(":id")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: "Get user by ID",
        description: "Retrieve a specific user by their ID. Users can only access their own profile unless they are admin/moderator.",
    })
    @ApiParam({ name: "id", description: "User ID", example: 1 })
    @ApiResponse({ status: 401, description: "Unauthorized - Invalid or missing token" })
    @ApiResponse({ status: 403, description: "Forbidden - Cannot access other user's profile" })
    @ApiResponse({
        status: 200,
        description: "User found",
        example: {
            user_id: 1,
            email: "john.doe@example.com",
            first_name: "John",
            last_name: "Doe",
            phone: "+1234567890",
            address: "123 Main St",
            city: "Toronto",
            state: "Ontario",
            zip_code: "M1M 1M1",
            country: "Canada",
            created_at: "2025-07-03T03:14:01.000Z",
            updated_at: "2025-07-03T03:14:01.000Z",
        },
    })
    @ApiResponse({ status: 404, description: "User not found" })
    findOne(@Param("id") id: string, @GetUser() currentUser: User) {
        const userId = +id;

        // Users can only access their own profile unless they are admin/moderator
        if (currentUser.user_id !== userId && !["admin", "moderator"].includes(currentUser.role)) {
            throw new ForbiddenException("You can only access your own profile");
        }

        return this.userService.findOne(userId);
    }

    @Patch(":id")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: "Update user",
        description: "Update user information. Users can only update their own profile unless they are admin.",
    })
    @ApiResponse({ status: 401, description: "Unauthorized - Invalid or missing token" })
    @ApiResponse({ status: 403, description: "Forbidden - Cannot update other user's profile" })
    update(@Param("id") id: string, @Body(ValidationPipe) updateUserDto: UpdateUserDto, @GetUser() currentUser: User) {
        const userId = +id;

        // Users can only update their own profile unless they are admin
        if (currentUser.user_id !== userId && currentUser.role !== "admin") {
            throw new ForbiddenException("You can only update your own profile");
        }

        return this.userService.update(userId, updateUserDto);
    }

    @Delete(":id")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("admin")
    @ApiBearerAuth()
    @ApiOperation({
        summary: "Delete user (Admin only)",
        description: "Delete a user account. Only admins can delete users.",
    })
    @ApiResponse({ status: 401, description: "Unauthorized - Invalid or missing token" })
    @ApiResponse({ status: 403, description: "Forbidden - Admin access required" })
    remove(@Param("id") id: string) {
        return this.userService.remove(+id);
    }
}
