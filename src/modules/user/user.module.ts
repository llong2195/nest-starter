import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from '@entities/index';
import { AdminUserController } from './controller/admin.user.controller';
import { UserController } from './controller/user.controller';
import { UserSubscriber } from './subscriber/user.subscriber';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity])],
    controllers: [UserController, AdminUserController],
    providers: [UserService, UserSubscriber, UserRepository],
    exports: [UserService],
})
export class UserModule {}
