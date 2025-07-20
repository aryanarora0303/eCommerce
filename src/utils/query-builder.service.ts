import { SelectQueryBuilder } from "typeorm";
import { BaseQueryDto, PaginatedResult } from "../dto/query.dto";

export class QueryBuilderService {
    static applyPagination<T>(queryBuilder: SelectQueryBuilder<T>, queryDto: BaseQueryDto): SelectQueryBuilder<T> {
        const page = queryDto.page || 1;
        const limit = queryDto.limit || 10;
        const offset = queryDto.offset !== undefined ? queryDto.offset : (page - 1) * limit;

        return queryBuilder.skip(offset).take(limit);
    }

    static applySorting<T>(
        queryBuilder: SelectQueryBuilder<T>,
        queryDto: BaseQueryDto,
        alias: string,
        defaultSortField: string = "created_at"
    ): SelectQueryBuilder<T> {
        const sortBy = queryDto.sortBy || defaultSortField;
        const sortOrder = queryDto.sortOrder || "ASC";

        // Handle nested sorting (e.g., 'user.first_name')
        if (sortBy.includes(".")) {
            return queryBuilder.orderBy(sortBy, sortOrder);
        } else {
            return queryBuilder.orderBy(`${alias}.${sortBy}`, sortOrder);
        }
    }

    static applySearch<T>(queryBuilder: SelectQueryBuilder<T>, search: string, searchFields: string[], alias: string): SelectQueryBuilder<T> {
        if (!search || !searchFields.length) return queryBuilder;

        const searchConditions = searchFields.map((field) => `${alias}.${field} LIKE :search`).join(" OR ");

        return queryBuilder.andWhere(`(${searchConditions})`, {
            search: `%${search}%`,
        });
    }

    static applyDateFilters<T>(
        queryBuilder: SelectQueryBuilder<T>,
        alias: string,
        createdAfter?: string,
        createdBefore?: string,
        fieldName: string = "created_at"
    ): SelectQueryBuilder<T> {
        if (createdAfter) {
            queryBuilder.andWhere(`${alias}.${fieldName} >= :createdAfter`, {
                createdAfter: new Date(createdAfter),
            });
        }

        if (createdBefore) {
            queryBuilder.andWhere(`${alias}.${fieldName} <= :createdBefore`, {
                createdBefore: new Date(createdBefore),
            });
        }

        return queryBuilder;
    }

    static applyIncludes<T>(queryBuilder: SelectQueryBuilder<T>, includes: string | string[] = [], alias: string): SelectQueryBuilder<T> {
        // If no includes specified, return as-is
        if (!includes || (Array.isArray(includes) && includes.length === 0)) {
            return queryBuilder;
        }

        // Convert string to array if necessary
        const includeArray =
            typeof includes === "string"
                ? includes
                      .split(",")
                      .map((inc) => inc.trim())
                      .filter((inc) => inc.length > 0)
                : includes;

        // Track added joins to avoid duplicates
        const addedJoins = new Set<string>();

        includeArray.forEach((include) => {
            const relation = include.trim();

            try {
                // Handle nested relations (e.g., "order_items.product")
                if (relation.includes(".")) {
                    const parts = relation.split(".");
                    let currentAlias = alias;

                    // Build the join chain step by step
                    for (let i = 0; i < parts.length; i++) {
                        const part = parts[i];
                        const joinKey = `${currentAlias}.${part}`;

                        if (!addedJoins.has(joinKey)) {
                            try {
                                if (i === 0) {
                                    // First level relation from main entity
                                    queryBuilder.leftJoinAndSelect(`${currentAlias}.${part}`, part);
                                    addedJoins.add(joinKey);
                                    currentAlias = part;
                                } else {
                                    // Nested relation
                                    const nestedAlias = `${parts.slice(0, i + 1).join("_")}`;
                                    queryBuilder.leftJoinAndSelect(`${currentAlias}.${part}`, nestedAlias);
                                    addedJoins.add(joinKey);
                                    currentAlias = nestedAlias;
                                }
                            } catch (error) {
                                console.warn(`Skipping invalid nested relation '${joinKey}':`, error.message);
                                break; // Stop processing this nested relation chain
                            }
                        } else {
                            // Update current alias if join already exists
                            if (i === 0) {
                                currentAlias = part;
                            } else {
                                currentAlias = `${parts.slice(0, i + 1).join("_")}`;
                            }
                        }
                    }
                } else {
                    // Simple relation
                    const joinKey = `${alias}.${relation}`;
                    if (!addedJoins.has(joinKey)) {
                        try {
                            queryBuilder.leftJoinAndSelect(`${alias}.${relation}`, relation);
                            addedJoins.add(joinKey);
                        } catch (error) {
                            console.warn(`Skipping invalid relation '${relation}' for entity '${alias}':`, error.message);
                        }
                    }
                }
            } catch (error) {
                // Silently skip if relation doesn't exist - this prevents the error from propagating
                console.warn(`Skipping invalid relation '${relation}' for entity '${alias}':`, error.message);
            }
        });

        return queryBuilder;
    }

    static async paginate<T>(queryBuilder: SelectQueryBuilder<T>, queryDto: BaseQueryDto): Promise<PaginatedResult<T>> {
        const page = queryDto.page || 1;
        const limit = queryDto.limit || 10;

        let totalItems: number;
        let items: T[];

        try {
            // Get total count before applying pagination
            totalItems = await queryBuilder.getCount();

            // Apply pagination and get items
            items = await this.applyPagination(queryBuilder, queryDto).getMany();
        } catch (error) {
            console.warn("Query execution failed, returning empty result:", error.message);

            // Return empty result when query fails
            totalItems = 0;
            items = [];
        }

        const totalPages = Math.ceil(totalItems / limit);

        return {
            data: items,
            pagination: {
                page,
                limit,
                total: totalItems,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
        };
    }

    static applyNumericFilters<T>(
        queryBuilder: SelectQueryBuilder<T>,
        alias: string,
        field: string,
        min?: number,
        max?: number
    ): SelectQueryBuilder<T> {
        if (min !== undefined) {
            queryBuilder.andWhere(`${alias}.${field} >= :${field}_min`, {
                [`${field}_min`]: min,
            });
        }

        if (max !== undefined) {
            queryBuilder.andWhere(`${alias}.${field} <= :${field}_max`, {
                [`${field}_max`]: max,
            });
        }

        return queryBuilder;
    }

    static applyStringFilters<T>(queryBuilder: SelectQueryBuilder<T>, alias: string, filters: Record<string, any>): SelectQueryBuilder<T> {
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                if (typeof value === "string" && key !== "created_after" && key !== "created_before") {
                    // Use LIKE for string fields (partial matching)
                    queryBuilder.andWhere(`${alias}.${key} LIKE :${key}`, {
                        [key]: `%${value}%`,
                    });
                } else if (typeof value === "boolean" || typeof value === "number") {
                    // Exact match for boolean and number fields
                    queryBuilder.andWhere(`${alias}.${key} = :${key}`, {
                        [key]: value,
                    });
                }
            }
        });

        return queryBuilder;
    }
}
