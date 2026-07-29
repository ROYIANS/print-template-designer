import 'dotenv/config'
import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module.js'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableShutdownHooks()
  const port = process.env.PORT ?? 3000
  await app.listen(port)
  console.log(`Application is running on: http://localhost:${port}`)
}

void bootstrap()
