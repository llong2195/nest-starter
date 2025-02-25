import contentDisposition from 'content-disposition';
import { Request, Response } from 'express';
import mime from 'mime-types';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { BaseController } from '@/common/base/base.controller';
import { BaseResponseDto } from '@/common/base/base.dto';
import {
  PaginationOption,
  PaginationResponse,
} from '@/common/base/pagination.dto';
import { Authorize } from '@/common/decorators';
import { ApiFile } from '@/common/decorators/swagger.decorator';
import { RoleEnum } from '@/common/enums';
import { I18nService } from '@/common/shared/i18n.service';
import { UPLOAD_LOCATION } from '@/configs';
import { FileEntity } from '@/database/pg/entities/entities';
import {
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { multerOptions } from '@/configs/multer.config';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateFileDto } from './dto/create-file.dto';
import { FilterFileDto } from './dto/get-file.dto';
import { FileService } from './file.service';

@ApiBearerAuth()
@ApiTags('/v1/file')
@Controller({ version: '1', path: 'file' })
export class FileController extends BaseController {
  constructor(
    private readonly uploadFileService: FileService,
    i18n: I18nService,
  ) {
    super(i18n);
  }

  @ApiFile({
    description: 'Upload file',
    type: CreateFileDto,
  })
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file', multerOptions))
  @Post('/upload-image-local')
  async local(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
    // @CurrentUser() currentUser: CurrentUserDto,
  ) {
    try {
      const uploadfile = await this.uploadFileService.uploadFile(
        // currentUser.id,
        0,
        file,
      );
      return new BaseResponseDto<FileEntity>(uploadfile);
    } catch (error) {
      this.throwErrorProcess(error);
    }
  }

  @Authorize(RoleEnum.ADMIN)
  @Get('/get-all')
  async getAll(
    @Query() filter: PaginationOption,
  ): Promise<PaginationResponse<FileEntity>> {
    const data = await this.uploadFileService._paginate(
      filter.page,
      filter.limit,
      { deleted: filter.deleted },
    );
    return new PaginationResponse<FileEntity>(data.body, data.meta);
  }

  @Get('/:path')
  stream(
    @Param('path') path: string,
    @Headers() headers: Request['headers'],
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Query() filter: FilterFileDto,
  ) {
    try {
      // Sanitize the path to prevent directory traversal
      let sanitizedPath = path;
      while (sanitizedPath.includes('../')) {
        sanitizedPath = sanitizedPath.replace(/\.\.\//g, '');
      }
      const filePath = join(
        process.cwd(),
        UPLOAD_LOCATION || '',
        sanitizedPath,
      );
      if (!existsSync(filePath)) {
        throw new NotFoundException();
      }
      const { size } = statSync(filePath);
      const contentType =
        mime.contentType(filePath.split('.').pop() || '') ||
        'application/octet-stream';
      const header: Record<string, string | number> = {
        'Content-Type': contentType,
        'Content-Length': size,
      };
      if (filter.download === true) {
        header['Content-Disposition'] = contentDisposition(filePath);
      }
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
      this.throwErrorProcess(error);
    }
  }
}
