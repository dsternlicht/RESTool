import { Injectable, Inject } from '@angular/core';

@Injectable()
export class UrlUtils {

  constructor(@Inject('DataPathUtils') private dataPathUtils) {
  }

  public urlIsClearOfParams(url): boolean {
    return this.extractIdFieldName(url) === null;
  }

  public extractIdFieldName(url) {
    const matcher = /(?:\/\/[^\/]+)?:([a-zA-Z_-][a-zA-Z0-9_-]*)[\/?#&]?.*/;
    const extractArr = url.match(matcher);
    if (extractArr && extractArr.length > 1) {
      return extractArr[1];
    }
    return null;
  }

  public getUrlWithReplacedId(url, fieldName, fieldValue) {
    return url.replace(':' + fieldName, fieldValue);
  }

  public getParsedUrl(url, data, dataPath) {
    let fieldName = this.extractIdFieldName(url);
    while (fieldName !== null) {
      let fieldValue = this.dataPathUtils.getFieldValueInPath(fieldName, dataPath, data);
      fieldValue = (fieldValue !== null) ? encodeURIComponent(fieldValue) : '';
      url = this.getUrlWithReplacedId(url, fieldName, fieldValue);
      fieldName = this.extractIdFieldName(url);
    }
    return url;
  }
}
