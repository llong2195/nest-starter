import { IsNotEmpty, Length, Validate } from 'class-validator';

import { IsEqualField } from '@/common/validators/is-equal-field.validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @Length(8, 24)
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  @Length(8, 24)
  newPassword: string;

  @ApiProperty()
  @IsNotEmpty()
  @Validate(IsEqualField, ['new_password'], {
    message: 'password confirmation is not equal new password',
  })
  newPasswordConfirmation: string;
}
