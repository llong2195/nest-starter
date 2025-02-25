import { IsBoolean, IsOptional } from 'class-validator';

import { ConvertToBoolean } from '@/utils/transformers.util';
import { ApiProperty } from '@nestjs/swagger';

export class FilterFileDto {
  @ApiProperty({
    default: false,
    required: false,
    description: 'download',
  })
  @IsBoolean()
  @IsOptional()
  @ConvertToBoolean()
  download: boolean;
}
