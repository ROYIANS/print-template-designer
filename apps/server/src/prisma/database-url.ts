const DEFAULT_DATABASE_URL = 'file:./dev.db'

export function getDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL

  if (!databaseUrl.startsWith('file:') || databaseUrl.startsWith('file::memory:')) {
    return databaseUrl
  }

  const serverDirectory = new URL('../../', import.meta.url)
  return new URL(databaseUrl, serverDirectory).href
}
