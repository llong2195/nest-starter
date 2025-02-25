import { config } from 'dotenv';

config();

// App
export const NODE_ENV: string = process.env.NODE_ENV || 'development';
export const PORT: number = parseInt(process.env.PORT || '4000', 10);
export const LOG_LEVEL: string =
  process.env.LOG_LEVEL || 'log,error,warn,debug,verbose';
export const SERVER_URL: string = process.env.SERVER_URL || '';
export const LISTEN_ON: string = process.env.LISTEN_ON || '0.0.0.0';
export const TIMEZONE: string = process.env.TIMEZONE || 'Asia/Ho_Chi_Minh';
export const API_PREFIX: string = process.env.API_PREFIX || 'api';
export const PAGE_SIZE: number = parseInt(process.env.PAGE_SIZE || '20', 10);
export const DOMAIN_WHITELIST: string = process.env.DOMAIN_WHITELIST || '*';

// THROTTLE
export const THROTTLE_TTL: number = parseInt(process.env.THROTTLE_TTL || '300');
export const THROTTLE_LIMIT: number = parseInt(
  process.env.THROTTLE_LIMIT || '300',
);

// BCRYPT_SALT
export const BCRYPT_SALT: number = parseInt(
  process.env.BCRYPT_SALT || '10',
  10,
);

// i18n
export const DEFAULT_LOCALE: string = process.env.DEFAULT_LOCALE || 'vi';

// JSON Web Token
export const JWT_SECRET_KEY: string =
  process.env.JWT_SECRET_KEY || 'ThisIsJwtSecretKey123!@#';
export const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '10h';
export const JWT_REFRESH_TOKEN_EXPIRATION: string =
  process.env.JWT_REFRESH_TOKEN_EXPIRATION || '24h';

// DATABASE
export const DATABASE_CONNECTION: string =
  process.env.DATABASE_CONNECTION || 'mysql';
export const DATABASE_HOST: string = process.env.DATABASE_HOST || 'localhost';
export const DATABASE_PORT: number = parseInt(
  process.env.DATABASE_PORT || '3306',
  10,
);
export const DATABASE_USERNAME: string =
  process.env.DATABASE_USERNAME || 'root';
export const DATABASE_PASSWORD: string =
  process.env.DATABASE_PASSWORD || 'password';
export const DATABASE_DB_NAME: string =
  process.env.DATABASE_DB_NAME || 'nest-starter';

// FILE
export const MAX_FILE_SIZE: number = parseInt(
  process.env.MAX_FILE_SIZE || `${5 * 1024 * 1024}`,
  10,
);
export const MAX_FILE_SIZE_IMAGE: number = parseInt(
  process.env.MAX_FILE_SIZE_IMAGE || `${5 * 1024 * 1024}`,
  10,
);
export const MAX_FILE_SIZE_VIDEO: number = parseInt(
  process.env.MAX_FILE_SIZE_VIDEO || `${5 * 1024 * 1024}`,
  10,
);
export const UPLOAD_LOCATION: string = process.env.UPLOAD_LOCATION || 'uploads';

// MAILER
export const NODEMAILER_HOST: string =
  process.env.NODEMAILER_HOST || 'smtp.gmail.com';
export const NODEMAILER_PORT: number = parseInt(
  process.env.NODEMAILER_PORT || '465',
  10,
);
export const NODEMAILER_SECURE: boolean =
  Boolean(process.env.NODEMAILER_SECURE) || true;
export const NODEMAILER_USER: string = process.env.NODEMAILER_USER || '';
export const NODEMAILER_PASS: string = process.env.NODEMAILER_PASS || '';

//  REDIS_HOST=redis
export const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
export const REDIS_PORT: number = parseInt(
  process.env.REDIS_PORT || '6379',
  10,
);
export const REDIS_PASSWORD: string = process.env.REDIS_PASSWORD || '';
export const REDIS_DB: string = process.env.REDIS_DB || '';

//  CONFIG OTP
export const OTP_LENGTH: number = parseInt(process.env.OTP_LENGTH || '6', 10);
export const OTP_TTL: number = parseInt(process.env.OTP_TTL || '300', 10);
export const OTP_RESEND_TIME: number = parseInt(
  process.env.OTP_RESEND_TIME || '60',
  10,
);

//  CONFIG CLOUD
export const CLOUD_NAME: string = process.env.CLOUD_NAME || '';
export const CLOUD_API_KEY: string = process.env.CLOUD_API_KEY || '';
export const CLOUD_API_SECRET: string = process.env.CLOUD_API_SECRET || '';

//  CONFIG CLOUD
export const AWS_ACCESS_KEY_ID: string = process.env.AWS_ACCESS_KEY_ID || '';
export const AWS_SECRET_ACCESS_KEY: string =
  process.env.AWS_SECRET_ACCESS_KEY || '';
export const AWS_REGION: string = process.env.AWS_REGION || '';

//  CONFIG OTP
export const SENTRY_DSN: string = process.env.SENTRY_DSN || '';
