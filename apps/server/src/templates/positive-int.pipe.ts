import { BadRequestException, Injectable, type PipeTransform } from '@nestjs/common'

const MAX_PRISMA_INT = 2_147_483_647

@Injectable()
export class PositiveIntPipe implements PipeTransform<number, number> {
  transform(value: number): number {
    if (!Number.isSafeInteger(value) || value < 1 || value > MAX_PRISMA_INT) {
      throw new BadRequestException(
        `Route parameters must be integers between 1 and ${MAX_PRISMA_INT}`,
      )
    }

    return value
  }
}
