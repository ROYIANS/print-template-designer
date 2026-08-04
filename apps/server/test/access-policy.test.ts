import { describe, expect, it } from 'vitest'
import { isAdminEmail, normalizeEmail, parseAdminEmails } from '../src/auth/access-policy.js'

describe('server administrator email policy', () => {
  it('normalizes comma-separated addresses and matches exactly', () => {
    const admins = parseAdminEmails(' Owner@Example.com, teammate@example.com ')
    expect([...admins]).toEqual(['owner@example.com', 'teammate@example.com'])
    expect(normalizeEmail(' OWNER@example.com ')).toBe('owner@example.com')
    expect(isAdminEmail('owner@example.com', admins)).toBe(true)
    expect(isAdminEmail('owner+other@example.com', admins)).toBe(false)
  })

  it('allows no administrators but rejects malformed configuration', () => {
    expect([...parseAdminEmails(undefined)]).toEqual([])
    expect([...parseAdminEmails('  ')]).toEqual([])
    expect(() => parseAdminEmails('not-an-email')).toThrow('PTD_ADMIN_EMAILS')
  })
})
