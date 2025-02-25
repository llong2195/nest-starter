import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';

import { ConvertToBoolean } from '@/utils';
import { ApiProperty } from '@nestjs/swagger';

import { MessageCode } from '../constants';

export class PaginationResponse<T> {
  message: string;
  body: T | T[] | null;
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

  static create<T>(
    items: T[],
    total: number,
    page: number,
    limit: number,
  ): PaginationResponse<T> {
    const totalPage = Math.ceil(total / limit);
    if (total <= 0 || page > totalPage) {
      return new PaginationResponse<T>([], {
        pagination: {
          currentPage: totalPage > 0 ? totalPage : 1,
          limit: limit,
          total: 0,
          totalPages: 0,
        },
      });
    }
    return new PaginationResponse(items, {
      pagination: {
        currentPage: Number(page),
        limit: limit,
        total: total,
        totalPages: totalPage,
      },
    });
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
