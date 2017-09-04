import {Injectable, Inject} from '@angular/core';

@Injectable()
export class UrlUtils {

    constructor(@Inject('DataPathUtils') private dataPathUtils) {
    }

    public urlIsClearOfParams(url) {
        if (url.indexOf(':') >= 0) {
            return false;
        }
        return url;
    }

    public extractIdFieldName(url) {
        const matcher = /http[s]?:\/\/.*\/:([a-zA-Z0-9_-]*)[\/|\?|#]?.*/;
        const extractArr = url.match(matcher);
        if (extractArr.length > 1) {
            return extractArr[1];
        }
        return null;
    }

    public getUrlWithReplacedId(url, fieldName, fieldValue) {
        return url.replace(':' + fieldName, fieldValue);
    }

    public getParsedUrl(url, data, dataPath) {
        const fieldName = this.extractIdFieldName(url);
        const fieldValue = this.dataPathUtils.getFieldValueInPath(fieldName, dataPath, data);
        if (fieldValue) {
            url = this.getUrlWithReplacedId(url, fieldName, fieldValue);
            return url;
        }
    }



}
