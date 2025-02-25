import { DeleteResult } from 'typeorm';

import { BaseResponseDto } from '@/common/base/base.dto';
import {
  PaginationOption,
  PaginationResponse,
} from '@/common/base/pagination.dto';
import { UserEntity } from '@/database/pg/entities/entities';
import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserService } from '../user.service';

@ApiTags('/v1/admin/user')
@ApiBearerAuth()
@Controller({ version: '1', path: 'admin/user' })
export class AdminUserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async index(
    @Query() filter: PaginationOption,
  ): Promise<PaginationResponse<UserEntity>> {
    const data = await this.userService._paginate(filter.page, filter.limit, {
      deleted: filter.deleted,
    });
    return new PaginationResponse<UserEntity>(data.body, data.meta);
  }

  @Get('/:id')
  async show(@Param('id') id: number): Promise<BaseResponseDto<UserEntity>> {
    const user = await this.userService.findById(id);
    if (!user) {
      throw new NotFoundException();
    }
    return new BaseResponseDto<UserEntity>(user);
  }

  @Post()
  async create(
    @Body() userData: CreateUserDto,
  ): Promise<BaseResponseDto<UserEntity>> {
    const createdUser = await this.userService._store(userData);
    return new BaseResponseDto<UserEntity>(createdUser);
  }

  @Patch('/:id')
  async update(
    @Param('id') id: number,
    @Body() userData: UpdateUserDto,
  ): Promise<BaseResponseDto<UserEntity>> {
    const updateUser = await this.userService._update(id, userData);
    return new BaseResponseDto<UserEntity>(updateUser);
  }

  @Delete('/:id')
  async destroy(
    @Param('id') id: number,
  ): Promise<BaseResponseDto<DeleteResult>> {
    await this.userService._softDelete(id);
    return new BaseResponseDto<DeleteResult>(null);
  }

  @Post('/:id/restore')
  async restore(@Param('id') id: number): Promise<BaseResponseDto<UserEntity>> {
    const user = await this.userService._restore(id);
    return new BaseResponseDto<UserEntity>(user);
  }
}
