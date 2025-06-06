import { TConfigMethod, IQueryParam } from '../common/models/config.model';
import { dataHelpers } from '../helpers/data.helpers';
import { querystringHelpers } from "../helpers/querystring.helpers";

export type ResponseType = 'json' | 'text' | 'boolean' | 'status';

interface UnauthorizedHandler {
  onUnauthorizedRequest: (currentPath: string) => void;
}

export interface IFetchParams {
  origUrl: string
  method?: TConfigMethod
  headers?: any
  queryParams?: IQueryParam[]
  rawData?: any
  body?: any
  responseType?: ResponseType
}

class HttpService {
  public baseUrl: string;
  public errorMessageDataPath: string | string[];
  public unauthorizedRedirectUrl: string;
  public requestHeaders: any;
  private unauthorizedHandler?: UnauthorizedHandler;

  constructor(baseUrl: string = '', unauthorizedRedirectUrl: string = '', errorMessageDataPath: string = '') {
    this.baseUrl = baseUrl || '';
    this.errorMessageDataPath = errorMessageDataPath || '';
    this.unauthorizedRedirectUrl = unauthorizedRedirectUrl || '';
    this.requestHeaders = {}
  }

  setUnauthorizedHandler(handler: UnauthorizedHandler) {
    this.unauthorizedHandler = handler;
  }

  private urlIsAbsolute(url: string) {
    if (url.indexOf('http') === 0 || url.indexOf('https') === 0) {
      return true;
    }
    return false;
  }

  private replaceParamsInUrl(url: string, rawData?: any): string {
    if (!rawData || typeof rawData !== 'object') {
      return url;
    }

    let outputUrl = url;

    Object.keys(rawData).forEach((key) => {
      const urlParamName = `:${key}`;
      outputUrl = outputUrl.replace(urlParamName, rawData[key] as string);
    });

    return outputUrl;
  }

  private buildUrl(url: string, queryParams: IQueryParam[] = [], rawData?: any): string {
    if (!queryParams || !queryParams.length) {
      return this.replaceParamsInUrl(url, rawData);
    }

    let outputUrl = url;
    const params = [];

    for (let param of queryParams) {
      if (!param.name || typeof param.value === 'undefined') {
        continue;
      }

      // TODO: Add docs to "urlReplaceOnly"
      if (param.urlReplaceOnly) {
        const urlParamName = `:${param.name}`;
        outputUrl = outputUrl.replace(urlParamName, param.value as string);
      } else {
        params.push(querystringHelpers.encodeValue(param.name, param.value));
      }
    }

    if (params.length) {
      const firstSeparator = url.indexOf('?') >= 0 ? '&' : '?';
      return outputUrl + firstSeparator + params.join('&');
    }

    return outputUrl;
  }

  private buildRequest(params: IFetchParams): { url: string, params: any } {
    const reqUrl: string = this.urlIsAbsolute(params.origUrl) ? params.origUrl : this.baseUrl + params.origUrl;
    const finalUrl: string = this.buildUrl(reqUrl, params.queryParams, params.rawData);
    const requestParams = {
      method: params.method ? params.method.toUpperCase() : 'GET',
      headers: Object.assign({}, this.requestHeaders, params.headers || {}),
      body: params.method === 'post' || params.method === 'put' || params.method === 'patch' ? params.body : undefined,
      credentials: 'include' // Include cookies in the request
    };

    return {
      url: finalUrl,
      params: requestParams
    };
  }

  private async getErrorMessage(res: Response | any): Promise<string> {
    let errorMessage: string = '';

    try {
      const body = await res.json();

      for (const path of this.errorMessageDataPath) {
        const dataAtPath = dataHelpers.extractDataByDataPath(body, path);

        if (dataAtPath) {
          errorMessage = dataAtPath;
        }
      }
    } catch { } // TODO: proper handling of errors (^.^)

    return errorMessage && errorMessage.length ?
      errorMessage :
      `${res.status} - ${res.statusText || ''}`;
  }

  private async handleError(res: Response) {
    if (res.status === 401) {
      const currentPath = document.location.hash.substring(1); // Remove the # from the hash
      const basePath = currentPath.split('?')[0]; // Extract base path without query parameters
      this.unauthorizedHandler?.onUnauthorizedRequest(basePath);
      return;
    }

    throw new Error(await this.getErrorMessage(res));
  }

  private async makeRequest(url: string, params: any = {}, responseType: ResponseType = 'json') {
    const res: Response = await fetch(url, Object.assign({}, params, {}));

    if (res.ok) {
      switch (responseType) {
        case 'json':
          return await res.json();
        case 'text':
          return await res.text();
        case 'boolean':
          return true;
        default:
          return true;
      }
    }

    await this.handleError(res);
  }

  public async fetch({ method, origUrl, queryParams, rawData, body, headers, responseType }: IFetchParams) {
    const { url, params } = this.buildRequest({ method, origUrl, queryParams, rawData, body, headers });
    return await this.makeRequest(url, params, responseType);
  }

  public buildSearchUrl(url: string, query: string, queryParamAlias?: string): string {
    const searchUrlParams = new URLSearchParams();
    const searchQueryAlias = queryParamAlias || "q";
    searchUrlParams.append(searchQueryAlias, query);

    return query ? `${url}?${searchUrlParams.toString()}` : url;
  }
}

export default HttpService;
