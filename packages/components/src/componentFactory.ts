import type { ComponentSchema } from '@ptd/core'
import type { BaseComponent } from './base/base-component'
import { RoyBarCode } from './components/RoyBarCode'
import { RoyCircle } from './components/RoyCircle'
import { RoyComplexTable } from './components/RoyComplexTable'
import { RoyGroup } from './components/RoyGroup'
import { RoyImage } from './components/RoyImage'
import { RoyLine } from './components/RoyLine'
import { RoyQRCode } from './components/RoyQRCode'
import { RoyRect } from './components/RoyRect'
import { RoySimpleTable } from './components/RoySimpleTable'
import { RoySimpleText } from './components/RoySimpleText'
import { RoyStar } from './components/RoyStar'
import { RoyText } from './components/RoyText'

type ComponentConstructor = new (schema: ComponentSchema) => BaseComponent

const COMPONENT_CONSTRUCTORS: Readonly<
  Partial<Record<ComponentSchema['component'], ComponentConstructor>>
> = Object.freeze({
  RoySimpleText,
  RoyText,
  RoyLine,
  RoyRect,
  RoyCircle,
  RoyStar,
  RoyImage,
  RoyQRCode,
  RoyBarCode,
  RoyGroup,
  RoySimpleTable,
  RoyComplexTable,
})

/** One framework-free constructor registry shared by authoring, preview and output renderers. */
export function createComponentInstance(schema: ComponentSchema): BaseComponent | null {
  const Constructor = COMPONENT_CONSTRUCTORS[schema.component]
  return Constructor ? new Constructor(schema) : null
}
