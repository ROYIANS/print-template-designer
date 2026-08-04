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
  Req,
  UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '../auth/auth.guard.js'
import type { AuthenticatedRequest } from '../auth/authenticated-request.js'
import {
  parseCreateTemplateBody,
  parseRestoreTemplateBody,
  parseUpdateTemplateBody,
} from './template-contract.js'
import { PositiveIntPipe } from './positive-int.pipe.js'
import { TemplateKeyPipe } from './template-key.pipe.js'
import { TemplatesService } from './templates.service.js'

@Controller('api/templates')
@UseGuards(AuthGuard)
export class TemplatesController {
  constructor(@Inject(TemplatesService) private readonly templates: TemplatesService) {}

  @Get()
  list(@Req() request: AuthenticatedRequest) {
    return this.templates.list(request.user.id)
  }

  @Post()
  create(@Req() request: AuthenticatedRequest, @Body() body: unknown) {
    return this.templates.create(request.user.id, parseCreateTemplateBody(body))
  }

  @Get('by-key/:key')
  getByKey(@Req() request: AuthenticatedRequest, @Param('key', TemplateKeyPipe) key: string) {
    return this.templates.getByKey(request.user.id, key)
  }

  @Get(':id')
  get(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe, PositiveIntPipe) id: number,
  ) {
    return this.templates.get(request.user.id, id)
  }

  @Put(':id')
  update(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe, PositiveIntPipe) id: number,
    @Body() body: unknown,
  ) {
    return this.templates.update(request.user.id, id, parseUpdateTemplateBody(body))
  }

  @Delete(':id')
  remove(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe, PositiveIntPipe) id: number,
  ) {
    return this.templates.remove(request.user.id, id)
  }

  @Get(':id/versions')
  listVersions(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe, PositiveIntPipe) id: number,
  ) {
    return this.templates.listVersions(request.user.id, id)
  }

  @Get(':id/versions/:version')
  getVersion(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe, PositiveIntPipe) id: number,
    @Param('version', ParseIntPipe, PositiveIntPipe) version: number,
  ) {
    return this.templates.getVersion(request.user.id, id, version)
  }

  @Post(':id/versions/:version/restore')
  restore(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe, PositiveIntPipe) id: number,
    @Param('version', ParseIntPipe, PositiveIntPipe) version: number,
    @Body() body: unknown,
  ) {
    return this.templates.restore(request.user.id, id, version, parseRestoreTemplateBody(body))
  }
}
