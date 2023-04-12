import * as fs from 'fs';

import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { BaseService } from '@base/base.service';
import { FileEntity } from '@entities/file.entity';
import { FileType } from '@enums/file.enum';
import { API_PREFIX, SERVER_URL, UPLOAD_LOCATION } from '@src/configs/config';
import { ErrorMessageCode } from '@src/constants';
import { cloudinary } from '@src/utils/cloudinary.util';

import { LoggerService } from 'src/logger/custom.logger';
import { FileRepository } from './file.repository';

@Injectable()
export class FileService extends BaseService<FileEntity, FileRepository> {
    constructor(repository: FileRepository, logger: LoggerService) {
        super(repository, logger);
    }

    /**
     * It uploads a file, resizes it, and saves it to the database
     * @param {number} userId - number, file: Express.Multer.File
     * @param file - Express.Multer.File
     * @returns The file entity
     */
    async uploadFile(userId: number, file: Express.Multer.File): Promise<FileEntity> {
        if (!file) {
            throw new HttpException(`file is not null`, HttpStatus.BAD_REQUEST);
        }
        const createFile = new FileEntity(null);
        createFile.userId = userId;
        createFile.originUrl = `${SERVER_URL}/${API_PREFIX}/v1/file/${file.filename}`;
        createFile.type = FileType.IMAGE;
        return await this._store(createFile);
    }

    /**
     * It uploads a file to cloudinary, creates a file entity in the database, and returns the file
     * entity
     * @param file - Express.Multer.File - The file object that Multer has created for us.
     * @param {number} userId - The userId of the user who uploaded the image.
     * @param {string} [tags] - tags ? tags : `avatars`,
     * @returns The file entity
     */
    async uploadImageToCloudinary(file: Express.Multer.File, userId: number, tags?: string): Promise<FileEntity> {
        try {
            if (!file) {
                throw new BadRequestException(ErrorMessageCode.NOT_FOUND);
            }
            console.log(file);
            const path = process.cwd() + `/${UPLOAD_LOCATION}/${file.filename}`;
            const uniqueFileName = Date.now() + '-' + file.originalname;
            const imagePublicId = `file/${uniqueFileName}`;

            const image = await cloudinary.uploader.upload(path, {
                public_id: imagePublicId,
                tags: tags ? tags : `avatars`,
                quality: 60,
            });

            const createFile = new FileEntity({});
            createFile.originUrl = image.url;
            createFile.width = image.width;
            createFile.height = image.height;
            createFile.size = image.bytes;
            createFile.publicId = image.public_id;
            createFile.userId = userId || null;
            createFile.data = JSON.stringify(image);
            await this._store(createFile);
            fs.unlinkSync(path);
            return createFile;
        } catch (e) {
            console.log(e);
            throw e;
        }
    }
}
