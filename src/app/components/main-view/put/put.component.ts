import {Component, OnInit, Input, Inject, Output, EventEmitter} from '@angular/core';
import {FormGroup, FormControl, FormBuilder} from '@angular/forms';
import {DataPathUtils} from '../../../utils/dataPath.utils';
import {MultipartFormUtils} from '../../../utils/multipartForm.utils';
import { ToastrService } from 'ngx-toastr';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { RequestHeaders } from '../../../services/config.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'put-dialog',
  templateUrl: './put.component.html',
  styleUrls: ['./put.component.scss'],
  animations: [
    trigger('dialog', [
      transition('void => *', [
        style({ transform: 'scale3d(.3, .3, .3)' }),
        animate(100)
      ]),
      transition('* => void', [
        animate(100, style({ transform: 'scale3d(.0, .0, .0)' }))
      ])
    ])
  ]
})
export class PutComponent implements OnInit  {
  @Input() closable = true;

  @Input() visible: boolean;

  @Output() visibleChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output() stateChanged = new EventEmitter();

  @Input('pageData') pageData: any;

  @Input('rowData') rowData: any;

  loading: boolean = false;

  myForm: FormGroup = this._fb.group(this.buildFormFields());

  fields: Array<any> = [];

  methodData: any = {};

  workingRowData: any;

  constructor(@Inject('RequestsService') private requestsService,
              @Inject('DataPathUtils') private dataPathUtils,
              @Inject('MultipartFormUtils') private multipartFormUtils,
              @Inject('UrlUtils') private urlUtils,
              private toastrService: ToastrService,
              private _fb: FormBuilder) { }

  ngOnInit() {
    this.initForm();
  }

  ngOnChanges() {
    this.initForm();
  }

  private initForm() {
    try {
      this.methodData = this.pageData.methods.put;
      this.fields = this.pageData.methods.put.fields;
    } catch (e) {
      this.fields = [];
    }
    this.myForm = this._fb.group(this.buildFormFields());

    this.myForm.valueChanges.subscribe(() => this.updateWorkingRowData());
    this.updateWorkingRowData();
  }

  private buildFormFields() {
    const obj = {};
    if (!this.fields || !this.fields.length) {
      return obj;
    }
    for (const field of this.fields) {
      let value = this.dataPathUtils.getFieldValueInPath(field.name, field.dataPath, this.rowData)
      if (field.type === 'object') {
        value = JSON.stringify(value);
      }
      const fieldName = field.dataPath ? `${field.dataPath}.${field.name}` : field.name;
      obj[fieldName] = new FormControl(value === undefined ? '' : value);
    }
    return obj;
  }

  private updateWorkingRowData() {
    const fields = this.buildFields();
    this.workingRowData = this.dataPathUtils.extractModelFromFields(fields);
  }

  public submit(e: Event) {
    e.preventDefault();
    this.request(this.workingRowData);
  }

  get requestHeaders(): RequestHeaders {
    return this.methodData.requestHeaders || this.pageData.requestHeaders || {};
  }

  private request(data = {}) {
    this.loading = true;

    if (environment.logApiData) {
      console.log('Making put request with data', data);
    }

    if (this.multipartFormUtils.isMultipartForm(this.fields)) {
      data = this.multipartFormUtils.extractMultipartFormData(this.fields, this.myForm);
    }

    let actualMethod = this.requestsService.put.bind(this.requestsService);
    const actualMethodType = this.methodData.actualMethod;
    if (actualMethodType && this.requestsService[actualMethodType]) {
      actualMethod = this.requestsService[actualMethodType].bind(this.requestsService);
    }

    let putUrl = this.methodData.url;
    const dataPath = this.methodData.dataPath;

    const extraUrlData = {};
    this.fields.map((field) => {
      if (field.useInUrl) {
        extraUrlData[field.name] = data[field.name];
      }
    });

    putUrl = this.urlUtils.getParsedUrl(putUrl, Object.assign(this.rowData, extraUrlData), dataPath);

    this.fields.map((field) => {
      if (field.type === 'object' || field.type === 'json') {
        data[field.name] = JSON.parse(data[field.name]);
      }
    });

    actualMethod(putUrl, data, this.requestHeaders).subscribe(data => {
      this.loading = false;
      this.toastrService.success('Successfully updated item', 'Success');
      this.close(true);
    }, error => {
      this.loading = false;
      this.toastrService.error(error, 'Error');
    });
  }

  private buildFields() {
    const fields = [];
    for (const param in this.myForm.controls) {
      const paramArr = param.split('.');
      const dataPath = paramArr.slice(0, -1).join('.');
      let value = this.myForm.controls[param].value;
      if (typeof value === 'string' && value.length === 0) {
        value = null;
      }
      fields.push({
        name: paramArr[paramArr.length - 1],
        value,
        dataPath
      });
    }
    return fields;
  }

  close(shouldRefresh = false) {
    this.visible = false;
    this.visibleChange.emit(this.visible);
    this.stateChanged.emit({state: shouldRefresh ? 'afterChange' : null});
  }

}
