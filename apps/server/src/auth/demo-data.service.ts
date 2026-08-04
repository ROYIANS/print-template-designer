import { Inject, Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common'
import { Prisma } from '../generated/prisma/client.js'
import { PrismaService } from '../prisma/prisma.service.js'
import { toPrismaJson } from '../templates/template-json.js'
import { AuthConfigService } from './auth-config.js'
import { DEMO_TEMPLATE, DEMO_TEMPLATE_TITLE } from './demo-template.js'

const DAY_MS = 24 * 60 * 60 * 1000

export function demoResetDate(now: Date): string {
  return now.toISOString().slice(0, 10)
}

export function millisecondsUntilNextDemoReset(now: Date): number {
  const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
  return Math.max(1, next - now.getTime())
}

@Injectable()
export class DemoDataService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DemoDataService.name)
  private timer: ReturnType<typeof setTimeout> | undefined

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(AuthConfigService) private readonly authConfig: AuthConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    if (!this.authConfig.demoMode) return
    await this.resetAllVisitors(new Date())
    this.scheduleNextReset()
  }

  onModuleDestroy(): void {
    if (this.timer) clearTimeout(this.timer)
  }

  async ensureVisitor(user: { id: string; email: string }, now = new Date()): Promise<boolean> {
    if (!this.authConfig.demoMode || this.authConfig.isAdmin(user.email)) return false
    return this.resetVisitor(user.id, demoResetDate(now))
  }

  private async resetAllVisitors(now: Date): Promise<void> {
    const users = await this.prisma.user.findMany({ select: { id: true, email: true } })
    let resetCount = 0
    for (const user of users) {
      if (this.authConfig.isAdmin(user.email)) continue
      try {
        if (await this.resetVisitor(user.id, demoResetDate(now))) resetCount += 1
      } catch (error) {
        this.logResetFailure('Failed to restore demo data for one visitor', error)
      }
    }
    if (resetCount > 0) this.logger.log(`Restored demo data for ${resetCount} visitor account(s)`)
  }

  private async resetVisitor(userId: string, resetDate: string): Promise<boolean> {
    const content = toPrismaJson(DEMO_TEMPLATE)
    return this.prisma.$transaction(async (transaction) => {
      const claimed = await transaction.$queryRaw<Array<{ userId: string }>>(Prisma.sql`
        INSERT INTO "DemoUserState" ("userId", "resetDate", "updatedAt")
        VALUES (${userId}, ${resetDate}, NOW())
        ON CONFLICT ("userId") DO UPDATE
        SET "resetDate" = EXCLUDED."resetDate", "updatedAt" = NOW()
        WHERE "DemoUserState"."resetDate" <> EXCLUDED."resetDate"
        RETURNING "userId"
      `)
      if (claimed.length === 0) return false

      await transaction.template.deleteMany({ where: { ownerId: userId } })
      await transaction.template.create({
        data: {
          ownerId: userId,
          title: DEMO_TEMPLATE_TITLE,
          content,
          versions: {
            create: { version: 1, title: DEMO_TEMPLATE_TITLE, content },
          },
        },
      })
      return true
    })
  }

  private scheduleNextReset(): void {
    const delay = Math.min(millisecondsUntilNextDemoReset(new Date()), DAY_MS)
    this.timer = setTimeout(() => {
      void this.resetAllVisitors(new Date())
        .catch((error: unknown) => {
          this.logResetFailure('Failed to run the scheduled demo-data restore', error)
        })
        .finally(() => this.scheduleNextReset())
    }, delay)
    this.timer.unref()
  }

  private logResetFailure(message: string, error: unknown): void {
    this.logger.error(message, error instanceof Error ? error.stack : undefined)
  }
}
