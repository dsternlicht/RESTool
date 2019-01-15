import {Component, OnInit, Input, Inject, Output, EventEmitter} from '@angular/core';
import {FormGroup, FormControl, FormBuilder} from '@angular/forms';
import {DataPathUtils} from '../../../utils/dataPath.utils';
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

  constructor(@Inject('RequestsService') private requestsService,
              @Inject('DataPathUtils') private dataPathUtils,
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
  }

  private buildFormFields() {
    const obj = {};
    if (!this.fields || !this.fields.length) {
      return obj;
    }
    for (const field of this.fields) {
      let value = this.dataPathUtils.getFieldValueInPath(field.name, field.dataPath, this.rowData)
      const fieldName = field.dataPath ? `${field.dataPath}.${field.name}` : field.name;
      if (field.type === 'array') {
        // value = value.map((i) => field.arrayType === 'object' ? JSON.stringify(i) : i);
        if (!value) {
          value = [];
        }
        value = JSON.stringify(value, null, '\t');
      }
      obj[fieldName] = new FormControl(value === undefined ? '' : value);
    }
    return obj;
  }

  public submit(e: Event) {
    e.preventDefault();
    const fields = this.buildFields();
    const data = this.dataPathUtils.extractModelFromFields(fields);
    this.request(data);
  }

  get requestHeaders(): RequestHeaders {
    return this.methodData.requestHeaders || this.pageData.requestHeaders || {};
  }

  private request(data = {}) {
    this.loading = true;

    if (environment.logApiData) {
      console.log('Making put request with data', data);
    }

    let actualMethod = this.requestsService.put.bind(this.requestsService);
    const actualMethodType = this.methodData.actualMethod;
    if (actualMethodType && this.requestsService[actualMethodType]) {
      actualMethod = this.requestsService[actualMethodType].bind(this.requestsService);
    }

    let putUrl = this.methodData.url;
    const dataPath = this.methodData.dataPath;
    putUrl = this.urlUtils.getParsedUrl(putUrl, this.rowData, dataPath);

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
      if (typeof value === 'string') {
        if (value.length === 0) {
          value = null;
        } else if (value.indexOf('[') === 0 && value.indexOf(']') === value.length - 1) {
          value = JSON.parse(value);
        }
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
