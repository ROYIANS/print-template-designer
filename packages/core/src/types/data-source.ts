export type DataFieldType =
  | 'String'
  | 'Array'
  | 'Money'
  | 'BigMoney'
  | 'BigNumber'
  | 'CurDateTime'
  | 'BigCurDate'

export interface DataSourceField {
  id: string
  title: string
  field: string
  typeName: DataFieldType
}

export type DataSet = Record<string, unknown>
