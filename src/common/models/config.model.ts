export type ConfigFunction = (context?: any) => Promise<any> | any;

export interface IConfig {
  remoteUrl: string
  name: string
  favicon: string
  baseUrl: string
  errorMessageDataPath: string | string[]
  unauthorizedRedirectUrl: string
  requestHeaders: any
  pages: IConfigPage[]
  customStyles?: ICustomStyles
  customLabels?: ICustomLabels
}

export interface ICustomStyles {
  vars?: {
    appText?: string
    appBackground?: string
    navBackground?: string
    navText?: string
    navItemText?: string
    navItemHoverBackground?: string
    navItemActiveBackground?: string
    actionButtonBackground?: string
    actionButtonHoverBackground?: string
    actionButtonText?: string
  }
}

export interface ICustomLabels {
  buttons?: ICustomButtonLabels
  formTitles?: ICustomFormTitleLabels
  placeholders?: ICustomPlaceholderLabels
  tableColumnHeaders?: ICustomTableColumnHeaders
  pagination?: ICustomPaginationLabels
}

export interface ICustomButtonLabels {
  addItem?: string
  editItem?: string
  deleteItem?: string
  clearInput?: string
  closeForm?: string
  addArrayItem?: string
}

export interface ICustomFormTitleLabels {
  addItem: string
  editItem: string
}

export interface ICustomPlaceholderLabels {
  object?: string
  array?: string
  text?: string
  number?: string
  color?: string
  email?: string
  password?: string
  date?: string
  file?: string
}

export interface ICustomTableColumnHeaders {
  actions?: string
}

export interface ICustomPaginationLabels {
  itemsCount?: string // :currentCountFrom, :currentCountTo and :totalCount usable in string
  previousPageTitle?: string
  nextPageTitle?: string
}

export interface IConfigPage {
  name: string
  id: string
  description: string
  requestHeaders: any
  methods: IConfigMethods
  customActions: IConfigCustomAction[]
  customLabels: ICustomLabels
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

export type TConfigInputField = 'text' | 'long-text' | 'object' | 'encode' | 'integer' | 'number' | 'boolean' | 'email' | 'color' | 'select' | 'array' | 'file' | 'password' | 'note' | 'hidden' | 'date';

export interface IConfigInputField {
  originalName?: string
  name: string
  value: any
  type?: TConfigInputField
  label?: string
  dataPath?: string
  placeholder?: string
  readonly?: boolean
  options?: [string | { display: string, value: string }],
  optionSource?: IConfigOptionSource
  arrayType?: 'object' | 'text' | 'number' | 'integer'
  required?: boolean
  useInUrl?: boolean
  accept?: string
  urlReplaceOnly?: boolean
}

export interface IConfigOptionSource {
  url: string
  dataPath: string
  displayPath: string
  valuePath: string
  actualMethod: TConfigMethod
  sortBy: string
  requestHeaders: any
}

export type TConfigDisplayField = 'text' | 'url' | 'image' | 'colorbox' | 'boolean' | 'object';

export interface IConfigDisplayField {
  name: string
  type: TConfigDisplayField
  label: string
  dataPath: string
  filterable: boolean
  truncate: boolean
  url: string
  urlLabel?: string
}

export interface IConfigGetAllMethod extends IConfigMethod {
  dataPath: string
  queryParams: IConfigInputField[]
  display: {
    type: 'table' | 'cards',
    fields: IConfigDisplayField[] // Deprecated
  },
  sortBy: string
  fields: IConfigDisplayField[]
  dataTransform?: ConfigFunction
  pagination?: IConfigPagination
}

export interface IConfigGetSingleMethod extends IConfigMethod {
  dataPath: string
}

export interface IConfigPostMethod extends IConfigMethod {
  fields: IConfigInputField[]
}

export interface IConfigPutMethod extends IConfigMethod {
  fields: IConfigInputField[]
  includeOriginalFields: boolean
}

export interface IConfigDeleteMethod extends IConfigMethod { }

export interface IConfigCustomAction extends IConfigMethod {
  name: string
  icon: string
  fields: IConfigInputField[]
}

export type IConfigPagination = 
  IConfigQueryPagination | 
  IConfigJSONBodyPagination;

export type IConfigQueryPagination = _IConfigPagination<'query', IConfigQueryPaginationParams>;
export type IConfigJSONBodyPagination = _IConfigPagination<'json-body', IConfigJSONBodyPaginationParams>;

export const isQueryPagination = (obj: IConfigPagination): obj is IConfigQueryPagination => {
  return obj.source === 'query';
}

export const isJSONBodyPagination = (obj: IConfigPagination): obj is IConfigJSONBodyPagination => {
  return obj.source === 'json-body';
}

interface _IConfigPagination<src extends string, paginationParams> {
  source: src
  type: 'infinite-scroll' | 'buttons'
  params: paginationParams
  fields?: IConfigPaginationFields
}

export interface IConfigQueryPaginationParams {
  page: IQueryParamConfig
  limit?: IQueryParamConfig
  sortBy?: IQueryParamConfig
  descending?: IQueryParamConfig
}

export interface IConfigJSONBodyPaginationParams {
  nextPath?: string
  prevPath?: string
  countPath?: string
  limit?: IQueryParamConfig
}

export interface IConfigPaginationFields {
  page?: {
    dataPath: string,
    display?: boolean,
  },
  total?: {
    dataPath: string,
    display?: boolean,
  },
}

export interface IQueryParamConfig {
  name: string
  value?: string
  label?: string
  urlReplaceOnly?: boolean
}


export interface IQueryParam extends IQueryParamConfig {
  value: string
}
