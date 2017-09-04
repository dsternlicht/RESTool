import {Component, Input, Inject, Output, EventEmitter, ViewChild } from '@angular/core';
import {FormGroup, FormControl, FormBuilder} from '@angular/forms';
import { ToastrService } from 'toastr-ng2';


@Component({
  selector: 'app-get',
  templateUrl: './get.component.html',
  styleUrls: ['./get.component.scss']
})
export class GetComponent {

  @Input('pageData') pageData;

  @Output() stateChanged = new EventEmitter();

  loading: boolean = false;

  data: Array<Object> = [];

  myForm: FormGroup = this._fb.group(this.getQueryParamsObj());

  activeGetRequest: any = {};

  fields: any = [];

  queryParams: any = [];

  constructor(@Inject('RequestsService') private requestsService,
              @Inject('DataPathUtils') private dataPathUtils,
              @Inject('UrlUtils') private urlUtils,
              private _fb: FormBuilder,
              private toastrService: ToastrService) {
  }

  ngOnChanges() {
    this.firstRequest();
  }

  onClickNew() {
    this.stateChanged.emit({
      state: 'post'
    });
  }

  onClickEdit(row) {
    this.stateChanged.emit({
      state: 'put',
      data: row
    });
  }

  public firstRequest() {
    if (!this.pageData) {
      return;
    }

    if (!this.pageData.methods || !this.pageData.methods.getAll) {
      setTimeout(() => this.toastrService.error('No GET method found in configuration file', 'Error'));
      return;
    }

    this.activeGetRequest = this.pageData.methods.getAll;
    this.fields = this.getDisplayFields(this.activeGetRequest);
    this.queryParams = this.activeGetRequest.queryParams || [];

    if (this.queryParams.length) {
      this.myForm = this._fb.group(this.getQueryParamsObj());
    }

    this.getRequest();
  }

  private getRequest(queryParams = null) {
    if (this.activeGetRequest) {
      this.loading = true;

      const requestHeaders = this.activeGetRequest.requestHeaders || this.pageData.requestHeaders || {};
      this.requestsService.get(this.activeGetRequest.url, requestHeaders, queryParams || this.queryParams).subscribe(data => {
        this.loading = false;
        this.data = this.dataPathUtils.extractDataFromResponse(data, this.activeGetRequest.dataPath);

        console.log('Got data after dataPath: ', this.data);
      }, error => {
        this.loading = false;
        this.toastrService.error(error, 'Error');
      });
    }
  }

  public getResults() {
    const queryParams = [];
    for (const param in this.myForm.controls) {
      const type = this.getQueryParamType(param);
      let value = this.myForm.controls[param].value || '';

      if (type === 'encode') {
        value = encodeURIComponent(value);
      }

      queryParams.push({
        name: param,
        value
      });
    }
    this.getRequest(queryParams);
  }

  private getQueryParamType(name = '') {
    if (!name || !this.queryParams || !this.queryParams.length) {
      return null;
    }

    for (const param of this.queryParams) {
      if (param.name === name) {
        return param.type || null;
      }
    }

    return null;
  }

  private getQueryParamsObj() {
    const obj = {};
    if (!this.queryParams) {
      return obj;
    }
    for (const param of this.queryParams) {
      obj[param.name] = new FormControl(param.value || '');
    }
    return obj;
  }

  private getDisplayFields(params) {
    if (!params.display || !params.display.fields || !params.display.fields.length) {
      setTimeout(() => this.toastrService.error('No display defined in configuration file', 'Error'));
      return [];
    }
    return params.display.fields;
  }

  protected showActions() {
    let methods = this.pageData && this.pageData.methods;
    if (methods && (methods.delete || methods.put)) {
      return true;
    }
    return false;
  }

  protected delete(row) {
    const reallyDelete = confirm('Are you sure you want to delete this item?');
    if (!reallyDelete) {
      return;
    }
    const deleteMethod = this.pageData.methods.delete;
    let deleteUrl = deleteMethod.url;
    if (!deleteUrl) {
      this.toastrService.error('No delete URL found', 'Error');
      return;
    }
    const dataPath = deleteMethod.dataPath;
    deleteUrl = this.urlUtils.getParsedUrl(deleteUrl, row, dataPath);

    console.log('Delete url', deleteUrl);

    let actualMethod = this.requestsService.delete.bind(this.requestsService);
    const actualMethodType = this.pageData.methods.delete.actualMethod;
    if (actualMethodType && this.requestsService[actualMethodType]) {
      actualMethod = this.requestsService[actualMethodType].bind(this.requestsService);
    }

    actualMethod(deleteUrl).subscribe(res => {
      this.toastrService.success('Successfully deleted item', 'Success');
      this.getResults();
    }, (error) => {
      this.toastrService.error(error, 'Error');
    });
  }

}
