const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function parseAdminEmails(value: string | undefined): ReadonlySet<string> {
  const emails = (value ?? '').split(',').map(normalizeEmail).filter(Boolean)
  const invalid = emails.find((email) => !EMAIL_PATTERN.test(email))
  if (invalid) throw new Error(`PTD_ADMIN_EMAILS contains an invalid email address: ${invalid}`)
  return new Set(emails)
}

export function isAdminEmail(email: string, adminEmails: ReadonlySet<string>): boolean {
  return adminEmails.has(normalizeEmail(email))
}
