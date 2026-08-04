import { Inject, Injectable, OnModuleInit } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service.js'
import { AuthConfigService } from './auth-config.js'
import type { SessionUser } from './authenticated-request.js'

export const DEV_AUTH_USER = {
  id: 'ptd-local-developer',
  name: 'PTD Local Developer',
  email: 'local-developer@ptd.invalid',
  emailVerified: true,
  image: null,
} as const satisfies SessionUser

@Injectable()
export class DevAuthUserService implements OnModuleInit {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(AuthConfigService) private readonly authConfig: AuthConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    if (this.authConfig.authMode === 'dev-bypass') await this.getUser()
  }

  getUser(): Promise<SessionUser> {
    if (this.authConfig.authMode !== 'dev-bypass') {
      throw new Error('The local development identity is only available in dev auth bypass mode')
    }
    return this.ensureUser()
  }

  private async ensureUser(): Promise<SessionUser> {
    const user = await this.prisma.user.upsert({
      where: { id: DEV_AUTH_USER.id },
      update: {
        name: DEV_AUTH_USER.name,
        email: DEV_AUTH_USER.email,
        emailVerified: DEV_AUTH_USER.emailVerified,
        image: DEV_AUTH_USER.image,
      },
      create: DEV_AUTH_USER,
    })
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      image: user.image,
    }
  }
}
