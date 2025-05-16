import { config } from 'dotenv';
import * as process from 'process';
import { DataSourceOptions } from 'typeorm';

config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

const type = process.env.DATABASE_TYPE;

export const typeOrmOptions: DataSourceOptions =
  type === 'sqlite'
    ? {
      type: 'sqlite',
      database: process.env.DATABASE_NAME,
      entities: ['dist/**/*.entity.js'],
      migrations: ['dist/migrations/*.js'],
      synchronize: true,
    }
    : {
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: ['dist/**/*.entity.js'],
      migrations: ['dist/migrations/*.js'],
      synchronize: false,
    };
