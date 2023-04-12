import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';

import { MessageCode } from '@constants/message-code';
import { ApiProperty } from '@nestjs/swagger';
import { ConvertToBoolean, ConvertToNumber } from '@utils/transformers.util';

export class PaginationResponse<T> {
    message: string;
    body: T | T[] | unknown | any;
    meta: {
        pagination: {
            currentPage: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };

    constructor(
        body: T[] | T | null = [],
        meta = {
            pagination: {
                currentPage: 0,
                limit: 0,
                total: 0,
                totalPages: 0,
            },
        },
        message = MessageCode.SUCCESS,
    ) {
        this.message = message;
        this.body = body;
        this.meta = meta;
    }
}

export class PaginationOption {
    @ApiProperty({
        default: 1,
        required: false,
        description: 'Page number',
    })
    @IsInt()
    @Type(() => Number)
    @ConvertToNumber()
    @IsOptional()
    @Min(0)
    page: number;

    @ApiProperty({
        default: 10,
        required: false,
        description: 'Limit result number',
    })
    @IsInt()
    @Type(() => Number)
    @ConvertToNumber()
    @IsOptional()
    @Min(1)
    @Max(1000)
    limit: number;

    @ApiProperty({
        default: false,
        required: false,
        description: 'deleted',
    })
    @IsBoolean()
    @IsOptional()
    @ConvertToBoolean()
    deleted: boolean;
}
