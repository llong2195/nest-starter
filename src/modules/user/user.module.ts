import { UserEntity } from '@/database/pg/entities/entities';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminUserController } from './controller/admin.user.controller';
import { UserController } from './controller/user.controller';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [UserController, AdminUserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
