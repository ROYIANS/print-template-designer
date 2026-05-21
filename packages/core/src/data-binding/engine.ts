import type { DataSourceField, DataSet } from '../types/data-source'
import { convertByType } from './type-converters'

const BINDING_PATTERN = /\[::[^[\]:]*::]/g

export class DataBindingEngine {
  private readonly dataSet: DataSet
  private readonly dataSource: DataSourceField[]

  constructor(dataSet: DataSet, dataSource: DataSourceField[]) {
    this.dataSet = dataSet
    this.dataSource = dataSource
  }

  resolve(template: string): string {
    return String(template).replace(BINDING_PATTERN, (match) => {
      const field = match.substring(3, match.length - 3)
      const value = this.dataSet[field]
      if (typeof value === 'function') {
        return String((value as () => unknown)())
      }
      return this.convertField(value, field)
    })
  }

  private convertField(value: unknown, field: string): string {
    const config = this.dataSource.find((item) => item.field === field)
    if (!config) return value !== null && value !== undefined ? String(value) : ''
    return convertByType(value, config.typeName)
  }
}
