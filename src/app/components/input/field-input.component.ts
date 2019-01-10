import { Component, Input, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'field-input',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './field-input.component.html',
  styleUrls: ['./field-input.component.scss']
})
export class FieldInputComponent {
  @Input() field: any;

  @Input() form: FormGroup;

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

  public formatSelectOption(option: any){
    let result:any = {
      display: '',
      value: ''
    };

    if (typeof(option) === 'string') {
      result.display = option;
      result.value = option;
    } else {
      result.display = option.display;
      result.value = option.value;
    }

    return result;
  }
}
