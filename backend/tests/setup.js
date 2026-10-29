// Loaded via --import before any test file, so config/env.js sees these values.
process.env.NODE_ENV = 'test';
process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/eventsphere-test';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-that-is-long-enough-123456';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-that-is-long-enough-123456';
process.env.BCRYPT_ROUNDS = '4';
// Pin values that a developer's local .env might override.
process.env.CLIENT_URL = 'http://localhost:5173';
process.env.TRUST_PROXY = '1';
