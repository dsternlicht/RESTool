export interface IConfig {
  remoteUrl: string
  name: string
  favicon: string // TODO: Add docs
  baseUrl: string
  errorMessageDataPath: string | string[]
  unauthorizedRedirectUrl: string
  pages: IConfigPage[]
}

export interface IConfigPage {
  name: string
  id: string
  description: string
  default: boolean // TODO: Should be deprecate
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

export type TConfigMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';

export interface IConfigMethod {
  url: string
  actualMethod: TConfigMethod
  requestHeaders: any
  queryParams: IConfigInputField[]
  fields: IConfigInputField[] | IConfigDisplayField[]
}

export type TConfigInputField = 'text' | 'long-text' | 'object' | 'encode' | 'integer' | 'number' | 'boolean' | 'email' | 'color' | 'select' | 'array' | 'file' | 'password' | 'note' | 'hidden';

export interface IConfigInputField {
  originalName: string
  name: string
  value: any
  type: TConfigInputField
  label: string
  dataPath: string // TODO: Add docs to array
  placeholder: string // TODO: Add docs
  readonly: boolean
  options: [string | { display: string, value: string }],
  optionSource: IConfigOptionSource
  arrayType: 'object' | 'text' | 'number' | 'integer'
  default: string // Should be deprecated
  required: boolean
  useInUrl: boolean
  accept: string
  urlReplaceOnly: boolean
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

export interface IConfigGetAllMethod extends IConfigMethod {
  dataPath: string
  queryParams: IConfigInputField[]
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

export interface IConfigPostMethod extends IConfigMethod {
  fields: IConfigInputField[]
}

export interface IConfigPutMethod extends IConfigMethod {
  fields: IConfigInputField[]
}

export interface IConfigDeleteMethod extends IConfigMethod {}

export interface IConfigCustomAction extends IConfigMethod {
  name: string
  icon: string // TODO: Add docs
  fields: IConfigInputField[]
}