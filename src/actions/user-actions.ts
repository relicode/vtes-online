'use server'

import redis from '$/lib/redis'
import type { ActionResult } from '$/types/actions'
import type { User } from '$/types/user'

const listUsers = async (): Promise<ActionResult<User[]>> => {
  const userIds = await redis.smembers('users')
  if (userIds.length === 0) return { success: true, data: [] }

  const pipeline = redis.pipeline()
  for (const id of userIds) pipeline.get(`user:${id}`)
  const results = await pipeline.exec()

  const users: User[] = []
  for (const [err, raw] of results ?? []) {
    if (err || !raw) continue
    users.push(JSON.parse(raw as string) as User)
  }

  return { success: true, data: users }
}

const getUser = async (userId: string): Promise<ActionResult<User>> => {
  const raw = await redis.get(`user:${userId}`)
  if (!raw) {
    return { success: false, error: 'User not found' }
  }
  return { success: true, data: JSON.parse(raw) as User }
}

const createUser = async (userId: string, name: string): Promise<ActionResult<User>> => {
  const existing = await redis.get(`user:${userId}`)
  if (existing) {
    return { success: false, error: 'User already exists' }
  }

  const user: User = {
    id: userId,
    name,
    createdAt: new Date().toISOString(),
  }

  await redis.pipeline().set(`user:${userId}`, JSON.stringify(user)).sadd('users', userId).exec()
  return { success: true, data: user }
}

const MAX_USER_ID_LENGTH = 64
const USER_ID_PATTERN = /^[a-zA-Z0-9_-]+$/

const getOrCreateUser = async (userId: string): Promise<ActionResult<User>> => {
  if (!userId || userId.length > MAX_USER_ID_LENGTH || !USER_ID_PATTERN.test(userId)) {
    return { success: false, error: 'Invalid user ID' }
  }

  const existing = await redis.get(`user:${userId}`)
  if (existing) {
    return { success: true, data: JSON.parse(existing) as User }
  }

  const user: User = {
    id: userId,
    name: userId,
    createdAt: new Date().toISOString(),
  }

  await redis.pipeline().set(`user:${userId}`, JSON.stringify(user)).sadd('users', userId).exec()
  return { success: true, data: user }
}

export { createUser, getOrCreateUser, getUser, listUsers }
