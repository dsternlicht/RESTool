import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';

@Injectable()
export class ConfigurationService {

    private configuration;
    private configStream = this.http.get('config.json').map(res => res.json());

    constructor(private http: Http) {
        this.configuration = null;
    }

    getConfiguration() {
        if (this.configuration) {
            return Observable.of(this.configuration);
        } else {
            this.configStream.subscribe(config => {
                this.configuration = config;
            });
            return this.configStream;
        }
    }


}
