import { BadRequestException } from '@nestjs/common'
import type { TemplateSchema } from '@ptd/core'

const MAX_TITLE_LENGTH = 120

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

function isTemplateSchema(value: unknown): value is TemplateSchema {
  return (
    isRecord(value) &&
    typeof value['_version'] === 'number' &&
    Number.isFinite(value['_version']) &&
    isRecord(value['pageConfig']) &&
    Array.isArray(value['pages']) &&
    value['pages'].length > 0 &&
    Array.isArray(value['dataSource']) &&
    isRecord(value['dataSet'])
  )
}

function parseContent(value: unknown): TemplateSchema {
  if (!isTemplateSchema(value)) {
    throw new BadRequestException(
      'content must contain _version, pageConfig, non-empty pages, dataSource and dataSet',
    )
  }

  return value
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
