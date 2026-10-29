// Loaded via --import before any test file, so config/env.js sees these values.
process.env.NODE_ENV = 'test';
process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/eventsphere-test';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-that-is-long-enough-123456';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-that-is-long-enough-123456';
process.env.BCRYPT_ROUNDS = '4';
