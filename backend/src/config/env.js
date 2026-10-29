import dotenv from 'dotenv';
import Joi from 'joi';

dotenv.config({ quiet: true });

const duration = Joi.string().pattern(/^\d+[smhd]$/, 'duration (e.g. 15m, 7d)');

const schema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().port().default(5050),
  MONGO_URI: Joi.string()
    .uri({ scheme: ['mongodb', 'mongodb+srv'] })
    .required(),
  CLIENT_URL: Joi.string().default('http://localhost:5173'),
  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  ACCESS_TOKEN_TTL: duration.default('15m'),
  REFRESH_TOKEN_TTL: duration.default('7d'),
  BCRYPT_ROUNDS: Joi.number().integer().min(4).max(15).default(12),
  AUTH_RATE_LIMIT_MAX: Joi.number().integer().min(1).default(20),
}).unknown();

const { value, error } = schema.validate(process.env, { abortEarly: false });

if (error) {
  console.error('Invalid environment configuration:');
  for (const detail of error.details) console.error(`  - ${detail.message}`);
  process.exit(1);
}

export const env = {
  nodeEnv: value.NODE_ENV,
  isProd: value.NODE_ENV === 'production',
  isTest: value.NODE_ENV === 'test',
  port: value.PORT,
  mongoUri: value.MONGO_URI,
  clientUrls: value.CLIENT_URL.split(',').map((url) => url.trim()),
  jwt: {
    accessSecret: value.JWT_ACCESS_SECRET,
    refreshSecret: value.JWT_REFRESH_SECRET,
    accessTtl: value.ACCESS_TOKEN_TTL,
    refreshTtl: value.REFRESH_TOKEN_TTL,
  },
  bcryptRounds: value.BCRYPT_ROUNDS,
  authRateLimitMax: value.AUTH_RATE_LIMIT_MAX,
};
