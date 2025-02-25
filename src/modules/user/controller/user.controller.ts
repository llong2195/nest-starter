import { BaseResponseDto, CurrentUserDto } from '@/common/base/base.dto';
import { Authorize, CurrentUser } from '@/common/decorators';
import { UserEntity } from '@/database/pg/entities/entities';
import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { ChangePasswordDto } from '../dto/change-password.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserService } from '../user.service';

@ApiTags('/v1/user')
@ApiBearerAuth()
@Authorize()
@Controller({ version: '1', path: 'user' })
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/my-profile')
  async myProfile(
    @CurrentUser() currentUserDto: CurrentUserDto,
  ): Promise<BaseResponseDto<UserEntity>> {
    const user = await this.userService.findById(currentUserDto.id);
    return new BaseResponseDto<UserEntity>(user);
  }

  @Patch('/update-profile')
  async updateProfile(
    @CurrentUser() currentUserDto: CurrentUserDto,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<BaseResponseDto<UserEntity>> {
    const data = await this.userService.updateProfile(
      currentUserDto.id,
      updateUserDto,
    );
    return new BaseResponseDto<UserEntity>(data);
  }

  @Post('/change-password')
  async changePassword(
    @CurrentUser() currentUserDto: CurrentUserDto,
    @Body() password: ChangePasswordDto,
  ): Promise<BaseResponseDto<UserEntity>> {
    const user = await this.userService.changePassword(
      currentUserDto.id,
      password,
    );
    return new BaseResponseDto<UserEntity>(user);
  }
}
