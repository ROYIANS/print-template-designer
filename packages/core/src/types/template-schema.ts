import type { PageConfig } from './page-config'
import type { ComponentSchema } from './component-schema'
import type { DataSourceField, DataSet } from './data-source'

export interface TemplatePage {
  id: string
  componentData: ComponentSchema[]
}

export interface TemplateSchema {
  _version: number
  pageConfig: PageConfig
  pages: TemplatePage[]
  dataSource: DataSourceField[]
  dataSet: DataSet
}
