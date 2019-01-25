import { Component, Inject, Input, OnChanges, OnInit, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { RequestsService } from '../../services/requests.service';
import { OptionSource, RequestHeaders } from '../../services/config.model';
import { ToastrService } from 'ngx-toastr';
import { UrlUtils } from '../../utils/url.utils';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { orderBy } from 'natural-orderby';

export interface SelectOption {
  display: string;
  value: string;
}

@Component({
  selector: 'field-input',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './field-input.component.html',
  styleUrls: ['./field-input.component.scss']
})
export class FieldInputComponent implements OnInit, OnChanges {
  @Input() field: any;

  @Input() form: FormGroup;

  @Input() requestHeaders?: RequestHeaders;

  @Input() workingRowData: any;
  private workingRowData$ = new BehaviorSubject<any>({});

  @Input() methodDataPath: any;

  combinedOptions: any[] = [];

  constructor(@Inject('RequestsService') private readonly requestsService: RequestsService,
              @Inject('DataPathUtils') private readonly dataPathUtils,
              @Inject('UrlUtils') private readonly urlUtils: UrlUtils,
              private readonly toastrService: ToastrService) {
  }

  ngOnInit(): void {
    this.workingRowData$.next(this.workingRowData);

    switch (this.field.type) {
      case 'select':
        this.combinedOptions = this.field.options || [];
        if (this.field.optionSource) {
          const url = this.field.optionSource.url;
          if (this.urlUtils.urlIsClearOfParams(url)) {
            this.fetchOptionsFromSource(url);
          } else {
            this.workingRowData$.pipe(
              map(rowData => this.urlUtils.getParsedUrl(url, rowData, this.methodDataPath)),
              distinctUntilChanged())
              .subscribe(resolvedUrl => this.fetchOptionsFromSource(resolvedUrl));
          }
        }
        break;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.hasOwnProperty('workingRowData')) {
      this.workingRowData$.next(changes.workingRowData.currentValue);
    }
  }

  get fieldName(): string {
    if (!this.field.dataPath) {
      return this.field.name;
    }
    return `${this.field.dataPath}.${this.field.name}`;
  }

  get labelVisible(): boolean {
    return this.field.type !== 'hidden' && this.field.type !== 'boolean';
  }

  get label(): string {
    return this.field.label || this.field.name;
  }

  get placeholder(): string {
    if (this.field.readonly) {
      return '';
    }
    return this.label;
  }

  public formatSelectOption(option: any): SelectOption {
    let result: any = {
      display: '',
      value: ''
    };

    if (typeof (option) === 'string') {
      result.display = option;
      result.value = option;
    } else {
      result.display = option.display;
      result.value = option.value;
    }

    return result;
  }

  private fetchOptionsFromSource(resolvedUrl: string) {
    const optionSource: OptionSource = this.field.optionSource;
    const requestHeaders = optionSource.requestHeaders || this.requestHeaders || {};

    this.requestsService.get(resolvedUrl, requestHeaders).subscribe(result => {
      let data = this.dataPathUtils.extractDataFromResponse(result, optionSource.dataPath);
      let sortBy = optionSource.sortBy;
      if (sortBy) {
        data = orderBy(data, sortBy);
      }
      const rows: SelectOption[] = data.map(row => ({
        display: this.dataPathUtils.extractDataFromResponse(row, null, optionSource.displayPath),
        value: this.dataPathUtils.extractDataFromResponse(row, null, optionSource.valuePath)
      }));

      this.combinedOptions = [
        ...(this.field.options || []),
        ...rows
      ];
    }, error => this.toastrService.error(error, `Error loading options for ${this.label}`));
  }
}
