import {Component, Inject} from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: []
})
export class AppComponent {
  name = '';

  pages = [];

  constructor(@Inject('ConfigurationService') private configurationService,
              private readonly titleService: Title) {
  }

  ngOnInit(){
    this.configurationService.getConfiguration().subscribe(config => {
      this.name = config.name || '';
      this.titleService.setTitle(this.name || 'RESTool');
      this.pages = config.pages || [];
    })
  }
}
