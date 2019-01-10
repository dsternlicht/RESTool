import { Component, Inject, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { RequestsService } from '../../services/requests.service';
import { OptionSource, RequestHeaders } from '../../services/config.model';
import { ToastrService } from 'ngx-toastr';

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
export class FieldInputComponent implements OnInit {
  @Input() field: any;

  @Input() form: FormGroup;

  @Input() requestHeaders?: RequestHeaders;

  combinedOptions: any[] = [];

  constructor(@Inject('RequestsService') private readonly requestsService: RequestsService,
              @Inject('DataPathUtils') private readonly dataPathUtils,
              private readonly toastrService: ToastrService) {
  }

  ngOnInit(): void {
    if (this.field.type === 'select') {
      this.combinedOptions = this.field.options || [];
      if (this.field.optionSource) {
        this.fetchOptionsFromSource(this.field.optionSource);
      }
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

  private fetchOptionsFromSource(optionSource: OptionSource) {
    const requestHeaders = optionSource.requestHeaders || this.requestHeaders || {};

    this.requestsService.get(optionSource.url, requestHeaders).subscribe(result => {
      const data = this.dataPathUtils.extractDataFromResponse(result, optionSource.dataPath);
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
