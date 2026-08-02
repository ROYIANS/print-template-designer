import type { PageConfig } from './page-config'
import type { ComponentSchema } from './component-schema'
import type { DataSourceField, DataSet, TemplateDataDefinition } from './data-source'

export interface TemplatePage {
  id: string
  componentData: ComponentSchema[]
}

export interface TemplateSchema {
  _version: number
  pageConfig: PageConfig
  pages: TemplatePage[]
  /** Canonical Datasource v2 definition. */
  data?: TemplateDataDefinition
  /** @deprecated v1 compatibility input. Canonical writes omit this property. */
  dataSource?: DataSourceField[]
  /** @deprecated v1 compatibility input. Canonical writes omit this property. */
  dataSet?: DataSet
}
