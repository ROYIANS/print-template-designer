import { BadRequestException, Injectable, type PipeTransform } from '@nestjs/common'

const TEMPLATE_KEY_PATTERN = /^[A-Za-z0-9_-]{8,64}$/

@Injectable()
export class TemplateKeyPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!TEMPLATE_KEY_PATTERN.test(value)) {
      throw new BadRequestException('Template key is invalid')
    }
    return value
  }
}
