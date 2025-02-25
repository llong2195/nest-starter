import { BaseResponseDto, CurrentUserDto } from '@/common/base/base.dto';
import { Authorize, CurrentUser } from '@/common/decorators';
import { UserEntity } from '@/database/pg/entities/entities';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { LoginRequestDto } from './dto/login-request.dto';
import { RegisterRequestDto } from './dto/register-request.dto';

@ApiTags('v1/auth')
@Controller({ version: '1', path: 'auth' })
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 1000 } })
  @Post('/login')
  async login(@Body() request: LoginRequestDto): Promise<BaseResponseDto<any>> {
    const data = await this.authService.login(request);
    return new BaseResponseDto<any>(data);
  }

  @ApiBearerAuth()
  @Authorize()
  @Get('/my-profile')
  async myProfile(
    @CurrentUser() currentUser: CurrentUserDto,
  ): Promise<BaseResponseDto<UserEntity>> {
    const user = await this.userService.findById(currentUser.id);
    return new BaseResponseDto<UserEntity>(user);
  }

  @HttpCode(HttpStatus.OK)
  @Post('/register')
  async register(
    @Body() registerRequestDto: RegisterRequestDto,
  ): Promise<BaseResponseDto<UserEntity>> {
    const user = await this.userService._store(registerRequestDto);
    return new BaseResponseDto<UserEntity>(user);
  }
}
