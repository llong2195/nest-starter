import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { DateAudit } from '@/common/base/date_audit.entity';

@Entity({ name: 'setting' })
export class SettingEntity extends DateAudit {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'value', type: 'text' })
  value: string;

  @Column({ name: 'type', type: 'varchar', length: 20, default: '' })
  type: string;

  @Column({ name: 'is_public', type: 'boolean', default: false })
  isPublic: boolean;

  constructor(partial: Partial<SettingEntity>) {
    super();
    Object.assign(this, partial);
  }
}
