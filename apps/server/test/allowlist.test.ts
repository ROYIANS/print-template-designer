import { afterEach, describe, expect, it } from 'vitest'
import { isAllowedEmail, normalizeEmail, parseAllowedEmails } from '../src/auth/allowlist.js'

describe('server email allowlist', () => {
  const original = process.env.PTD_ALLOWED_EMAILS

  afterEach(() => {
    if (original === undefined) delete process.env.PTD_ALLOWED_EMAILS
    else process.env.PTD_ALLOWED_EMAILS = original
  })

  it('normalizes comma-separated addresses and matches exactly', () => {
    const allowed = parseAllowedEmails(' Owner@Example.com, teammate@example.com ')
    expect([...allowed]).toEqual(['owner@example.com', 'teammate@example.com'])
    expect(normalizeEmail(' OWNER@example.com ')).toBe('owner@example.com')

    process.env.PTD_ALLOWED_EMAILS = 'Owner@Example.com'
    expect(isAllowedEmail('owner@example.com')).toBe(true)
    expect(isAllowedEmail('owner+other@example.com')).toBe(false)
  })

  it('fails closed for an empty or malformed configuration', () => {
    expect(() => parseAllowedEmails(undefined)).toThrow('at least one email')
    expect(() => parseAllowedEmails('not-an-email')).toThrow('invalid email')
  })
})
