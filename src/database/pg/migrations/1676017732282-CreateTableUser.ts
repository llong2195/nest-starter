import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateTableUser1676017732282 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user',
        columns: [
          {
            name: 'id',
            type: 'int',
            length: '11',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '100',
            isNullable: true,
            default: "''",
          },
          {
            name: 'avatar',
            type: 'varchar',
            isNullable: true,
            length: '500',
            default: "''",
          },
          {
            name: 'first_name',
            type: 'varchar',
            isNullable: true,
            length: '255',
          },
          {
            name: 'last_name',
            type: 'varchar',
            isNullable: true,
            length: '255',
          },
          {
            name: 'password',
            type: 'varchar',
            isNullable: true,
            length: '255',
          },
          {
            name: 'role',
            type: 'varchar',
            isNullable: true,
            length: '255',
            default: 'USER',
          },
          {
            name: 'is_active',
            type: 'int',
            isNullable: true,
            default: '1',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user');
  }
}
