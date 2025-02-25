import { FileEntity } from '@/database/pg/entities/entities/file.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FileController } from './file.controller';
import { FileService } from './file.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileEntity]),
    // BullModule.registerQueue({
    //   name: 'image',
    //   processors: [
    //     {
    //       name: 'resize',
    //       path: join(__dirname, 'resize.processor.js'),
    //     },
    //   ],
    // }),
  ],
  controllers: [FileController],
  providers: [FileService],
  exports: [FileService],
})
export class FileModule {}
