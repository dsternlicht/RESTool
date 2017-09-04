import {Component, OnInit, Inject, ViewChild} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {ToastrService} from "toastr-ng2";
import {Observable} from "rxjs/Rx";
import {GetComponent} from "./get/get.component";
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
      return Observable.of(defaultData);
    }

    const getMethod = this.pageData.methods.getSingle;
    let getUrl = getMethod.url;
    if (!getUrl) {
      return Observable.of(defaultData);
    }

    const dataPath = getMethod.dataPath;
    getUrl = this.urlUtils.getParsedUrl(getUrl, defaultData, dataPath);

    console.log('Get single url', getUrl);

    let actualMethod = this.requestsService.get.bind(this.requestsService);
    const actualMethodType = this.pageData.methods.getSingle.actualMethod;
    if (actualMethodType && this.requestsService[actualMethodType]) {
      actualMethod = this.requestsService[actualMethodType].bind(this.requestsService);
    }

    return actualMethod(getUrl);
  }

  public showPopup(e: any = {}) {
    this.popupState = e.state || null;
    switch (this.popupState) {
      case 'put':
        this.getRowData(e.data || {}).subscribe((res) => {
          console.log('Single item data', res);
          this.selectedRow = res;
        }, (e) => {
          console.error(e);
          this.toastrService.error(e, 'Error');
          this.selectedRow = e.data || {};
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
