import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {AsyncSubject, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Injectable()
export class ConfigurationService {
  private readonly filePath: string = "config.json";
  private readonly configuration$ = new AsyncSubject<any>();

  constructor(private http: Http) {
    this.http.get(this.filePath).pipe(map(res => res.json())).subscribe(config => {
      if (config && config.hasOwnProperty("remoteUrl")) {
        this.http.get(config.remoteUrl).pipe(map(res => res.json())).subscribe(remoteConfig => {
          this.publishConfiguration(remoteConfig);
        });
      }
      else {
        this.publishConfiguration(config)
      }
    });
  }

  getConfiguration(): Observable<any> {
    return this.configuration$;
  }

  private publishConfiguration(config: any) {
    this.configuration$.next(config);
    this.configuration$.complete();
  }
}
