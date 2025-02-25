import { IsEmail, IsNotEmpty, Length, Validate } from 'class-validator';

import { IsEqualField } from '@/common/validators/is-equal-field.validator';
import { IsNotExist } from '@/common/validators/is-not-exist.validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterRequestDto {
  @ApiProperty({ example: 'email@gmail.com' })
  @IsNotEmpty({ message: 'email is not empty' })
  @IsEmail(undefined, { message: 'email invalid' })
  @Validate(IsNotExist, ['email'], { message: 'email invalid' })
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
  @Validate(IsEqualField, ['password'], {
    message: 'password confirmation invalid',
  })
  passwordConfirmation: string;
}
