import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNotEmpty, Length, Validate } from 'class-validator';

import { PasswordConfirmValidator } from '@validators/password-confirm.validator';
import { UniqueEmailValidator } from '@validators/unique-email.validator';

export class AdminCreateUserDto {
    @ApiProperty({ example: 'test1@example.com' })
    @IsNotEmpty({ message: 'email is not empty' })
    @IsEmail(undefined, { message: 'email invalid' })
    @Validate(UniqueEmailValidator, { message: 'email invalid' })
    email: string;

    @ApiProperty({ example: 'Long' })
    @IsNotEmpty({ message: 'first name is not empty' })
    firstName: string;

    @ApiProperty({ example: 'Long' })
    @IsNotEmpty({ message: 'last name is not empty' })
    lastName: string;

    @ApiProperty({ example: 'password' })
    @IsNotEmpty({ message: 'password is not empty' })
    @Length(8, 24, { message: 'password invalid' })
    password: string;

    @ApiProperty({ example: 'password' })
    @IsNotEmpty({ message: 'password confirmation is not empty' })
    @Validate(PasswordConfirmValidator, ['password'], {
        message: 'password confirmation invalid',
    })
    passwordConfirmation: string;

    @ApiProperty({ example: 'true' })
    @IsNotEmpty({ message: 'isActive is not empty' })
    @IsBoolean({ message: 'isActive invalid' })
    isActive: boolean;
}
