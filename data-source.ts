import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

import { ConfigService } from '@nestjs/config';

config();

const configService = new ConfigService();

export const AppDataSource = new DataSource({
  type: (configService.get<string>('DATABASE_CONNECTION') as any) || 'postgres',
  host: configService.get<string>('DATABASE_HOST'),
  port: configService.get<number>('DATABASE_PORT'),
  username: configService.get<string>('DATABASE_USERNAME'),
  password: configService.get<string>('DATABASE_PASSWORD'),
  database: configService.get<string>('DATABASE_DB_NAME'),
  dropSchema: false,
  keepConnectionAlive: true,
  logging: 'all',
  logger: 'advanced-console',
  migrations: ['src/database/migrations/*.ts'],
  entities: [],
  // ssl: {
  //     require: false,
  //     rejectUnauthorized: false,
  // },
} as DataSourceOptions);

// console.log(AppDataSource);
