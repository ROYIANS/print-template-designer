import { deserialize, serialize, type TemplateSchema } from '@ptd/core'
import { Prisma } from '../generated/prisma/client.js'

export function toPrismaJson(content: TemplateSchema): Prisma.InputJsonValue {
  const normalized: unknown = JSON.parse(serialize(content))
  if (!isPrismaInputJsonObject(normalized)) {
    throw new TypeError('Serialized template content must be a JSON object')
  }

  return normalized
}

export function fromPrismaJson(content: Prisma.JsonValue): TemplateSchema {
  return deserialize(JSON.stringify(content))
}

function isPrismaInputJsonObject(value: unknown): value is Prisma.InputJsonObject {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every(isPrismaInputJsonValue)
  )
}

function isPrismaInputJsonValue(value: unknown): value is Prisma.InputJsonValue | null {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'boolean' ||
    (typeof value === 'number' && Number.isFinite(value))
  ) {
    return true
  }

  if (Array.isArray(value)) return value.every(isPrismaInputJsonValue)
  return isPrismaInputJsonObject(value)
}
