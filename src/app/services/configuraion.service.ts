import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';

@Injectable()
export class ConfigurationService {

    private readonly filePath: string = "config.json";
    private configuration;
    private configStream;

    constructor(private http: Http) {
        this.configuration = null;
        this.configStream = this.http.get(this.filePath).map(res => res.json());
    }

    getConfiguration() {
        if (this.configuration) {
            return Observable.of(this.configuration);
        } else {
            this.configStream.subscribe(config => {
                this.configuration = this.checkLocalOrRemoteConfiguration(config);
            });
            return this.configStream;
        }
    }

    private checkLocalOrRemoteConfiguration(config: any) {
      if(config && config.hasOwnProperty("remoteUrl")) {
        this.configStream = this.http.get(config.remoteUrl).map(res => res.json());
        this.configStream.subscribe(remoteConfig => {
          this.configuration = remoteConfig;
        });
      } else {
        return config;
      }
    }

}
