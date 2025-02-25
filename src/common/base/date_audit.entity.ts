import {
  BaseEntity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export class DateAudit extends BaseEntity {
  @Column({ name: 'deleted', default: false })
  deleted: boolean;

  @CreateDateColumn({
    nullable: true,
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    nullable: true,
    name: 'updated_at',
  })
  updatedAt: Date;
}
