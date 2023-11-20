import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { BaseResponseDto, CurrentUserDto } from '@base/base.dto';
import { CurrentUser } from '@decorators/current.user.decorator';
import { UserEntity } from '@entities/user.entity';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { LoginRequestDto } from './dto/login-request.dto';
import { RegisterRequestDto } from './dto/register-request.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('v1/auth')
@Controller('v1/auth')
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
    @UseGuards(JwtAuthGuard)
    @Get('/my-profile')
    async myProfile(@CurrentUser() currentUser: CurrentUserDto): Promise<BaseResponseDto<UserEntity>> {
        const user = await this.userService.findById(currentUser.id);
        return new BaseResponseDto<UserEntity>(user);
    }

    @HttpCode(HttpStatus.OK)
    @Post('/register')
    async register(@Body() registerRequestDto: RegisterRequestDto): Promise<BaseResponseDto<UserEntity>> {
        const user = await this.userService._store(registerRequestDto);
        return new BaseResponseDto<UserEntity>(user);
    }
}
