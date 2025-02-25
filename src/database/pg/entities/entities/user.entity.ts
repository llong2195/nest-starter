import { Expose } from 'class-transformer';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

import { DateAudit } from '@/common/base/date_audit.entity';
import { RoleEnum } from '@/common/enums';

@Index('idx_email', ['email'], { unique: true })
@Entity({ name: 'user' })
export class UserEntity extends DateAudit {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ unique: true, name: 'email', type: 'varchar', nullable: true })
  email: string;

  @Column({ name: 'avatar', type: 'text', nullable: true })
  avatar: string;

  @Column({ name: 'first_name', type: 'varchar', nullable: true })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', nullable: true })
  lastName: string;

  @Column({ name: 'password', type: 'varchar', nullable: true })
  password: string;

  @Column({ name: 'role', type: 'varchar', default: RoleEnum.USER })
  role: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  constructor(partial: Partial<UserEntity>) {
    super();
    Object.assign(this, partial);
  }

  @Expose()
  get fullName() {
    if (this?.firstName && this?.lastName)
      return `${this?.firstName} ${this?.lastName}`;
  }
}
