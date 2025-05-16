// import { DataSource, DataSourceOptions } from 'typeorm';
//
// export const appDataSource = new DataSource({
//   type: 'postgres',
//   host: 'localhost',
//   port: 5432,
//   username: 'postgres',
//   password: 'Adminadmin',
//   database: 'voteAppDB',
//   entities: ['**/*.entity.ts'],
//   migrations: [__dirname + '/migrations/*.ts'],
// } as DataSourceOptions);

import { DataSource } from 'typeorm';
import { typeOrmOptions } from './config/typeorm.options';

export const appDataSource = new DataSource(typeOrmOptions);
