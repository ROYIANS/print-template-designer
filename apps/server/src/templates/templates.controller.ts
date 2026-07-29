import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common'
import {
  parseCreateTemplateBody,
  parseRestoreTemplateBody,
  parseUpdateTemplateBody,
} from './template-contract.js'
import { PositiveIntPipe } from './positive-int.pipe.js'
import { TemplatesService } from './templates.service.js'

@Controller('api/templates')
export class TemplatesController {
  constructor(@Inject(TemplatesService) private readonly templates: TemplatesService) {}

  @Get()
  list() {
    return this.templates.list()
  }

  @Post()
  create(@Body() body: unknown) {
    return this.templates.create(parseCreateTemplateBody(body))
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe, PositiveIntPipe) id: number) {
    return this.templates.get(id)
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe, PositiveIntPipe) id: number, @Body() body: unknown) {
    return this.templates.update(id, parseUpdateTemplateBody(body))
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe, PositiveIntPipe) id: number) {
    return this.templates.remove(id)
  }

  @Get(':id/versions')
  listVersions(@Param('id', ParseIntPipe, PositiveIntPipe) id: number) {
    return this.templates.listVersions(id)
  }

  @Get(':id/versions/:version')
  getVersion(
    @Param('id', ParseIntPipe, PositiveIntPipe) id: number,
    @Param('version', ParseIntPipe, PositiveIntPipe) version: number,
  ) {
    return this.templates.getVersion(id, version)
  }

  @Post(':id/versions/:version/restore')
  restore(
    @Param('id', ParseIntPipe, PositiveIntPipe) id: number,
    @Param('version', ParseIntPipe, PositiveIntPipe) version: number,
    @Body() body: unknown,
  ) {
    return this.templates.restore(id, version, parseRestoreTemplateBody(body))
  }
}
