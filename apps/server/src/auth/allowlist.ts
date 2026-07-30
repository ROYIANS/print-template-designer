const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function parseAllowedEmails(value: string | undefined): ReadonlySet<string> {
  const emails = (value ?? '').split(',').map(normalizeEmail).filter(Boolean)

  if (emails.length === 0) {
    throw new Error('PTD_ALLOWED_EMAILS must contain at least one email address')
  }
  const invalid = emails.find((email) => !EMAIL_PATTERN.test(email))
  if (invalid) throw new Error(`PTD_ALLOWED_EMAILS contains an invalid email address: ${invalid}`)
  return new Set(emails)
}

export function isAllowedEmail(email: string): boolean {
  return parseAllowedEmails(process.env.PTD_ALLOWED_EMAILS).has(normalizeEmail(email))
}
