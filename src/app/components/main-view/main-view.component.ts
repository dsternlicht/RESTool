import {Component, OnInit, Inject, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import {of} from 'rxjs';
import {GetComponent} from './get/get.component';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.scss']
})
export class MainViewComponent implements OnInit {

  @ViewChild(GetComponent) private getComponent: GetComponent;
  popupState: string = null;

  pageData: any = null;

  config: any = {};

  selectedRow: any = {};

  loading: boolean = false;

  constructor(@Inject('RequestsService') private requestsService,
              @Inject('ConfigurationService') private configurationService,
              @Inject('DataPathUtils') private dataPathUtils,
              @Inject('UrlUtils') private urlUtils,
              private route: ActivatedRoute,
              private router: Router,
              private toastrService: ToastrService) {
  }

  ngOnInit() {
    this.configurationService.getConfiguration().subscribe((config: any) => {
      if (!config || !config.pages) {
        return;
      }
      this.config = config;
      this.route.params.map((p: any) => p.pageId).subscribe(pageId => {
        this.getPageData(pageId);
      });
    });
  }

  private getPageData(pageId) {
    this.pageData = null;

    if (!pageId) {
      this.pageData = this.config.pages.filter(page => page.default)[0];

      if (!this.pageData) {
        this.pageData = this.config.pages[0];
      }

      this.router.navigate([this.pageData.id]);

      return;
    }
    else {
      this.pageData = this.config.pages.filter(page => page.id === pageId)[0];
    }

    if (!this.pageData) {
      this.toastrService.error(`No page found with id ${pageId}`, 'Error');
      return;
    }
  }

  private getRowData(defaultData = {}) {
    if (!this.pageData.methods.getSingle) {
      return of(defaultData);
    }

    const getMethod = this.pageData.methods.getSingle;
    let getUrl = getMethod.url;
    if (!getUrl) {
      return of(defaultData);
    }

    const paramsPath = getMethod.paramsPath;
    getUrl = this.urlUtils.getParsedUrl(getUrl, defaultData, paramsPath);

    if (environment.logApiData) {
      console.log('Get single url', getUrl);
    }

    let actualMethod = this.requestsService.get.bind(this.requestsService);
    const actualMethodType = this.pageData.methods.getSingle.actualMethod;
    if (actualMethodType && this.requestsService[actualMethodType]) {
      actualMethod = this.requestsService[actualMethodType].bind(this.requestsService);
    }

    let requestHeaders = getMethod.requestHeaders;
    if (!requestHeaders) {
      requestHeaders = this.pageData.requestHeaders;
    }

    return actualMethod(getUrl, requestHeaders)
      .pipe(map(res => this.dataPathUtils.extractDataFromResponse(res, getMethod.dataPath || '')));
  }

  public showPopup(e: any = {}) {
    const getMethod = this.pageData.methods.getSingle;
    this.popupState = e.state || null;
    switch (this.popupState) {
      case 'put':
        this.loading = true;
        this.getRowData(e.data || {}).subscribe((res) => {
          if (environment.logApiData) {
            console.log('Single item data', res);
          }
          this.selectedRow = res;
          this.loading = false;
        }, (e) => {
          console.error(e);
          this.toastrService.error(e, 'Error');
          this.selectedRow = e.data || {};
          this.loading = false;
        });
        break;
      case 'afterChange':
        this.getComponent.firstRequest();
        break;
      default:
        this.selectedRow = {};
    }
  }


}
