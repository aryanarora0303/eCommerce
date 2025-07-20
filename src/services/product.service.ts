import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Product } from "../entities/product.entity";
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from "../dto/product.dto";
import { PaginatedResult } from "../dto/query.dto";
import { QueryBuilderService } from "../utils/query-builder.service";

@Injectable()
export class ProductService {
    constructor(
        @InjectRepository(Product)
        private productRepository: Repository<Product>
    ) {}

    async create(createProductDto: CreateProductDto): Promise<Product> {
        const product = this.productRepository.create(createProductDto);
        return this.productRepository.save(product);
    }

    async findAll(queryDto: ProductQueryDto = {}): Promise<PaginatedResult<Product>> {
        const queryBuilder = this.productRepository.createQueryBuilder("product");

        // Apply search
        if (queryDto.search) {
            QueryBuilderService.applySearch(queryBuilder, queryDto.search, ["name", "description", "category", "brand"], "product");
        }

        // Apply filters
        const filters = {
            name: queryDto.name,
            category: queryDto.category,
            brand: queryDto.brand,
            is_active: queryDto.is_active,
        };
        QueryBuilderService.applyStringFilters(queryBuilder, "product", filters);

        // Apply numeric filters
        QueryBuilderService.applyNumericFilters(queryBuilder, "product", "price", queryDto.min_price, queryDto.max_price);

        if (queryDto.min_stock !== undefined) {
            queryBuilder.andWhere("product.stock_quantity >= :min_stock", {
                min_stock: queryDto.min_stock,
            });
        }

        // Apply date filters
        QueryBuilderService.applyDateFilters(queryBuilder, "product", queryDto.created_after, queryDto.created_before);

        // Apply includes
        QueryBuilderService.applyIncludes(queryBuilder, queryDto.include, "product");

        // Apply sorting
        QueryBuilderService.applySorting(queryBuilder, queryDto, "product");

        // Apply pagination and return
        return QueryBuilderService.paginate(queryBuilder, queryDto);
    }

    async findOne(id: number): Promise<Product> {
        const product = await this.productRepository.findOne({
            where: { product_id: id },
        });

        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        return product;
    }

    async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
        const product = await this.findOne(id);
        await this.productRepository.update(id, updateProductDto);
        return this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        const product = await this.findOne(id);
        await this.productRepository.remove(product);
    }

    async findByCategory(category: string): Promise<Product[]> {
        return this.productRepository.find({
            where: { category, is_active: true },
        });
    }

    async updateStock(id: number, quantity: number): Promise<Product> {
        const product = await this.findOne(id);
        product.stock_quantity += quantity;
        return this.productRepository.save(product);
    }
}
