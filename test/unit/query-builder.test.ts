import { QueryBuilderService } from "../../src/utils/query-builder.service";
import { SortOrder } from "../../src/dto/query.dto";

describe("QueryBuilderService", () => {
    let mockQuery: any;

    beforeEach(() => {
        mockQuery = {
            skip: jest.fn().mockReturnThis(),
            take: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            getCount: jest.fn().mockResolvedValue(100),
            getMany: jest.fn().mockResolvedValue([]),
        };
    });

    describe("applyPagination", () => {
        it("should apply default pagination", () => {
            const queryDto = {};
            QueryBuilderService.applyPagination(mockQuery, queryDto);

            expect(mockQuery.skip).toHaveBeenCalledWith(0);
            expect(mockQuery.take).toHaveBeenCalledWith(10);
        });

        it("should apply custom pagination", () => {
            const queryDto = {
                page: 3,
                limit: 20,
            };
            QueryBuilderService.applyPagination(mockQuery, queryDto);

            expect(mockQuery.skip).toHaveBeenCalledWith(40);
            expect(mockQuery.take).toHaveBeenCalledWith(20);
        });
    });

    describe("applySorting", () => {
        it("should apply default sorting", () => {
            const queryDto = {};
            QueryBuilderService.applySorting(mockQuery, queryDto, "entity");

            expect(mockQuery.orderBy).toHaveBeenCalledWith("entity.created_at", "ASC");
        });

        it("should apply custom sorting", () => {
            const queryDto = {
                sortBy: "name",
                sortOrder: SortOrder.DESC,
            };
            QueryBuilderService.applySorting(mockQuery, queryDto, "entity");

            expect(mockQuery.orderBy).toHaveBeenCalledWith("entity.name", SortOrder.DESC);
        });
    });

    describe("applySearch", () => {
        it("should not apply search when search term is empty", () => {
            QueryBuilderService.applySearch(mockQuery, "", ["name", "description"], "entity");

            expect(mockQuery.andWhere).not.toHaveBeenCalled();
        });

        it("should apply search with fields", () => {
            QueryBuilderService.applySearch(mockQuery, "test", ["name", "description"], "entity");

            expect(mockQuery.andWhere).toHaveBeenCalledWith("(entity.name LIKE :search OR entity.description LIKE :search)", { search: "%test%" });
        });
    });

    describe("applyNumericFilters", () => {
        it("should apply min filter", () => {
            QueryBuilderService.applyNumericFilters(mockQuery, "entity", "price", 100);

            expect(mockQuery.andWhere).toHaveBeenCalledWith("entity.price >= :price_min", { price_min: 100 });
        });

        it("should apply max filter", () => {
            QueryBuilderService.applyNumericFilters(mockQuery, "entity", "price", undefined, 500);

            expect(mockQuery.andWhere).toHaveBeenCalledWith("entity.price <= :price_max", { price_max: 500 });
        });
    });

    describe("applyStringFilters", () => {
        it("should apply string filters correctly", () => {
            const filters = {
                category: "Electronics",
                brand: "Apple",
            };

            QueryBuilderService.applyStringFilters(mockQuery, "entity", filters);

            expect(mockQuery.andWhere).toHaveBeenCalledWith("entity.category LIKE :category", { category: "%Electronics%" });
            expect(mockQuery.andWhere).toHaveBeenCalledWith("entity.brand LIKE :brand", { brand: "%Apple%" });
        });
    });
});
