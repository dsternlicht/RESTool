import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

@Injectable()
export class RequestsService {

  constructor(public http: Http) {}

  public get(url, headers = null, queryParams = null) {
    return this.http.get(this.buildUrl(url, queryParams), { headers: this.buildHeaders(headers) })
      .map(this.extractData)
      .catch(this.handleError);
  }

  public post(url, data, headers = null) {
    return this.http.post(url, data, { headers: this.buildHeaders(headers) })
      .map(this.extractData)
      .catch(this.handleError);
  }

  public put(url, data, headers = null) {
    return this.http.put(url, data, { headers: this.buildHeaders(headers) })
      .map(this.extractData)
      .catch(this.handleError);
  }

  public delete(url, headers = null) {
    return this.http.delete(url, { headers: this.buildHeaders(headers) })
      .map(this.extractData)
      .catch(this.handleError);
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

    let urlWithParams = `${url}?`;
    const params = [];

    for (let param of queryParams) {
      if (param.name) {
        params.push(`${param.name}=${param.value || ''}`);
      }
    }

    return urlWithParams + params.join('&');
  }

  private handleError(error: Response | any) {
    let errMsg: string;

    if (error instanceof Response) {
      // const body = error.json();
      // const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${error}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }

    return Observable.throw(errMsg);
  }
}
