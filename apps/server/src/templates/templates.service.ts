import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { deserialize, serialize, type TemplateSchema } from '@ptd/core'
import { Prisma } from '../generated/prisma/client.js'
import { PrismaService } from '../prisma/prisma.service.js'
import type {
  TemplateRestoreInput,
  TemplateUpdateInput,
  TemplateWriteInput,
} from './template-contract.js'

interface StoredTemplate {
  id: number
  title: string
  content: Prisma.JsonValue
  version: number
  createdAt: Date
  updatedAt: Date
}

interface StoredTemplateVersion {
  id: number
  templateId: number
  title: string
  content: Prisma.JsonValue
  version: number
  createdAt: Date
}

function toPrismaJson(content: TemplateSchema): Prisma.InputJsonValue {
  const normalized: unknown = JSON.parse(serialize(content))
  if (!isPrismaInputJsonObject(normalized)) {
    throw new TypeError('Serialized template content must be a JSON object')
  }

  return normalized
}

function fromPrismaJson(content: Prisma.JsonValue): TemplateSchema {
  return deserialize(JSON.stringify(content))
}

function toTemplateResponse(template: StoredTemplate) {
  return {
    ...template,
    content: fromPrismaJson(template.content),
  }
}

function toVersionResponse(version: StoredTemplateVersion) {
  return {
    ...version,
    content: fromPrismaJson(version.content),
  }
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

  if (Array.isArray(value)) {
    return value.every(isPrismaInputJsonValue)
  }

  return isPrismaInputJsonObject(value)
}

@Injectable()
export class TemplatesService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.template.findMany({
      select: {
        id: true,
        title: true,
        version: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
    })
  }

  async create(input: TemplateWriteInput) {
    const content = toPrismaJson(input.content)
    const template = await this.prisma.$transaction((transaction) =>
      transaction.template.create({
        data: {
          title: input.title,
          content,
          versions: {
            create: {
              version: 1,
              title: input.title,
              content,
            },
          },
        },
      }),
    )

    return toTemplateResponse(template)
  }

  async get(id: number) {
    const template = await this.prisma.template.findUnique({ where: { id } })
    if (!template) {
      throw new NotFoundException(`Template ${id} was not found`)
    }

    return toTemplateResponse(template)
  }

  async update(id: number, input: TemplateUpdateInput) {
    const content = toPrismaJson(input.content)
    const template = await this.prisma.$transaction(async (transaction) => {
      const current = await transaction.template.findUnique({
        where: { id },
        select: { version: true },
      })
      if (!current) {
        throw new NotFoundException(`Template ${id} was not found`)
      }
      if (current.version !== input.expectedVersion) {
        throw new ConflictException(`Template ${id} is currently at version ${current.version}`)
      }

      const nextVersion = current.version + 1
      const updated = await transaction.template.updateMany({
        where: { id, version: input.expectedVersion },
        data: {
          title: input.title,
          content,
          version: nextVersion,
        },
      })
      if (updated.count !== 1) {
        throw new ConflictException(`Template ${id} was changed by another request`)
      }

      await transaction.templateVersion.create({
        data: {
          templateId: id,
          version: nextVersion,
          title: input.title,
          content,
        },
      })

      return transaction.template.findUniqueOrThrow({ where: { id } })
    })

    return toTemplateResponse(template)
  }

  async remove(id: number) {
    const deleted = await this.prisma.template.deleteMany({ where: { id } })
    if (deleted.count !== 1) {
      throw new NotFoundException(`Template ${id} was not found`)
    }

    return { deleted: true }
  }

  async listVersions(templateId: number) {
    await this.ensureTemplateExists(templateId)
    return this.prisma.templateVersion.findMany({
      where: { templateId },
      select: {
        version: true,
        title: true,
        createdAt: true,
      },
      orderBy: { version: 'desc' },
    })
  }

  async getVersion(templateId: number, version: number) {
    const snapshot = await this.prisma.templateVersion.findUnique({
      where: {
        templateId_version: { templateId, version },
      },
    })
    if (!snapshot) {
      throw new NotFoundException(`Template ${templateId} version ${version} was not found`)
    }

    return toVersionResponse(snapshot)
  }

  async restore(templateId: number, version: number, input: TemplateRestoreInput) {
    const template = await this.prisma.$transaction(async (transaction) => {
      const current = await transaction.template.findUnique({
        where: { id: templateId },
        select: { version: true },
      })
      if (!current) {
        throw new NotFoundException(`Template ${templateId} was not found`)
      }
      if (current.version !== input.expectedVersion) {
        throw new ConflictException(
          `Template ${templateId} is currently at version ${current.version}`,
        )
      }

      const snapshot = await transaction.templateVersion.findUnique({
        where: {
          templateId_version: { templateId, version },
        },
      })
      if (!snapshot) {
        throw new NotFoundException(`Template ${templateId} version ${version} was not found`)
      }

      const nextVersion = current.version + 1
      const content = toPrismaJson(fromPrismaJson(snapshot.content))
      const updated = await transaction.template.updateMany({
        where: { id: templateId, version: input.expectedVersion },
        data: {
          title: snapshot.title,
          content,
          version: nextVersion,
        },
      })
      if (updated.count !== 1) {
        throw new ConflictException(`Template ${templateId} was changed by another request`)
      }

      await transaction.templateVersion.create({
        data: {
          templateId,
          version: nextVersion,
          title: snapshot.title,
          content,
        },
      })

      return transaction.template.findUniqueOrThrow({ where: { id: templateId } })
    })

    return toTemplateResponse(template)
  }

  private async ensureTemplateExists(id: number): Promise<void> {
    const template = await this.prisma.template.findUnique({
      where: { id },
      select: { id: true },
    })
    if (!template) {
      throw new NotFoundException(`Template ${id} was not found`)
    }
  }
}
