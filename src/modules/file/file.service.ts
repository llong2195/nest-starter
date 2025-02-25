import { Repository } from 'typeorm';

import { BaseService } from '@/common/base/base.service';
import { FileType } from '@/common/enums';
import { LoggerService } from '@/common/logger/custom.logger';
import { API_PREFIX, SERVER_URL } from '@/configs';
import { FileEntity } from '@/database/pg/entities/entities';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class FileService extends BaseService<
  FileEntity,
  Repository<FileEntity>
> {
  constructor(
    @InjectRepository(FileEntity) repository: Repository<FileEntity>,
    logger: LoggerService,
  ) {
    super(repository, logger);
  }

  /**
   * Uploads a file and creates a corresponding file entity in the database
   * @param userId - The ID of the user uploading the file
   * @param file - The file object from Express.Multer
   * @returns Promise resolving to the created FileEntity or null
   * @throws {HttpException} When file is null or invalid
   */
  async uploadFile(
    userId: number,
    file: Express.Multer.File,
  ): Promise<FileEntity | null> {
    if (!file) {
      throw new HttpException(`file is not null`, HttpStatus.BAD_REQUEST);
    }
    const createFile = new FileEntity({});
    createFile.userId = userId;
    createFile.originUrl = `${SERVER_URL ?? ''}/${API_PREFIX}/v1/file/${file.filename}`;
    createFile.type = FileType.IMAGE;
    return await this._store(createFile);
  }
}
