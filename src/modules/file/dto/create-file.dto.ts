import { ApiProperty } from '@nestjs/swagger';

export class CreateFileDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}
