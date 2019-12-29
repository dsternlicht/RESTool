import { IConfigQueryParam, TConfigMethod } from '../common/models/config.model';

export type ResponseType = 'json' | 'text' | 'boolean';

class HttpService {
  public baseUrl: string;
  public unauthorizedRedirectUrl: string;
  public errorMessageDataPath: string | string[];

  constructor(baseUrl: string = '', unauthorizedRedirectUrl: string = '', errorMessageDataPath: string = '') {
    this.baseUrl = baseUrl || '';
    this.unauthorizedRedirectUrl = unauthorizedRedirectUrl || '';
    this.errorMessageDataPath = errorMessageDataPath || '';
  }

  private buildUrl(url: string, queryParams: IConfigQueryParam[] = []) {
    if (!queryParams || !queryParams.length) {
      return url;
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
        params.push(`${param.name}=${param.value || ''}`);
      }
    }

    if (params.length) {
      const firstSeparator = url.indexOf('?') >= 0 ? '&' : '?';
      return outputUrl + firstSeparator + params.join('&');
    }

    return outputUrl;
  }

  private buildRequest(requestMethod: TConfigMethod, url: string, queryParams: IConfigQueryParam[] = [], body: any, headers: any = {}): { url: string, params: any } {
    const finalUrl: string = this.buildUrl(this.baseUrl + url, queryParams);
    const requestParams = {
      method: requestMethod,
      headers: {
        'content-type': 'application/json',
        ...headers
      },
      body
    };

    return {
      url: finalUrl,
      params: requestParams
    };
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

    throw new Error(`Response code: ${res.status}`);
  }

  public async get(origUrl: string, queryParams: IConfigQueryParam[] = [], headers: any = {}, responseType?: ResponseType) {
    const { url, params } = this.buildRequest('get', origUrl, queryParams, undefined, headers);
    return await this.makeRequest(url, params, responseType);
  }

  public async post(origUrl: string, queryParams: IConfigQueryParam[] = [], body: any, headers: any = {}, responseType?: ResponseType) {
    const { url, params } = this.buildRequest('post', origUrl, queryParams, body, headers);
    return await this.makeRequest(url, params, responseType);
  }

  public async put(origUrl: string, queryParams: IConfigQueryParam[] = [], body: any, headers: any = {}, responseType?: ResponseType) {
    const { url, params } = this.buildRequest('put', origUrl, queryParams, body, headers);
    return await this.makeRequest(url, params, responseType);
  }

  public async delete(origUrl: string, queryParams: IConfigQueryParam[] = [], headers: any = {}, responseType?: ResponseType) {
    const { url, params } = this.buildRequest('delete', origUrl, queryParams, undefined, headers);
    return await this.makeRequest(url, params, responseType);
  }

}

export default HttpService;