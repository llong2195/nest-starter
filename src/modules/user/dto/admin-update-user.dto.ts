import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, Length, Validate } from 'class-validator';

import { RoleEnum } from '@enums/role.enum';
import { PasswordConfirmValidator } from '@validators/password-confirm.validator';

export class AdminUpdateUserDto {
    @ApiProperty({ required: false, description: 'first name' })
    @IsOptional()
    firstName: string;

    @ApiProperty({ required: false, description: 'first name' })
    @IsOptional()
    lastName: string;

    @ApiProperty({ required: false, description: 'password' })
    @IsOptional()
    @IsNotEmpty()
    @Length(8, 24)
    password: string;

    @ApiProperty({ required: false, description: 'passwordConfirmation' })
    @IsOptional()
    @IsNotEmpty()
    @Validate(PasswordConfirmValidator, ['password'])
    passwordConfirmation: string;

    @ApiProperty({ required: false, description: 'role', enum: RoleEnum })
    @IsOptional()
    @IsEnum(RoleEnum)
    role: RoleEnum;

    @ApiProperty({ required: false, description: 'isActive' })
    @IsOptional()
    @IsBoolean()
    isActive: boolean;
}
