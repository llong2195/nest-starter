import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { DataSource, EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from 'typeorm';

import { UserEntity } from '@entities/user.entity';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<UserEntity> {
    private readonly bcryptSalt: number;

    constructor(
        dataSource: DataSource,
        private readonly configService: ConfigService,
    ) {
        dataSource.subscribers.push(this);
        this.bcryptSalt = configService.get<number>('BCRYPT_SALT');
    }

    listenTo() {
        return UserEntity;
    }

    async beforeInsert(event: InsertEvent<UserEntity>): Promise<void> {
        const { password } = event.entity;
        if (password) {
            event.entity.password = await bcrypt.hash(password, Number(this.bcryptSalt));
        }
    }

    async beforeUpdate(event: UpdateEvent<UserEntity>): Promise<void> {
        const { password } = event.entity;
        if (password) {
            event.entity.password = await bcrypt.hash(password, Number(this.bcryptSalt));
        }
    }
}
