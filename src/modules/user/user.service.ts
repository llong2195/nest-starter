import { Repository } from 'typeorm';
import { EntityId } from 'typeorm/repository/EntityId';

import { BaseService } from '@/common/base/base.service';
import { NotFoundError, ValidateError } from '@/common/exceptions/errors';
import { LoggerService } from '@/common/logger/custom.logger';
import { UserEntity } from '@/database/pg/entities/entities';
import { Hash } from '@/utils/hash.helper';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService extends BaseService<
  UserEntity,
  Repository<UserEntity>
> {
  constructor(
    @InjectRepository(UserEntity) repository: Repository<UserEntity>,
    logger: LoggerService,
  ) {
    super(repository, logger);
  }

  findByEmail(email: string): Promise<UserEntity | null> {
    return this.repository.findOne({ where: { email: email } });
  }

  findById(id: EntityId) {
    return this._findById(id);
  }

  async changePassword(
    userId: EntityId,
    changePass: ChangePasswordDto,
  ): Promise<UserEntity> {
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

  async updateProfile(userId: EntityId, updateUserDto: UpdateUserDto) {
    const user = await this._findById(userId);
    if (!user) {
      throw new NotFoundError('USER_NOT_FOUND');
    }
    const updateUser = new UserEntity(updateUserDto);
    return this._update(userId, updateUser);
  }
}
