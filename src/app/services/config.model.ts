export type SortPaths = string | string[];

export interface RequestHeaders {
  [key: string]: string;
}

export interface OptionSource {
  url: string;
  dataPath: string;
  valuePath: string;
  displayPath: string;
  requestHeaders?: RequestHeaders
  sortBy?: SortPaths
}
