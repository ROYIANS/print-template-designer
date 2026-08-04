import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '../generated/prisma/client.js'
import { PrismaService } from '../prisma/prisma.service.js'
import type {
  TemplateRestoreInput,
  TemplateUpdateInput,
  TemplateWriteInput,
} from './template-contract.js'
import { fromPrismaJson, toPrismaJson } from './template-json.js'

interface StoredTemplate {
  id: number
  key: string
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

function toTemplateResponse(template: StoredTemplate) {
  return {
    id: template.id,
    key: template.key,
    title: template.title,
    content: fromPrismaJson(template.content),
    version: template.version,
    createdAt: template.createdAt,
    updatedAt: template.updatedAt,
  }
}

function toVersionResponse(version: StoredTemplateVersion) {
  return {
    ...version,
    content: fromPrismaJson(version.content),
  }
}

@Injectable()
export class TemplatesService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  list(ownerId: string) {
    return this.prisma.template.findMany({
      where: { ownerId },
      select: {
        id: true,
        key: true,
        title: true,
        version: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
    })
  }

  async create(ownerId: string, input: TemplateWriteInput) {
    const content = toPrismaJson(input.content)
    const template = await this.prisma.$transaction((transaction) =>
      transaction.template.create({
        data: {
          title: input.title,
          content,
          ownerId,
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

  async get(ownerId: string, id: number) {
    const template = await this.prisma.template.findFirst({ where: { id, ownerId } })
    if (!template) {
      throw new NotFoundException(`Template ${id} was not found`)
    }

    return toTemplateResponse(template)
  }

  async getByKey(ownerId: string, key: string) {
    const template = await this.prisma.template.findFirst({ where: { key, ownerId } })
    if (!template) throw new NotFoundException('Template was not found')
    return toTemplateResponse(template)
  }

  async update(ownerId: string, id: number, input: TemplateUpdateInput) {
    const content = toPrismaJson(input.content)
    const template = await this.prisma.$transaction(async (transaction) => {
      const current = await transaction.template.findFirst({
        where: { id, ownerId },
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
        where: { id, ownerId, version: input.expectedVersion },
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

      return transaction.template.findFirstOrThrow({ where: { id, ownerId } })
    })

    return toTemplateResponse(template)
  }

  async remove(ownerId: string, id: number) {
    const deleted = await this.prisma.template.deleteMany({ where: { id, ownerId } })
    if (deleted.count !== 1) {
      throw new NotFoundException(`Template ${id} was not found`)
    }

    return { deleted: true }
  }

  async listVersions(ownerId: string, templateId: number) {
    const template = await this.prisma.template.findFirst({
      where: { id: templateId, ownerId },
      select: {
        versions: {
          select: {
            version: true,
            title: true,
            createdAt: true,
          },
          orderBy: { version: 'desc' },
        },
      },
    })
    if (!template) throw new NotFoundException(`Template ${templateId} was not found`)
    return template.versions
  }

  async getVersion(ownerId: string, templateId: number, version: number) {
    const snapshot = await this.prisma.templateVersion.findFirst({
      where: { templateId, version, template: { ownerId } },
    })
    if (!snapshot) {
      throw new NotFoundException(`Template ${templateId} version ${version} was not found`)
    }

    return toVersionResponse(snapshot)
  }

  async restore(ownerId: string, templateId: number, version: number, input: TemplateRestoreInput) {
    const template = await this.prisma.$transaction(async (transaction) => {
      const current = await transaction.template.findFirst({
        where: { id: templateId, ownerId },
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
        where: { id: templateId, ownerId, version: input.expectedVersion },
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

      return transaction.template.findFirstOrThrow({ where: { id: templateId, ownerId } })
    })

    return toTemplateResponse(template)
  }
}
