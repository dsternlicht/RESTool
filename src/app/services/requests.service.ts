import { Inject, Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import { ConfigurationService } from './configuraion.service';
import { DataPathUtils } from '../utils/dataPath.utils';

@Injectable()
export class RequestsService {
  private errorMessageDataPaths: string[] = [];
  private unauthorizedRedirectUrl: string;

  constructor(public http: Http,
              @Inject('DataPathUtils') private readonly dataPathUtils: DataPathUtils,
              @Inject('ConfigurationService') configurationService: ConfigurationService) {
    configurationService.getConfiguration().subscribe(configuration => {
      if (configuration.errorMessageDataPath) {
        if (Array.isArray(configuration.errorMessageDataPath)) {
          this.errorMessageDataPaths = configuration.errorMessageDataPath
        } else {
          this.errorMessageDataPaths = [configuration.errorMessageDataPath];
        }
      }

      this.unauthorizedRedirectUrl = configuration.unauthorizedRedirectUrl;
    });
  }

  public get(url, headers = null, queryParams = null) {
    return this.http.get(this.buildUrl(url, queryParams), { headers: this.buildHeaders(headers) })
      .map(this.extractData)
      .catch(error => this.handleError(error));
  }

  public post(url, data, headers = null) {
    return this.http.post(url, data, { headers: this.buildHeaders(headers) })
      .map(this.extractData)
      .catch(error => this.handleError(error));
  }

  public put(url, data, headers = null) {
    return this.http.put(url, data, { headers: this.buildHeaders(headers) })
      .map(this.extractData)
      .catch(error => this.handleError(error));
  }

  public delete(url, headers = null) {
    return this.http.delete(url, { headers: this.buildHeaders(headers) })
      .map(this.extractData)
      .catch(error => this.handleError(error));
  }

  private buildHeaders(heads) {
    let headers = new Headers();

    if (heads) {
      for (const head in heads) {
        if (heads.hasOwnProperty(head)) {
          headers.append(head, heads[head]);
        }
      }
    }

    return headers;
  }

  private extractData(res: Response) {
    try {
      let body = res.json();
      return body || { };
    } catch (e) {
      return res;
    }
  }

  private buildUrl(url, queryParams) {
    if (!queryParams || !queryParams.length) {
      return url;
    }

    let outputUrl = url;
    const params = [];

    for (let param of queryParams) {
      if (param.name) {
        let urlParamName = `:${param.name}`;
        if (outputUrl.indexOf(urlParamName) >= 0){
          outputUrl = outputUrl.replace(urlParamName, param.value);
        } else if (!param.urlReplaceOnly) {
          params.push(`${param.name}=${param.value || ''}`);
        }
      }
    }

    if (params.length) {
      const firstSeparator = url.indexOf('?') >= 0 ? '&' : '?';
      return outputUrl + firstSeparator + params.join('&');
    }
    return outputUrl;
  }

  private handleError(error: Response | any) {
    if (error instanceof Response && error.status === 401 && this.unauthorizedRedirectUrl) {
      const loginUrl = this.buildUrl(this.unauthorizedRedirectUrl, [
        {name: 'returnUrl', value: encodeURIComponent(document.location.href), urlReplaceOnly: true}
      ]);
      document.location.href = loginUrl;
      return;
    }

    const errMsg = this.getErrorMessage(error);
    console.error(errMsg, error);
    return Observable.throw(errMsg);
  }

  private getErrorMessage(error: Response | any): string {
    if (error instanceof Response) {
      try {
        const body = error.json();
        for (const path of this.errorMessageDataPaths) {
          const dataAtPath = this.dataPathUtils.extractDataFromResponse(body, path);
          if (dataAtPath) {
            return dataAtPath;
          }
        }
      } catch {}
      return `${error.status} - ${error.statusText || ''} ${error}`;
    }
    return error.message ? error.message : error.toString();
  }
}
