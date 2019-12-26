export interface IConfig {
  remoteUrl: string
  name: string
  baseUrl: string
  errorMessageDataPath: string | string[]
  unauthorizedRedirectUrl: string
  pages: IConfigPage[]
}

export interface IConfigPage {
  name: string
  id: string
  description: string
  default: boolean
  requestHeaders: any
  methods: IConfigMethods
  customActions: IConfigCustomAction[]
}

export interface IConfigMethods {
  getAll: IConfigGetAllMethod
  getSingle: IConfigGetSingleMethod
  post: IConfigPostMethod
  put: IConfigPutMethod
  delete: IConfigDeleteMethod
}

export type TConfigMethod = 'get' | 'post' | 'put' | 'delete';

export interface IConfigMethod {
  url: string
  actualMethod: TConfigMethod
  requestHeaders: any
  queryParams: IConfigQueryParam[]
  fields: IConfigInputField[] | IConfigDisplayField[]
}

export type TConfigInputField = 'text' | 'long-text' | 'object' | 'encode' | 'integer' | 'number' | 'boolean' | 'email' | 'color' | 'select' | 'array' | 'file' | 'password' | 'note' | 'hidden';

export interface IConfigInputField {
  name: string
  type: TConfigInputField
  label: string
  dataPath: string
  readonly: boolean
  options: [string | { display: string, value: string }],
  optionSource: IConfigOptionSource
  arrayType: 'object' | 'string'
  default: string
  required: boolean
  useInUrl: boolean
  accept: string
}

export interface IConfigOptionSource {
  url: string
  dataPath: string
  displayPath: string
  valuePath: string
  sortBy: string
}

export type TConfigDisplayField = 'text' | 'url' | 'image' | 'colorbox' | 'boolean';

export interface IConfigDisplayField {
  name: string
  type: TConfigDisplayField
  label: string
  dataPath: string
  filterable: boolean
  truncate: boolean
}

export interface IConfigQueryParam {
  type: TConfigInputField
  name: string
  value: string
  label: string
  urlReplaceOnly: boolean
}

export interface IConfigGetAllMethod extends IConfigMethod {
  dataPath: string
  queryParams: IConfigQueryParam[]
  display: {
    type: 'table' | 'cards',
    fields: IConfigDisplayField[] // Should be deprecated
  },
  sortBy: string
  fields: IConfigDisplayField[]
}

export interface IConfigGetSingleMethod extends IConfigMethod {
  dataPath: string
}

export interface IConfigPostMethod extends IConfigMethod {}

export interface IConfigPutMethod extends IConfigMethod {}

export interface IConfigDeleteMethod extends IConfigMethod {}

export interface IConfigCustomAction extends IConfigMethod {}