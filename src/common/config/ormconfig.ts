import * as dotenv from 'dotenv';
dotenv.config();

const ormconfig = {
  name: 'default',
  type: process.env.DB_TYPE as 'mysql',
  username: process.env.DB_USERNAME,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  synchronize: false,
  maxQueryExecutionTime: 300,
  entities: ['dist/database/entities/*.entity{.ts,.js}'],
  migrations: ['dist/database/migration/*{.ts,.js}'],
  cli: {
    migrationsDir: 'src/database/migration',
  },
};

export = ormconfig;
