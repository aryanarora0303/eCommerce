import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../entities/user.entity";
import { CreateUserDto, UpdateUserDto, UserQueryDto } from "../dto/user.dto";
import { PaginatedResult } from "../dto/query.dto";
import { QueryBuilderService } from "../utils/query-builder.service";
import * as bcrypt from "bcrypt";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>
    ) {}

    async create(createUserDto: CreateUserDto | any): Promise<User> {
        // Check if user already exists
        const existingUser = await this.userRepository.findOne({
            where: { email: createUserDto.email },
        });

        if (existingUser) {
            throw new ConflictException("User with this email already exists");
        }

        // Hash password - support both 'password' and 'password_hash' fields
        const saltRounds = 10;
        let hashedPassword: string;

        if (createUserDto.password_hash) {
            // If password_hash is already provided (from auth service), use it
            hashedPassword = createUserDto.password_hash;
        } else {
            // If password field is provided, hash it
            hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);
        }

        // Create user data, excluding password and adding password_hash
        const { password, password_hash, ...userData } = createUserDto;

        const userToSave = {
            ...userData,
            password_hash: hashedPassword,
        };

        const savedUser = await this.userRepository.save(userToSave);
        return savedUser as User;
    }

    async findAll(queryDto: UserQueryDto = {}): Promise<PaginatedResult<User>> {
        const queryBuilder = this.userRepository
            .createQueryBuilder("user")
            .select([
                "user.user_id",
                "user.email",
                "user.first_name",
                "user.last_name",
                "user.phone",
                "user.address",
                "user.city",
                "user.state",
                "user.zip_code",
                "user.country",
                "user.role",
                "user.created_at",
                "user.updated_at",
            ]);

        // Apply search
        if (queryDto.search) {
            QueryBuilderService.applySearch(queryBuilder, queryDto.search, ["first_name", "last_name", "email", "city", "state"], "user");
        }

        // Apply filters
        const filters = {
            email: queryDto.email,
            first_name: queryDto.first_name,
            last_name: queryDto.last_name,
            city: queryDto.city,
            state: queryDto.state,
            country: queryDto.country,
        };
        QueryBuilderService.applyStringFilters(queryBuilder, "user", filters);

        // Apply date filters
        QueryBuilderService.applyDateFilters(queryBuilder, "user", queryDto.created_after, queryDto.created_before);

        // Apply includes
        QueryBuilderService.applyIncludes(queryBuilder, queryDto.include, "user");

        // Apply sorting
        QueryBuilderService.applySorting(queryBuilder, queryDto, "user");

        // Apply pagination and return
        return QueryBuilderService.paginate(queryBuilder, queryDto);
    }

    async findOne(id: number): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { user_id: id },
            select: [
                "user_id",
                "email",
                "first_name",
                "last_name",
                "phone",
                "address",
                "city",
                "state",
                "zip_code",
                "country",
                "role",
                "is_active",
                "refresh_token",
                "created_at",
                "updated_at",
            ],
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return user;
    }

    async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.findOne(id);

        // If password is being updated, hash it
        if (updateUserDto.password) {
            const saltRounds = 10;
            updateUserDto.password = await bcrypt.hash(updateUserDto.password, saltRounds);
        }

        // Check for email uniqueness if email is being updated
        if (updateUserDto.email && updateUserDto.email !== user.email) {
            const existingUser = await this.userRepository.findOne({
                where: { email: updateUserDto.email },
            });

            if (existingUser) {
                throw new ConflictException("User with this email already exists");
            }
        }

        await this.userRepository.update(id, updateUserDto);
        return this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        const user = await this.findOne(id);
        await this.userRepository.remove(user);
    }

    // Authentication methods
    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({
            where: { email },
            select: ["user_id", "email", "password_hash", "first_name", "last_name", "role", "is_active", "refresh_token"],
        });
    }

    async findOneWithPassword(id: number): Promise<User | null> {
        return this.userRepository.findOne({
            where: { user_id: id },
            select: [
                "user_id",
                "email",
                "password_hash",
                "first_name",
                "last_name",
                "phone",
                "address",
                "city",
                "state",
                "zip_code",
                "country",
                "role",
                "is_active",
                "refresh_token",
                "created_at",
                "updated_at",
            ],
        });
    }

    async updateRefreshToken(userId: number, refreshToken: string | null): Promise<void> {
        await this.userRepository.update(userId, { refresh_token: refreshToken });
    }

    async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(plainPassword, hashedPassword);
    }
}
