import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class QRCodeDto {
    @ApiProperty({
        description: 'text',
        required: true,
        default: 'fjob',
    })
    @IsNotEmpty()
    @IsString()
    text: string;

    @ApiProperty({
        description: 'size',
        required: false,
        default: 200,
    })
    @IsNotEmpty()
    @IsInt()
    @Type(() => Number)
    size: number;
}
