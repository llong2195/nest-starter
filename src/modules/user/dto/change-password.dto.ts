import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Length, Validate } from 'class-validator';

import { PasswordConfirmValidator } from '@validators/password-confirm.validator';

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
    @Validate(PasswordConfirmValidator, ['new_password'])
    newPasswordConfirmation: string;
}
