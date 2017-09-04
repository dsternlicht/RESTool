import {Component, Inject} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: []
})
export class AppComponent {
  name = '';

  pages = [];

  constructor(@Inject('ConfigurationService') private configurationService) {
  }

  ngOnInit(){
    this.configurationService.getConfiguration().subscribe(config => {
      this.name = config.name || '';
      this.pages = config.pages || [];
    })
  }
}
