import { describe, expect, it, vi } from 'vitest'
import { getPageDimensions } from '@ptd/core'
import type { PrismaService } from '../src/prisma/prisma.service.js'
import type { AuthConfigService } from '../src/auth/auth-config.js'
import { DEMO_TEMPLATE } from '../src/auth/demo-template.js'
import {
  DemoDataService,
  demoResetDate,
  millisecondsUntilNextDemoReset,
} from '../src/auth/demo-data.service.js'

function serviceFixture(claimed: boolean, admin = false) {
  const transaction = {
    $queryRaw: vi.fn().mockResolvedValue(claimed ? [{ userId: 'visitor-1' }] : []),
    template: {
      deleteMany: vi.fn().mockResolvedValue({ count: 2 }),
      create: vi.fn().mockResolvedValue({ id: 3 }),
    },
  }
  const prisma = {
    $transaction: vi.fn(async (operation: (value: typeof transaction) => Promise<boolean>) =>
      operation(transaction),
    ),
  } as unknown as PrismaService
  const authConfig = {
    demoMode: true,
    isAdmin: vi.fn().mockReturnValue(admin),
  } as unknown as AuthConfigService
  return { service: new DemoDataService(prisma, authConfig), transaction, prisma }
}

describe('demo data lifecycle', () => {
  it('keeps the example content inside its explicit A4 portrait paper', () => {
    expect(DEMO_TEMPLATE.pageConfig).toMatchObject({
      pageSize: 'A4',
      pageDirection: 'p',
      pageLayout: 'fixed',
      pageWidth: 210,
      pageHeight: 297,
      pageCurHeight: 297,
    })
    const { width: pageWidth, height: pageHeight } = getPageDimensions(DEMO_TEMPLATE.pageConfig)
    for (const item of DEMO_TEMPLATE.pages[0]?.componentData ?? []) {
      expect((item.style.left ?? 0) + (item.style.width ?? 0), item.id).toBeLessThanOrEqual(
        pageWidth,
      )
      expect((item.style.top ?? 0) + (item.style.height ?? 0), item.id).toBeLessThanOrEqual(
        pageHeight,
      )
    }
  })

  it('uses UTC calendar days and schedules the next UTC midnight', () => {
    const now = new Date('2026-08-04T23:59:58.500Z')
    expect(demoResetDate(now)).toBe('2026-08-04')
    expect(millisecondsUntilNextDemoReset(now)).toBe(1_500)
  })

  it('replaces visitor templates only after claiming the daily reset', async () => {
    const { service, transaction } = serviceFixture(true)

    await expect(
      service.ensureVisitor(
        { id: 'visitor-1', email: 'visitor@example.com' },
        new Date('2026-08-04T12:00:00Z'),
      ),
    ).resolves.toBe(true)
    expect(transaction.template.deleteMany).toHaveBeenCalledWith({
      where: { ownerId: 'visitor-1' },
    })
    expect(transaction.template.create).toHaveBeenCalledOnce()
  })

  it('does not rewrite a visitor twice on the same reset date', async () => {
    const { service, transaction } = serviceFixture(false)
    await expect(
      service.ensureVisitor({ id: 'visitor-1', email: 'visitor@example.com' }),
    ).resolves.toBe(false)
    expect(transaction.template.deleteMany).not.toHaveBeenCalled()
    expect(transaction.template.create).not.toHaveBeenCalled()
  })

  it('never enters the reset transaction for an administrator', async () => {
    const { service, prisma } = serviceFixture(true, true)
    await expect(
      service.ensureVisitor({ id: 'admin-1', email: 'admin@example.com' }),
    ).resolves.toBe(false)
    expect(prisma.$transaction).not.toHaveBeenCalled()
  })
})
