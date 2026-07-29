import { closeSync, mkdirSync, openSync } from 'node:fs'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const databaseUrl = process.env.DATABASE_URL ?? 'file:./dev.db'

function getDatabasePath() {
  if (databaseUrl === 'file::memory:' || databaseUrl.startsWith('file::memory:?')) {
    return undefined
  }

  if (databaseUrl.startsWith('file:')) {
    const serverDirectory = new URL('../', import.meta.url)
    return fileURLToPath(new URL(databaseUrl, serverDirectory))
  }

  return undefined
}

const databasePath = getDatabasePath()
if (databasePath) {
  mkdirSync(dirname(databasePath), { recursive: true })
  closeSync(openSync(databasePath, 'a'))
}
