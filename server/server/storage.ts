import { drizzle } from 'drizzle-orm/neon-serverless';
import { neonConfig, Pool } from '@neondatabase/serverless';
import ws from 'ws';
import * as schema from '@shared/schema.js';

// Configure Neon for serverless/edge environments
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Create connection pool
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  // Additional pool configuration for production
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Create Drizzle database instance with schema
export const db = drizzle(pool, { 
  schema,
  logger: process.env.NODE_ENV === 'development'
});

// Export the pool for session storage (used in replitAuth.ts)
export { pool };

// Database health check function
export async function healthCheck() {
  try {
    const result = await pool.query('SELECT 1');
    return { status: 'healthy', timestamp: new Date().toISOString() };
  } catch (error) {
    console.error('Database health check failed:', error);
    return { 
      status: 'unhealthy', 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString() 
    };
  }
}

// Graceful shutdown
export async function closeDatabase() {
  try {
    await pool.end();
    console.log('Database connection pool closed');
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
}

// Handle process termination
process.on('SIGINT', closeDatabase);
process.on('SIGTERM', closeDatabase);
