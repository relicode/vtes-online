import 'server-only'

import Redis from 'ioredis'

const createRedisClient = () => new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379')

const globalForRedis = globalThis as unknown as { redis: Redis | undefined }

const redis = globalForRedis.redis ?? createRedisClient()

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis
}

export default redis
