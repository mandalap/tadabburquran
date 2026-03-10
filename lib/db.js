import { Pool } from 'pg'
import Redis from 'ioredis'

// PostgreSQL Connection Pool
// In production, all DB_* environment variables must be set
const isProduction = process.env.NODE_ENV === 'production'

if (isProduction && !process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set in production')
}

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'tadabburquran',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'tadabburquran_db',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
})

// Redis Connection
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000)
    return delay
  },
})

// Helper function to query with caching
export async function cachedQuery(key, queryFn, ttl = 300) {
  try {
    // Try to get from cache first
    const cached = await redis.get(key)
    if (cached) {
      return JSON.parse(cached)
    }

    // If not in cache, execute query
    const result = await queryFn()

    // Store in cache
    await redis.set(key, JSON.stringify(result), 'EX', ttl)

    return result
  } catch (error) {
    console.error('Cache error:', error)
    // Fallback to query directly
    return await queryFn()
  }
}

// Helper function to invalidate cache
export async function invalidateCache(pattern) {
  try {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  } catch (error) {
    console.error('Cache invalidate error:', error)
  }
}

// Database query helper
export async function query(text, params) {
  const start = Date.now()
  try {
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    console.log('Executed query', { text, duration, rows: res.rowCount })
    return res
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

// Get a single row
export async function queryOne(text, params) {
  const res = await query(text, params)
  return res.rows[0] || null
}

// Get all rows
export async function queryAll(text, params) {
  const res = await query(text, params)
  return res.rows
}

// Transaction helper
export async function transaction(callback) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

// Export pool and redis for direct access if needed
export { pool, redis }

// Health check
export async function healthCheck() {
  try {
    await pool.query('SELECT 1')
    await redis.ping()
    return { postgres: 'ok', redis: 'ok' }
  } catch (error) {
    return { postgres: 'error', redis: 'error', error: error.message }
  }
}
