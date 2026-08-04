import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { AuthConfigService } from '../src/auth/auth-config.js'
import { DemoDataService } from '../src/auth/demo-data.service.js'
import { DEMO_TEMPLATE, DEMO_TEMPLATE_TITLE } from '../src/auth/demo-template.js'
import { PrismaService } from '../src/prisma/prisma.service.js'
import { toPrismaJson } from '../src/templates/template-json.js'

const VISITOR = {
  id: 'demo-e2e-visitor',
  name: 'Demo visitor',
  email: 'demo-e2e-visitor@example.com',
  emailVerified: true,
}

const ADMIN = {
  id: 'demo-e2e-admin',
  name: 'Demo admin',
  email: 'demo-e2e-admin@example.com',
  emailVerified: true,
}

describe('demo data PostgreSQL lifecycle', () => {
  let prisma: PrismaService
  let service: DemoDataService

  beforeAll(async () => {
    prisma = new PrismaService()
    await prisma.$connect()
    await prisma.user.deleteMany({ where: { id: { in: [VISITOR.id, ADMIN.id] } } })
    await prisma.user.createMany({ data: [VISITOR, ADMIN] })
    await prisma.session.create({
      data: {
        id: 'demo-e2e-session',
        token: 'demo-e2e-session-token',
        expiresAt: new Date('2030-01-01T00:00:00Z'),
        userId: VISITOR.id,
      },
    })
    const content = toPrismaJson(DEMO_TEMPLATE)
    await prisma.template.create({
      data: {
        ownerId: VISITOR.id,
        title: '访客旧模板',
        content,
        versions: { create: { version: 1, title: '访客旧模板', content } },
      },
    })
    await prisma.template.create({
      data: {
        ownerId: ADMIN.id,
        title: '管理员保留模板',
        content,
        versions: { create: { version: 1, title: '管理员保留模板', content } },
      },
    })
    const authConfig = {
      demoMode: true,
      isAdmin: (email: string) => email === ADMIN.email,
    } as unknown as AuthConfigService
    service = new DemoDataService(prisma, authConfig)
  })

  afterAll(async () => {
    if (prisma) {
      await prisma.user.deleteMany({ where: { id: { in: [VISITOR.id, ADMIN.id] } } })
      await prisma.$disconnect()
    }
  })

  it('claims one reset per UTC day without deleting identity, sessions or administrator data', async () => {
    const firstDay = new Date('2026-08-04T12:00:00Z')
    const claims = await Promise.all([
      service.ensureVisitor(VISITOR, firstDay),
      service.ensureVisitor(VISITOR, firstDay),
    ])
    expect(claims.sort()).toEqual([false, true])

    const firstExample = await prisma.template.findFirstOrThrow({
      where: { ownerId: VISITOR.id },
      include: { versions: true },
    })
    expect(firstExample.title).toBe(DEMO_TEMPLATE_TITLE)
    expect(firstExample.versions).toHaveLength(1)
    expect(firstExample.versions[0]).toMatchObject({ version: 1, title: DEMO_TEMPLATE_TITLE })
    expect(await prisma.user.count({ where: { id: VISITOR.id } })).toBe(1)
    expect(await prisma.session.count({ where: { userId: VISITOR.id } })).toBe(1)

    await expect(service.ensureVisitor(ADMIN, firstDay)).resolves.toBe(false)
    await expect(
      prisma.template.findFirstOrThrow({ where: { ownerId: ADMIN.id } }),
    ).resolves.toMatchObject({ title: '管理员保留模板' })

    await expect(service.ensureVisitor(VISITOR, new Date('2026-08-05T00:00:01Z'))).resolves.toBe(
      true,
    )
    const nextExample = await prisma.template.findFirstOrThrow({
      where: { ownerId: VISITOR.id },
      include: { versions: true },
    })
    expect(nextExample.key).not.toBe(firstExample.key)
    expect(nextExample.versions).toHaveLength(1)
    expect(await prisma.template.count({ where: { ownerId: VISITOR.id } })).toBe(1)
    expect(await prisma.session.count({ where: { userId: VISITOR.id } })).toBe(1)
  })
})
