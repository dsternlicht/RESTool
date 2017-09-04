import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { CommonModule } from '@angular/common';
import { AppComponent } from './app.component';
import { ToastrModule } from 'toastr-ng2';
import { ConfigurationService } from './services/configuraion.service';
import { RequestsService } from './services/requests.service';
import { MainViewModule } from './components/main-view/main-view.module';
import { NavigationComponent } from './components/navigation/navigation.component';
import { Routing } from './app.routes';
import {DataPathUtils} from './utils/dataPath.utils';
import {UrlUtils} from './utils/url.utils';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent,
    NavigationComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpModule,
    CommonModule,
    Routing,
    MainViewModule,
    ToastrModule.forRoot()
  ],
  providers: [
    { provide: 'ConfigurationService', useClass: ConfigurationService },
    { provide: 'RequestsService', useClass: RequestsService },
    { provide: 'DataPathUtils', useClass: DataPathUtils },
    { provide: 'UrlUtils', useClass: UrlUtils }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
