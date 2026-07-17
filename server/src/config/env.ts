import dotenv from 'dotenv';

// Loaded as the very first import in index.ts so that process.env is
// fully populated before any other module (services, middleware) is evaluated.
dotenv.config();
