// tests/setup.js - Runs before each test file
process.env.NODE_ENV = 'test';
// Point to the dev db for integration tests (same schema)
process.env.DATABASE_URL = 'file:./prisma/dev.db';
process.env.JWT_ACCESS_SECRET = 'test_access_secret_key_minimum_length_32';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_key_minimum_length_32';
process.env.PORT = '3001';
process.env.CORS_ORIGIN = 'http://localhost:5173';
