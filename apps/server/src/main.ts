import 'dotenv/config'
import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { toNodeHandler } from 'better-auth/node'
import express from 'express'
import { AppModule } from './app.module.js'
import { createAuth, setAuth } from './auth/auth.js'
import { AuthConfigService, loopbackListenHost } from './auth/auth-config.js'
import { PrismaService } from './prisma/prisma.service.js'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false })
  const expressApp = app.getHttpAdapter().getInstance() as express.Express
  if (process.env.PTD_TRUST_PROXY === 'true') expressApp.set('trust proxy', 1)

  const authConfig = app.get(AuthConfigService).value
  if (authConfig.authMode === 'github') {
    const auth = createAuth(app.get(PrismaService), authConfig)
    setAuth(auth)
    expressApp.all('/api/auth/*splat', toNodeHandler(auth))
  }
  expressApp.use(express.json())

  app.enableShutdownHooks()
  const port = process.env.PORT ?? 3000
  if (authConfig.authMode === 'dev-bypass') {
    await app.listen(port, loopbackListenHost(authConfig.baseUrl))
  } else {
    await app.listen(port)
  }
  console.log(`Application is running on: ${authConfig.baseUrl}`)
}

void bootstrap()
