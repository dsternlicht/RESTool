import {Component, OnInit, Input, Inject, Output, EventEmitter} from '@angular/core';
import {FormGroup, FormControl, FormBuilder, FormArray} from '@angular/forms';
import {DataPathUtils} from '../../../utils/dataPath.utils';
import {MultipartFormUtils} from '../../../utils/multipartForm.utils';
import { ToastrService } from 'ngx-toastr';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { RequestHeaders } from '../../../services/config.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'post-dialog',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss'],
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
export class PostComponent implements OnInit {

  @Output() stateChanged = new EventEmitter();

  @Input() closable = true;

  @Input() visible: boolean;

  @Output() visibleChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Input('pageData') pageData: any;

  loading: boolean = false;

  fields: Array<any> = [];

  myForm: FormGroup = this._fb.group(this.buildFormFields(this.fields));

  methodData: any = {};

  workingRowData: any;

  constructor(@Inject('RequestsService') private requestsService,
              @Inject('DataPathUtils') private dataPathUtils,
              @Inject('MultipartFormUtils') private multipartFormUtils,
              private _fb: FormBuilder,
              private toastrService: ToastrService) { }

  ngOnInit() {
    this.initForm();
  }

  ngOnChanges() {
    this.initForm();
  }

  private initForm() {
    try {
      this.methodData = this.pageData.methods.post;
      this.fields = this.pageData.methods.post.fields;
    } catch (e) {
      this.fields = [];
    }

    this.myForm = this._fb.group(this.buildFormFields(this.fields));
    this.myForm.valueChanges.subscribe(() => this.updateWorkingRowData());
    this.updateWorkingRowData();
  }

  private buildFormFields(fields = []) {
    const obj = {};
    if (!fields || !fields.length) {
      return obj;
    }
    for (const field of fields) {
      const fieldName = field.dataPath ? `${field.dataPath}.${field.name}` : field.name;
      const value = field.default === undefined ? '' : field.default;
      obj[fieldName] = [value];
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
      console.log('Making post request with data', data);
    }

    if (this.multipartFormUtils.isMultipartForm(this.fields)) {
      data = this.multipartFormUtils.extractMultipartFormData(this.fields, this.myForm);
    }

    let actualMethod = this.requestsService.post.bind(this.requestsService);
    const actualMethodType = this.methodData.actualMethod;
    if (actualMethodType && this.requestsService[actualMethodType]) {
      actualMethod = this.requestsService[actualMethodType].bind(this.requestsService);
    }

    this.fields.map((field) => {
      if (field.type === 'object' || field.type === 'json') {
        data[field.name] = JSON.parse(data[field.name]);
      }
    });

    actualMethod(this.methodData.url, data, this.requestHeaders).subscribe(data => {
      this.loading = false;
      this.toastrService.success('Successfully created an item', 'Success');
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
      var value = this.myForm.controls[param].value;
      if (typeof value === 'string' && value.length ===0) {
        value = null;
      }
      fields.push({
        name: paramArr[paramArr.length - 1],
        value: value,
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
