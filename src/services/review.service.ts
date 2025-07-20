import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Review } from "../entities/review.entity";
import { CreateReviewDto, UpdateReviewDto, ReviewQueryDto } from "../dto/review.dto";
import { QueryBuilderService } from "../utils/query-builder.service";
import { PaginatedResult } from "../dto/query.dto";

@Injectable()
export class ReviewService {
    constructor(
        @InjectRepository(Review)
        private reviewRepository: Repository<Review>
    ) {}

    async create(createReviewDto: CreateReviewDto): Promise<Review> {
        const review = this.reviewRepository.create(createReviewDto);
        return this.reviewRepository.save(review);
    }

    async findAll(queryDto: ReviewQueryDto = {}): Promise<PaginatedResult<Review>> {
        const queryBuilder = this.reviewRepository.createQueryBuilder("review");

        // Apply search
        if (queryDto.search) {
            QueryBuilderService.applySearch(queryBuilder, queryDto.search, ["comment"], "review");
        }

        // Apply filters
        const filters = {
            user_id: queryDto.user_id,
            product_id: queryDto.product_id,
            rating: queryDto.rating,
        };
        QueryBuilderService.applyStringFilters(queryBuilder, "review", filters);

        // Apply numeric filters for rating
        QueryBuilderService.applyNumericFilters(queryBuilder, "review", "rating", queryDto.min_rating, queryDto.max_rating);

        // Apply date filters
        QueryBuilderService.applyDateFilters(queryBuilder, "review", queryDto.created_after, queryDto.created_before);

        // Apply includes
        QueryBuilderService.applyIncludes(queryBuilder, queryDto.include, "review");

        // Apply sorting
        QueryBuilderService.applySorting(queryBuilder, queryDto, "review");

        // Apply pagination and return
        return QueryBuilderService.paginate(queryBuilder, queryDto);
    }

    async findOne(id: number): Promise<Review> {
        const review = await this.reviewRepository.findOne({
            where: { review_id: id },
            relations: ["user", "product"],
        });

        if (!review) {
            throw new NotFoundException(`Review with ID ${id} not found`);
        }

        return review;
    }

    async findByProduct(productId: number): Promise<Review[]> {
        return this.reviewRepository.find({
            where: { product_id: productId },
            relations: ["user"],
            order: { created_at: "DESC" },
        });
    }

    async findByUser(userId: number): Promise<Review[]> {
        return this.reviewRepository.find({
            where: { user_id: userId },
            relations: ["product"],
            order: { created_at: "DESC" },
        });
    }

    async update(id: number, updateReviewDto: UpdateReviewDto): Promise<Review> {
        const review = await this.findOne(id);
        await this.reviewRepository.update(id, updateReviewDto);
        return this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        const review = await this.findOne(id);
        await this.reviewRepository.remove(review);
    }

    async getProductRatingStats(productId: number): Promise<any> {
        const reviews = await this.findByProduct(productId);

        if (reviews.length === 0) {
            return {
                average_rating: 0,
                total_reviews: 0,
                rating_distribution: {
                    1: 0,
                    2: 0,
                    3: 0,
                    4: 0,
                    5: 0,
                },
            };
        }

        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / reviews.length;

        const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviews.forEach((review) => {
            ratingDistribution[review.rating]++;
        });

        return {
            average_rating: Math.round(averageRating * 10) / 10,
            total_reviews: reviews.length,
            rating_distribution: ratingDistribution,
        };
    }

    async incrementHelpfulVotes(id: number): Promise<Review> {
        const review = await this.findOne(id);
        review.helpful_votes++;
        return this.reviewRepository.save(review);
    }
}
