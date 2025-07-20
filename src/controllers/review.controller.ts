import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ValidationPipe, UseGuards, ForbiddenException } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery, ApiBearerAuth } from "@nestjs/swagger";
import { ReviewService } from "../services/review.service";
import { CreateReviewDto, UpdateReviewDto, ReviewQueryDto } from "../dto/review.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { GetUser } from "../auth/decorators/get-user.decorator";
import { User } from "../entities/user.entity";

@ApiTags("Reviews")
@Controller("reviews")
export class ReviewController {
    constructor(private readonly reviewService: ReviewService) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: "Create a new review",
        description: "Creates a new product review with rating and optional comment. Users can only create reviews for themselves.",
    })
    @ApiBody({
        type: CreateReviewDto,
        description: "Review data including product_id, rating, and optional title/comment",
    })
    @ApiResponse({ status: 401, description: "Unauthorized - Invalid or missing token" })
    @ApiResponse({
        status: 201,
        description: "Review successfully created",
        example: {
            id: 1,
            user_id: 1,
            product_id: 1,
            rating: 5,
            title: "Great product!",
            comment: "This product exceeded my expectations.",
            is_verified_purchase: true,
            helpful_votes: 0,
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-01T00:00:00Z",
        },
    })
    @ApiResponse({ status: 400, description: "Invalid input data" })
    create(@Body(ValidationPipe) createReviewDto: CreateReviewDto, @GetUser() user: User) {
        // Set the user_id from the authenticated user
        const reviewData = {
            ...createReviewDto,
            user_id: user.user_id,
        };
        return this.reviewService.create(reviewData);
    }

    @Get()
    @ApiOperation({
        summary: "Get all reviews with advanced filtering",
        description: "Retrieve reviews with support for pagination, filtering, sorting, and searching",
    })
    @ApiResponse({
        status: 200,
        description: "Reviews retrieved successfully",
        example: {
            data: [
                {
                    id: 1,
                    user_id: 1,
                    product_id: 1,
                    rating: 5,
                    title: "Great product!",
                    comment: "This product exceeded my expectations.",
                    is_verified_purchase: true,
                    helpful_votes: 5,
                    created_at: "2024-01-01T00:00:00Z",
                    updated_at: "2024-01-01T00:00:00Z",
                    user: { id: 1, first_name: "John", last_name: "Doe" },
                    product: { id: 1, name: "Sample Product", price: 99.99 },
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
    findAll(@Query(ValidationPipe) queryDto: ReviewQueryDto) {
        return this.reviewService.findAll(queryDto);
    }

    @Get(":id")
    @ApiOperation({
        summary: "Get review by ID",
        description: "Retrieve a specific review by its ID",
    })
    @ApiParam({
        name: "id",
        description: "Review ID",
        type: "number",
        example: 1,
    })
    @ApiResponse({
        status: 200,
        description: "Review found",
        example: {
            id: 1,
            user_id: 1,
            product_id: 1,
            rating: 5,
            title: "Great product!",
            comment: "This product exceeded my expectations.",
            is_verified_purchase: true,
            helpful_votes: 5,
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-01T00:00:00Z",
        },
    })
    @ApiResponse({ status: 404, description: "Review not found" })
    findOne(@Param("id") id: string) {
        return this.reviewService.findOne(+id);
    }

    @Get("product/:productId")
    @ApiOperation({
        summary: "Get reviews for a specific product",
        description: "Retrieve all reviews for a given product ID",
    })
    @ApiParam({
        name: "productId",
        description: "Product ID",
        type: "number",
        example: 1,
    })
    @ApiResponse({
        status: 200,
        description: "Product reviews retrieved successfully",
        example: [
            {
                id: 1,
                user_id: 1,
                product_id: 1,
                rating: 5,
                title: "Great product!",
                comment: "This product exceeded my expectations.",
                is_verified_purchase: true,
                helpful_votes: 5,
                created_at: "2024-01-01T00:00:00Z",
                updated_at: "2024-01-01T00:00:00Z",
            },
        ],
    })
    findByProduct(@Param("productId") productId: string) {
        return this.reviewService.findByProduct(+productId);
    }

    @Get("product/:productId/stats")
    @ApiOperation({
        summary: "Get rating statistics for a product",
        description: "Get aggregated rating statistics including average rating, total reviews, and rating distribution",
    })
    @ApiParam({
        name: "productId",
        description: "Product ID",
        type: "number",
        example: 1,
    })
    @ApiResponse({
        status: 200,
        description: "Rating statistics retrieved successfully",
        example: {
            average_rating: 4.5,
            total_reviews: 10,
            rating_distribution: {
                5: 6,
                4: 3,
                3: 1,
                2: 0,
                1: 0,
            },
        },
    })
    getProductRatingStats(@Param("productId") productId: string) {
        return this.reviewService.getProductRatingStats(+productId);
    }

    @Get("user/:userId")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: "Get reviews by a specific user",
        description: "Retrieve all reviews created by a given user ID. Users can only access their own reviews unless they are admin/moderator.",
    })
    @ApiParam({
        name: "userId",
        description: "User ID",
        type: "number",
        example: 1,
    })
    @ApiResponse({ status: 401, description: "Unauthorized - Invalid or missing token" })
    @ApiResponse({ status: 403, description: "Forbidden - Cannot access other user's reviews" })
    @ApiResponse({
        status: 200,
        description: "User reviews retrieved successfully",
        example: [
            {
                id: 1,
                user_id: 1,
                product_id: 1,
                rating: 5,
                title: "Great product!",
                comment: "This product exceeded my expectations.",
                is_verified_purchase: true,
                helpful_votes: 5,
                created_at: "2024-01-01T00:00:00Z",
                updated_at: "2024-01-01T00:00:00Z",
            },
        ],
    })
    findByUser(@Param("userId") userId: string, @GetUser() user: User) {
        const targetUserId = +userId;

        // Users can only access their own reviews unless they are admin/moderator
        if (user.user_id !== targetUserId && !["admin", "moderator"].includes(user.role)) {
            throw new ForbiddenException("You can only access your own reviews");
        }

        return this.reviewService.findByUser(targetUserId);
    }

    @Patch(":id")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: "Update a review",
        description:
            "Update an existing review with new rating, title, or comment. Users can only update their own reviews unless they are admin/moderator.",
    })
    @ApiParam({
        name: "id",
        description: "Review ID",
        type: "number",
        example: 1,
    })
    @ApiBody({
        type: UpdateReviewDto,
        description: "Updated review data",
    })
    @ApiResponse({ status: 401, description: "Unauthorized - Invalid or missing token" })
    @ApiResponse({ status: 403, description: "Forbidden - Cannot update other user's reviews" })
    @ApiResponse({
        status: 200,
        description: "Review updated successfully",
        example: {
            id: 1,
            user_id: 1,
            product_id: 1,
            rating: 4,
            title: "Updated title",
            comment: "Updated comment after longer use.",
            is_verified_purchase: true,
            helpful_votes: 5,
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-02T00:00:00Z",
        },
    })
    @ApiResponse({ status: 404, description: "Review not found" })
    @ApiResponse({ status: 400, description: "Invalid input data" })
    update(@Param("id") id: string, @Body(ValidationPipe) updateReviewDto: UpdateReviewDto, @GetUser() user: User) {
        return this.checkReviewAccessAndUpdate(+id, user, updateReviewDto);
    }

    @Patch(":id/helpful")
    @ApiOperation({
        summary: "Mark review as helpful",
        description: "Increment the helpful votes count for a review",
    })
    @ApiParam({
        name: "id",
        description: "Review ID",
        type: "number",
        example: 1,
    })
    @ApiResponse({
        status: 200,
        description: "Helpful vote added successfully",
        example: {
            id: 1,
            helpful_votes: 6,
            message: "Helpful vote added successfully",
        },
    })
    @ApiResponse({ status: 404, description: "Review not found" })
    incrementHelpfulVotes(@Param("id") id: string) {
        return this.reviewService.incrementHelpfulVotes(+id);
    }

    @Delete(":id")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: "Delete a review",
        description: "Delete an existing review by ID. Users can only delete their own reviews unless they are admin/moderator.",
    })
    @ApiParam({
        name: "id",
        description: "Review ID",
        type: "number",
        example: 1,
    })
    @ApiResponse({ status: 401, description: "Unauthorized - Invalid or missing token" })
    @ApiResponse({ status: 403, description: "Forbidden - Cannot delete other user's reviews" })
    @ApiResponse({
        status: 200,
        description: "Review deleted successfully",
        example: { message: "Review deleted successfully" },
    })
    @ApiResponse({ status: 404, description: "Review not found" })
    remove(@Param("id") id: string, @GetUser() user: User) {
        return this.checkReviewAccessAndDelete(+id, user);
    }

    // Helper methods for access control
    private async checkReviewAccessAndUpdate(reviewId: number, user: User, updateData: UpdateReviewDto) {
        const review = await this.reviewService.findOne(reviewId);

        // Users can only update their own reviews unless they are admin/moderator
        if (review.user_id !== user.user_id && !["admin", "moderator"].includes(user.role)) {
            throw new ForbiddenException("You can only update your own reviews");
        }

        return this.reviewService.update(reviewId, updateData);
    }

    private async checkReviewAccessAndDelete(reviewId: number, user: User) {
        const review = await this.reviewService.findOne(reviewId);

        // Users can only delete their own reviews unless they are admin/moderator
        if (review.user_id !== user.user_id && !["admin", "moderator"].includes(user.role)) {
            throw new ForbiddenException("You can only delete your own reviews");
        }

        return this.reviewService.remove(reviewId);
    }
}
