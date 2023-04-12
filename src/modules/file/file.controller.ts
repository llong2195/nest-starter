import { plainToInstance } from 'class-transformer';
import contentDisposition from 'content-disposition';
import { Response } from 'express';
import { createReadStream, existsSync, statSync } from 'fs';
import mime from 'mime-types';
import { join } from 'path';

import {
    Controller,
    Get,
    Headers,
    HttpCode,
    HttpException,
    HttpStatus,
    NotFoundException,
    Param,
    Post,
    Query,
    Res,
    StreamableFile,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';

import { BaseResponseDto, CurrentUserDto } from '@base/base.dto';
import { PaginationResponse, PaginationOption } from '@base/pagination.dto';
import { UPLOAD_LOCATION, multerOptions } from '@configs/index';
import { Authorize, CurrentUser } from '@decorators/index';
import { FileEntity } from '@entities/file.entity';
import { RoleEnum } from '@src/enums';

import { CreateFileDto } from './dto/create-file.dto';
import { FileService } from './file.service';

@ApiBearerAuth()
@ApiTags('/v1/file')
@Controller('v1/file')
export class FileController {
    constructor(private readonly uploadFileService: FileService) {}

    // @UseGuards(JwtAuthGuard)
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: 'file image',
        type: CreateFileDto,
    })
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(FileInterceptor('file', multerOptions))
    @Post('/upload-image-local')
    async local(@UploadedFile() file: Express.Multer.File, @CurrentUser() currentUserDto?: CurrentUserDto) {
        const uploadfile = await this.uploadFileService.uploadFile(currentUserDto?.id, file);
        return new BaseResponseDto<FileEntity>(plainToInstance(FileEntity, uploadfile));
    }

    // @UseGuards(JwtAuthGuard)
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: 'file image',
        type: CreateFileDto,
    })
    @HttpCode(HttpStatus.OK)
    @Post('/upload-image-cloud')
    @UseInterceptors(FileInterceptor('file', multerOptions))
    async cloud(
        @UploadedFile() file: Express.Multer.File,
        @CurrentUser() currentUserDto?: CurrentUserDto,
    ): Promise<BaseResponseDto<FileEntity>> {
        try {
            const data = await this.uploadFileService.uploadImageToCloudinary(file, currentUserDto?.id);
            return new BaseResponseDto<FileEntity>(plainToInstance(FileEntity, data));
        } catch (error) {
            throw new HttpException(error.message, 500);
        }
    }

    @Authorize(RoleEnum.ADMIN)
    @Get('/get-all')
    async getAll(@Query() filter: PaginationOption): Promise<PaginationResponse<FileEntity>> {
        const data = await this.uploadFileService._paginate(filter.page, filter.limit, { deleted: filter.deleted });
        return new PaginationResponse<FileEntity>(data.body, data.meta);
    }

    @Get('/:path')
    async stream(
        @Param('path') path: string,
        @Headers() headers,
        @Res({ passthrough: true }) res: Response,
        @Query('download') download = 'false',
    ): Promise<any> {
        try {
            const filePath = join(process.cwd(), UPLOAD_LOCATION, path);
            if (!existsSync(filePath)) {
                throw new NotFoundException();
            }
            const { size } = statSync(filePath);
            const contentType = mime.contentType(filePath.split('.').pop());
            const header = {
                'Content-Type': contentType,
                'Content-Length': size,
            };
            if (download === 'true') {
                header['Content-Disposition'] = contentDisposition(filePath);
            }
            // console.log(header);
            if (contentType.includes('video')) {
                const videoRange = headers.range;
                const CHUNK_SIZE = 10 * 10 ** 6; // 10 MB
                if (videoRange) {
                    const start = Number(videoRange.replace(/\D/g, ''));
                    const end = Math.min(start + CHUNK_SIZE, size - 1);
                    const contentLength = end - start + 1;
                    const readStreamfile = createReadStream(filePath, {
                        start,
                        end,
                    });
                    const head = {
                        'Accept-Ranges': 'bytes',
                        'Content-Type': contentType,
                        'Content-Range': `bytes ${start}-${end}/${size}`,
                        'Content-Length': contentLength,
                    };
                    res.writeHead(HttpStatus.PARTIAL_CONTENT, head); //206
                    return new StreamableFile(readStreamfile);
                } else {
                    const head = {
                        'Accept-Ranges': 'bytes',
                        'Content-Type': contentType,
                        'Content-Length': size,
                    };
                    res.writeHead(HttpStatus.OK, head); //200
                    // createReadStream(videoPath).pipe(res);
                    const readStreamfile = createReadStream(filePath);
                    return new StreamableFile(readStreamfile);
                }
            } else {
                res.set(header);
                const file = createReadStream(filePath);
                return new StreamableFile(file);
            }
        } catch (error) {
            console.log(error);
        }
    }
}
