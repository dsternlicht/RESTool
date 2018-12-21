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
}
