import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { DateAudit } from '@base/date_audit.entity';
import { FileType } from '@enums/file.enum';

@Entity({ name: 'file' })
export class FileEntity extends DateAudit {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column({ name: 'origin_url', type: 'varchar', nullable: true })
    originUrl: string;

    @Column({ name: 'width', type: 'int', nullable: true })
    width: number;

    @Column({ name: 'height', type: 'int', nullable: true })
    height: number;

    @Column({ name: 'size', type: 'int', nullable: true })
    size: number;

    @Column({ name: 'public_id', type: 'varchar', nullable: true })
    publicId: string;

    @Column({ name: 'user_id', type: 'int', nullable: true })
    userId: number;

    @Column({ name: 'type', type: 'int', nullable: true, default: FileType.IMAGE })
    type: number;

    @Column({ name: 'data', type: 'varchar', nullable: true, select: false })
    data: string;

    constructor(partial: Partial<FileEntity>) {
        super();
        Object.assign(this, partial);
    }
}
