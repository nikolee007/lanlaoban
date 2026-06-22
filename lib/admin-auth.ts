import { NextResponse } from 'next/server'
import { getAuthPayload } from './auth'

/**
 * Verify that the request is from an authenticated user.
 * Returns the JWT payload if valid, or null.
 *
 * TODO: When a `role` field is added to the User model and JWT payload,
 * add an explicit admin role check here:
 *   if (payload.role !== 'admin') return null
 */
export function requireAuth(headers: Headers) {
  return getAuthPayload(headers)
}

/**
 * Create an unauthorized JSON response.
 */
export function unauthorized(message = 'Unauthorized') {
  return NextResponse.json({ success: false, error: message }, { status: 401 })
}
