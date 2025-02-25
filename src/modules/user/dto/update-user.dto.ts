import { IsBoolean, IsOptional } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty()
  @IsOptional()
  firstName: string;

  @ApiProperty()
  @IsOptional()
  lastName: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isActive: boolean;
}
