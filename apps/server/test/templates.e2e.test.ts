import type { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { DEFAULT_PAGE_CONFIG, type TemplateSchema } from '@ptd/core'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { AppModule } from '../src/app.module.js'
import { PrismaService } from '../src/prisma/prisma.service.js'

const initialContent: TemplateSchema = {
  _version: 1,
  pageConfig: {
    ...DEFAULT_PAGE_CONFIG,
    title: 'Initial canvas',
  },
  pages: [{ id: 'page-1', componentData: [] }],
  dataSource: [],
  dataSet: { invoiceNumber: 'INV-001' },
}

const updatedContent: TemplateSchema = {
  ...initialContent,
  pageConfig: {
    ...initialContent.pageConfig,
    title: 'Updated canvas',
  },
  dataSet: { invoiceNumber: 'INV-002' },
}

describe('template API', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({ imports: [AppModule] }).compile()
    app = testingModule.createNestApplication()
    await app.init()
    prisma = app.get(PrismaService)
  })

  beforeEach(async () => {
    await prisma.templateVersion.deleteMany()
    await prisma.template.deleteMany()
  })

  afterAll(async () => {
    await app.close()
  })

  it('reports health through the real Nest application', async () => {
    const response = await request(app.getHttpServer()).get('/healthz').expect(200)
    expect(response.body).toEqual({ status: 'ok' })
  })

  it('creates, lists and reads a template with its first snapshot', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/templates')
      .send({ title: '  Invoice  ', content: initialContent })
      .expect(201)

    expect(created.body).toMatchObject({
      title: 'Invoice',
      version: 1,
      content: initialContent,
    })
    expect(created.body.content).not.toEqual(expect.any(String))

    const list = await request(app.getHttpServer()).get('/api/templates').expect(200)
    expect(list.body).toHaveLength(1)
    expect(list.body[0]).toMatchObject({ id: created.body.id, title: 'Invoice', version: 1 })
    expect(list.body[0]).not.toHaveProperty('content')

    const current = await request(app.getHttpServer())
      .get(`/api/templates/${created.body.id}`)
      .expect(200)
    expect(current.body).toMatchObject({ id: created.body.id, content: initialContent })

    const versions = await request(app.getHttpServer())
      .get(`/api/templates/${created.body.id}/versions`)
      .expect(200)
    expect(versions.body).toEqual([expect.objectContaining({ version: 1, title: 'Invoice' })])
    expect(versions.body[0]).not.toHaveProperty('content')

    const firstVersion = await request(app.getHttpServer())
      .get(`/api/templates/${created.body.id}/versions/1`)
      .expect(200)
    expect(firstVersion.body).toMatchObject({
      templateId: created.body.id,
      version: 1,
      title: 'Invoice',
      content: initialContent,
    })
  })

  it('updates with optimistic concurrency and leaves stale writes atomic', async () => {
    const created = await createTemplate(app, 'Invoice', initialContent)

    const updated = await request(app.getHttpServer())
      .put(`/api/templates/${created.id}`)
      .send({ title: 'Updated invoice', content: updatedContent, expectedVersion: 1 })
      .expect(200)
    expect(updated.body).toMatchObject({
      title: 'Updated invoice',
      version: 2,
      content: updatedContent,
    })

    await request(app.getHttpServer())
      .put(`/api/templates/${created.id}`)
      .send({ title: 'Stale edit', content: initialContent, expectedVersion: 1 })
      .expect(409)

    const versions = await prisma.templateVersion.findMany({
      where: { templateId: created.id },
      orderBy: { version: 'asc' },
    })
    expect(versions.map((snapshot) => snapshot.version)).toEqual([1, 2])

    const current = await request(app.getHttpServer())
      .get(`/api/templates/${created.id}`)
      .expect(200)
    expect(current.body).toMatchObject({ title: 'Updated invoice', version: 2 })
  })

  it('allows exactly one concurrent update for the same expected version', async () => {
    const created = await createTemplate(app, 'Concurrent invoice', initialContent)

    const responses = await Promise.all([
      request(app.getHttpServer()).put(`/api/templates/${created.id}`).send({
        title: 'First concurrent edit',
        content: updatedContent,
        expectedVersion: 1,
      }),
      request(app.getHttpServer()).put(`/api/templates/${created.id}`).send({
        title: 'Second concurrent edit',
        content: initialContent,
        expectedVersion: 1,
      }),
    ])

    expect(responses.map((response) => response.status).sort()).toEqual([200, 409])
    expect(await prisma.templateVersion.count({ where: { templateId: created.id } })).toBe(2)

    const current = await prisma.template.findUniqueOrThrow({ where: { id: created.id } })
    expect(current.version).toBe(2)
  })

  it('restores an immutable snapshot as a new version', async () => {
    const created = await createTemplate(app, 'Original invoice', initialContent)
    await request(app.getHttpServer())
      .put(`/api/templates/${created.id}`)
      .send({ title: 'Changed invoice', content: updatedContent, expectedVersion: 1 })
      .expect(200)

    const restored = await request(app.getHttpServer())
      .post(`/api/templates/${created.id}/versions/1/restore`)
      .send({ expectedVersion: 2 })
      .expect(201)
    expect(restored.body).toMatchObject({
      title: 'Original invoice',
      version: 3,
      content: initialContent,
    })

    const history = await request(app.getHttpServer())
      .get(`/api/templates/${created.id}/versions`)
      .expect(200)
    expect(history.body.map((snapshot: { version: number }) => snapshot.version)).toEqual([3, 2, 1])

    const original = await request(app.getHttpServer())
      .get(`/api/templates/${created.id}/versions/1`)
      .expect(200)
    expect(original.body).toMatchObject({ title: 'Original invoice', content: initialContent })

    await request(app.getHttpServer())
      .post(`/api/templates/${created.id}/versions/2/restore`)
      .send({ expectedVersion: 2 })
      .expect(409)
    expect(await prisma.templateVersion.count({ where: { templateId: created.id } })).toBe(3)
  })

  it('deletes a template and cascades its snapshots', async () => {
    const created = await createTemplate(app, 'Disposable', initialContent)

    await request(app.getHttpServer()).delete(`/api/templates/${created.id}`).expect(200, {
      deleted: true,
    })
    await request(app.getHttpServer()).get(`/api/templates/${created.id}`).expect(404)
    await request(app.getHttpServer()).get(`/api/templates/${created.id}/versions`).expect(404)
    expect(await prisma.templateVersion.count({ where: { templateId: created.id } })).toBe(0)
  })

  it('rejects malformed request boundaries and route integers', async () => {
    await request(app.getHttpServer())
      .post('/api/templates')
      .send({ title: '   ', content: initialContent })
      .expect(400)
    await request(app.getHttpServer())
      .post('/api/templates')
      .send({
        title: 'Broken',
        content: { _version: 1, pageConfig: {}, pages: [], dataSource: [], dataSet: {} },
      })
      .expect(400)
    await request(app.getHttpServer()).get('/api/templates/not-an-id').expect(400)
    await request(app.getHttpServer()).get('/api/templates/0').expect(400)
    await request(app.getHttpServer()).get('/api/templates/2147483648').expect(400)

    const created = await createTemplate(app, 'Validation', initialContent)
    await request(app.getHttpServer())
      .put(`/api/templates/${created.id}`)
      .send({ title: 'Invalid', content: initialContent, expectedVersion: '1' })
      .expect(400)
    await request(app.getHttpServer())
      .post(`/api/templates/${created.id}/versions/1/restore`)
      .send({ expectedVersion: 0 })
      .expect(400)
    await request(app.getHttpServer())
      .get(`/api/templates/${created.id}/versions/not-a-version`)
      .expect(400)
    await request(app.getHttpServer()).get(`/api/templates/${created.id}/versions/-1`).expect(400)
  })

  it('returns not found for missing templates and snapshots', async () => {
    await request(app.getHttpServer()).get('/api/templates/404').expect(404)
    await request(app.getHttpServer()).delete('/api/templates/404').expect(404)

    const created = await createTemplate(app, 'No history', initialContent)
    await request(app.getHttpServer()).get(`/api/templates/${created.id}/versions/99`).expect(404)
    await request(app.getHttpServer())
      .post(`/api/templates/${created.id}/versions/99/restore`)
      .send({ expectedVersion: 1 })
      .expect(404)
  })
})

async function createTemplate(
  app: INestApplication,
  title: string,
  content: TemplateSchema,
): Promise<{ id: number }> {
  const response = await request(app.getHttpServer())
    .post('/api/templates')
    .send({ title, content })
    .expect(201)
  return { id: response.body.id as number }
}
