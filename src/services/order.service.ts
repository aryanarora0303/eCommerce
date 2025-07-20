import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Order } from "../entities/order.entity";
import { OrderItem } from "../entities/order-item.entity";
import { CreateOrderDto, UpdateOrderDto, OrderQueryDto } from "../dto/order.dto";
import { ProductService } from "./product.service";
import { QueryBuilderService } from "../utils/query-builder.service";
import { PaginatedResult } from "../dto/query.dto";

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(Order)
        private orderRepository: Repository<Order>,
        @InjectRepository(OrderItem)
        private orderItemRepository: Repository<OrderItem>,
        private productService: ProductService
    ) {}

    async create(createOrderDto: CreateOrderDto): Promise<Order> {
        // Calculate total amount and validate products
        let totalAmount = 0;
        const orderItems = [];

        for (const item of createOrderDto.order_items) {
            let product;
            try {
                product = await this.productService.findOne(item.product_id);
            } catch (error) {
                if (error instanceof NotFoundException) {
                    throw new BadRequestException(`Product with ID ${item.product_id} does not exist`);
                }
                throw error;
            }

            // Check if enough stock is available
            if (product.stock_quantity < item.quantity) {
                throw new BadRequestException(
                    `Not enough stock for product ${product.name}. Available: ${product.stock_quantity}, Requested: ${item.quantity}`
                );
            }

            const totalPrice = item.quantity * item.unit_price;
            totalAmount += totalPrice;

            orderItems.push({
                ...item,
                total_price: totalPrice,
            });
        }

        // Create the order
        const order = this.orderRepository.create({
            user_id: createOrderDto.user_id,
            shipping_address: createOrderDto.shipping_address,
            payment_method: createOrderDto.payment_method,
            notes: createOrderDto.notes,
            total_amount: totalAmount,
        });

        const savedOrder = await this.orderRepository.save(order);

        // Create order items
        for (const item of orderItems) {
            const orderItem = this.orderItemRepository.create({
                order_id: savedOrder.order_id,
                ...item,
            });
            await this.orderItemRepository.save(orderItem);

            // Update product stock
            await this.productService.updateStock(item.product_id, -item.quantity);
        }

        return this.findOne(savedOrder.order_id);
    }

    async findAll(queryDto: OrderQueryDto = {}): Promise<PaginatedResult<Order>> {
        const queryBuilder = this.orderRepository.createQueryBuilder("order");

        // Apply search
        if (queryDto.search) {
            QueryBuilderService.applySearch(queryBuilder, queryDto.search, ["status", "shipping_address", "payment_method", "notes"], "order");
        }

        // Apply filters
        const filters = {
            user_id: queryDto.user_id,
            status: queryDto.status,
            payment_method: queryDto.payment_method,
        };
        QueryBuilderService.applyStringFilters(queryBuilder, "order", filters);

        // Apply numeric filters
        QueryBuilderService.applyNumericFilters(queryBuilder, "order", "total_amount", queryDto.min_total, queryDto.max_total);

        // Apply date filters
        QueryBuilderService.applyDateFilters(queryBuilder, "order", queryDto.created_after, queryDto.created_before);

        // Apply includes
        QueryBuilderService.applyIncludes(queryBuilder, queryDto.include, "order");

        // Apply sorting
        QueryBuilderService.applySorting(queryBuilder, queryDto, "order");

        // Apply pagination and return
        return QueryBuilderService.paginate(queryBuilder, queryDto);
    }

    async findOne(id: number): Promise<Order> {
        const order = await this.orderRepository.findOne({
            where: { order_id: id },
            relations: ["user", "order_items", "order_items.product"],
        });

        if (!order) {
            throw new NotFoundException(`Order with ID ${id} not found`);
        }

        return order;
    }

    async findByUser(userId: number): Promise<Order[]> {
        return this.orderRepository.find({
            where: { user_id: userId },
            relations: ["order_items", "order_items.product"],
            order: { created_at: "DESC" },
        });
    }

    async update(id: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
        const order = await this.findOne(id);
        await this.orderRepository.update(id, updateOrderDto);
        return this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        const order = await this.findOne(id);

        // Restore product stock before deleting
        for (const item of order.order_items) {
            await this.productService.updateStock(item.product_id, item.quantity);
        }

        await this.orderRepository.remove(order);
    }

    async updateStatus(id: number, status: string): Promise<Order> {
        return this.update(id, { status });
    }
}
