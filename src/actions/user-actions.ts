'use server'

import redis from '$/lib/redis'
import type { ActionResult } from '$/types/actions'
import type { User } from '$/types/user'

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

  await redis.set(`user:${userId}`, JSON.stringify(user))
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

  await redis.set(`user:${userId}`, JSON.stringify(user))
  return { success: true, data: user }
}

export { createUser, getOrCreateUser, getUser }
