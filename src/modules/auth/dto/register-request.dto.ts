import { IsEmail, IsNotEmpty, Length, Validate } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { PasswordConfirmValidator } from '@validators/password-confirm.validator';
import { UniqueEmailValidator } from '@validators/unique-email.validator';

export class RegisterRequestDto {
    @ApiProperty({ example: 'email@gmail.com' })
    @IsNotEmpty({ message: 'email is not empty' })
    @IsEmail(undefined, { message: 'email invalid' })
    @Validate(UniqueEmailValidator, { message: 'email invalid' })
    email: string;

    @ApiProperty({ example: 'F name' })
    @IsNotEmpty({ message: 'first name is not empty' })
    firstName: string;

    @ApiProperty({ example: 'L name' })
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
}
