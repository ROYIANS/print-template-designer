import { BadRequestException } from '@nestjs/common'
import { deserialize, isTemplateSchema, type TemplateSchema } from '@ptd/core'

const MAX_TITLE_LENGTH = 120

/**
 * Maximum size of the complete JSON request body accepted after the Better Auth routes.
 * Datasource sample records have their own smaller Core limit; this allowance also covers pages,
 * components, bindings and the request envelope. Keep docker/nginx.conf aligned with this value.
 */
export const TEMPLATE_JSON_BODY_LIMIT_BYTES = 4 * 1024 * 1024

export interface TemplateWriteInput {
  title: string
  content: TemplateSchema
}

export interface TemplateUpdateInput extends TemplateWriteInput {
  expectedVersion: number
}

export interface TemplateRestoreInput {
  expectedVersion: number
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseBody(body: unknown): Record<string, unknown> {
  if (!isRecord(body)) {
    throw new BadRequestException('Request body must be an object')
  }

  return body
}

function parseTitle(value: unknown): string {
  if (typeof value !== 'string') {
    throw new BadRequestException('title must be a string')
  }

  const title = value.trim()
  if (title.length === 0 || title.length > MAX_TITLE_LENGTH) {
    throw new BadRequestException(`title must contain 1-${MAX_TITLE_LENGTH} characters`)
  }

  return title
}

function parseContent(value: unknown): TemplateSchema {
  try {
    const json = JSON.stringify(value)
    if (json === undefined) throw new TypeError('content is not JSON serializable')
    const template = deserialize(json)
    if (!isTemplateSchema(template)) throw new TypeError('content is not a valid TemplateSchema')
    return template
  } catch {
    throw new BadRequestException('content must be a valid TemplateSchema')
  }
}

function parseExpectedVersion(value: unknown): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) {
    throw new BadRequestException('expectedVersion must be a positive integer')
  }

  return value
}

export function parseCreateTemplateBody(body: unknown): TemplateWriteInput {
  const value = parseBody(body)
  return {
    title: parseTitle(value['title']),
    content: parseContent(value['content']),
  }
}

export function parseUpdateTemplateBody(body: unknown): TemplateUpdateInput {
  const value = parseBody(body)
  return {
    title: parseTitle(value['title']),
    content: parseContent(value['content']),
    expectedVersion: parseExpectedVersion(value['expectedVersion']),
  }
}

export function parseRestoreTemplateBody(body: unknown): TemplateRestoreInput {
  const value = parseBody(body)
  return {
    expectedVersion: parseExpectedVersion(value['expectedVersion']),
  }
}
