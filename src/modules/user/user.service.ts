import { Injectable } from '@nestjs/common';
import { EntityId } from 'typeorm/repository/EntityId';

import { BaseService } from '@base/base.service';
import { UserEntity } from '@entities/user.entity';
import { NotFoundError, ValidateError } from '@exceptions/errors';
import { LoggerService } from '@logger/custom.logger';
import { Hash } from '@utils/hash.util';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService extends BaseService<UserEntity, UserRepository> {
    constructor(repository: UserRepository, logger: LoggerService) {
        super(repository, logger);
    }

    findByEmail(email: string): Promise<UserEntity | null> {
        return this.repository.findOne({ where: { email: email } });
    }

    findById(id: EntityId): Promise<UserEntity> {
        return this._findById(id);
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
        user.password = changePass.newPassword;
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
