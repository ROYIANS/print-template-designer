import type { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { DEFAULT_PAGE_CONFIG, type TemplateSchema } from '@ptd/core'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { AppModule } from '../src/app.module.js'
import { DEV_AUTH_USER } from '../src/auth/dev-auth-user.service.js'
import { PrismaService } from '../src/prisma/prisma.service.js'

const environmentKeys = [
  'NODE_ENV',
  'PTD_DEV_AUTH_BYPASS',
  'BETTER_AUTH_URL',
  'PTD_WEB_ORIGIN',
  'BETTER_AUTH_SECRET',
  'PTD_ALLOWED_EMAILS',
  'GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET',
] as const

const originalEnvironment = new Map(environmentKeys.map((key) => [key, process.env[key]]))

const content: TemplateSchema = {
  _version: 1,
  pageConfig: { ...DEFAULT_PAGE_CONFIG, title: 'Dev auth canvas' },
  pages: [{ id: 'page-1', componentData: [] }],
  dataSource: [],
  dataSet: {},
}

describe('development auth bypass', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    process.env.NODE_ENV = 'development'
    process.env.PTD_DEV_AUTH_BYPASS = 'true'
    process.env.BETTER_AUTH_URL = 'http://127.0.0.1:3000'
    process.env.PTD_WEB_ORIGIN = 'http://[::1]:5173'
    delete process.env.BETTER_AUTH_SECRET
    delete process.env.PTD_ALLOWED_EMAILS
    delete process.env.GITHUB_CLIENT_ID
    delete process.env.GITHUB_CLIENT_SECRET

    const testingModule = await Test.createTestingModule({ imports: [AppModule] }).compile()
    app = testingModule.createNestApplication()
    await app.init()
    prisma = app.get(PrismaService)
    await prisma.template.deleteMany({ where: { ownerId: DEV_AUTH_USER.id } })
  })

  afterAll(async () => {
    if (prisma) await prisma.user.deleteMany({ where: { id: DEV_AUTH_USER.id } })
    if (app) await app.close()
    for (const [key, value] of originalEnvironment) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
  })

  it('injects one stable DB-backed identity and ignores browser-supplied identity headers', async () => {
    const firstAccount = await request(app.getHttpServer())
      .get('/api/account/me')
      .set('x-user-id', 'attacker-controlled')
      .expect(200)
    const secondAccount = await request(app.getHttpServer()).get('/api/account/me').expect(200)

    expect(firstAccount.body).toEqual({ ...DEV_AUTH_USER, authMode: 'dev-bypass' })
    expect(secondAccount.body).toEqual(firstAccount.body)
    expect(await prisma.user.count({ where: { id: DEV_AUTH_USER.id } })).toBe(1)

    const created = await request(app.getHttpServer())
      .post('/api/templates')
      .set('x-user-id', 'attacker-controlled')
      .send({ title: 'Local development template', content })
      .expect(201)
    const stored = await prisma.template.findUniqueOrThrow({
      where: { id: created.body.id as number },
    })
    expect(stored.ownerId).toBe(DEV_AUTH_USER.id)
  })
})
