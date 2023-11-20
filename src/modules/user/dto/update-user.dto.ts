import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

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
