import { DataSource } from 'typeorm';
import { EntityId } from 'typeorm/repository/EntityId';

import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { BaseService } from '@base/base.service';
import { PaginationOption, PaginationResponse } from '@base/pagination.dto';
import { UserEntity } from '@entities/user.entity';
import { NotFoundError, ValidateError } from '@exceptions/errors';
import { LoggerService } from '@src/logger/custom.logger';
import { Hash } from '@utils/hash.util';

import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService extends BaseService<UserEntity, UserRepository> {
    constructor(
        @InjectDataSource() private readonly dataSource: DataSource,
        repository: UserRepository,
        logger: LoggerService,
    ) {
        super(repository, logger);
    }

    findByEmail(email: string): Promise<UserEntity | null> {
        return this.repository.findOne({ where: { email: email } });
    }

    findById(id: EntityId): Promise<UserEntity> {
        return this._findById(id);
    }

    async getInactiveUsers(filter: PaginationOption): Promise<PaginationResponse<UserEntity>> {
        const { page, limit, deleted } = filter;
        const result = await this.repository.getInactiveUsers(deleted, page, limit);
        const total = await this.repository.countInactiveUsers(deleted);
        return this.pagination<UserEntity>(result, total, page, limit);
    }

    async changePassword(userId: EntityId, changePass: ChangePasswordDto): Promise<UserEntity> {
        const user = await this._findById(userId);
        if (!user) {
            throw new NotFoundError('NOT_FOUND');
        }
        const compareResult = Hash.compare(changePass.password, user.password);
        if (!compareResult) {
            throw new ValidateError('PASSWORD_INCORRECT');
        }
        user.password = changePass.new_password;
        await user.save();
        return user;
    }

    async updateProfile(userId: EntityId, updateUserDto: UpdateUserDto): Promise<UserEntity> {
        const user = await this._findById(userId);
        if (!user) {
            throw new NotFoundError('USER_NOT_FOUND');
        }
        const updateUser = new UserEntity(updateUserDto);
        return this._update(userId, updateUser);
    }
}
