import {Component, OnInit, Input, Inject, Output, EventEmitter} from '@angular/core';
import {FormGroup, FormControl, FormBuilder, FormArray} from '@angular/forms';
import {DataPathUtils} from "../../../utils/dataPath.utils";
import { ToastrService } from 'toastr-ng2';
import { trigger, state, style, animate, transition } from '@angular/animations';

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

  constructor(@Inject('RequestsService') private requestsService,
              @Inject('DataPathUtils') private dataPathUtils,
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
  }

  private buildFormFields(fields = []) {
    const obj = {};
    if (!fields || !fields.length) {
      return obj;
    }
    for (const field of fields) {
      const fieldName = field.dataPath ? `${field.dataPath}.${field.name}` : field.name;
      let value = field.default || '';
      if (field.type === 'array') {
        value = JSON.stringify(value || []);
      }
      obj[fieldName] = [value];
    }
    return obj;
  }

  public getFieldName(field) {
    if (!field.dataPath) {
      return field.name;
    }
    return `${field.dataPath}.${field.name}`;
  }

  public submit(e: Event) {
    e.preventDefault();
    const fields = this.buildFields();
    const data = this.dataPathUtils.extractModelFromFields(fields);
    this.request(data);
  }

  private request(data = {}) {
    this.loading = true;

    console.log('Making post request with data', data);

    const requestHeaders = this.methodData.requestHeaders || this.pageData.requestHeaders || {};

    let actualMethod = this.requestsService.post.bind(this.requestsService);
    const actualMethodType = this.methodData.actualMethod;
    if (actualMethodType && this.requestsService[actualMethodType]) {
      actualMethod = this.requestsService[actualMethodType].bind(this.requestsService);
    }

    actualMethod(this.methodData.url, data, requestHeaders).subscribe(data => {
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
      fields.push({
        name: paramArr[paramArr.length - 1],
        value: this.myForm.controls[param].value,
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
