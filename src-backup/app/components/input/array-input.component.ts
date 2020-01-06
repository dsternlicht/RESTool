import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { RequestHeaders } from '../../services/config.model';

@Component({
  selector: 'array-input',
  templateUrl: './array-input.component.html',
  styleUrls: ['./array-input.component.scss']
})
export class ArrayInputComponent implements OnInit {
  @Input() field: any;
  @Input() form: FormGroup;
  @Input() requestHeaders?: RequestHeaders;
  @Input() workingRowData: any;
  @Input() methodDataPath: any;

  arrayFields: any[];

  arrayForm: FormGroup;

  private nextFieldIndex = 0;
  private emptyItemName?: string;

  ngOnInit(): void {
    this.initForm();
    this.arrayForm.valueChanges.subscribe(() => this.updateArrayValue())

    if (!this.field.readonly) {
      this.arrayForm.valueChanges.subscribe(() => this.addEmptyItemIfNecessary());
    }
  }

  private initForm() {
    const formControls = {};
    const arrayFields = [];
    let index = 0;
    for (const itemValue of this.arrayValue) {
      const itemField = this.createField();
      arrayFields.push(itemField);
      const value = itemField.arrayType === 'object' ? JSON.stringify(itemValue) : itemValue;
      formControls[itemField.name] = new FormControl(value);
    }
    this.arrayForm = new FormGroup(formControls);
    this.arrayFields = arrayFields;
    if (!this.field.readonly) {
      this.addEmptyItem();
    }
  }

  private updateArrayValue() {
    const newValue = [];
    const formControls = this.arrayForm.controls;
    for (let i = 0; i <= this.nextFieldIndex; i++) {
      const name = this.getControlNameForIndex(i);
      if (formControls.hasOwnProperty(name)) {
        let value = formControls[name].value;
        if (typeof value === 'string' && value.length === 0) {
          value = null;
        }
        if (value != null) {
          newValue.push(value);
        }
      }
    }
    this.arrayValue = newValue;
  }

  private get arrayFieldName(): string {
    if (!this.field.dataPath) {
      return this.field.name;
    }
    return `${this.field.dataPath}.${this.field.name}`;
  }

  private get arrayValue(): any {
    return this.form.value[this.arrayFieldName] || [];
  }

  private set arrayValue(newValue: any) {
    this.form.controls[this.arrayFieldName].setValue(newValue);
  }

  private createField() {
    const name = this.getControlNameForIndex(this.nextFieldIndex++);
    return {
      ...this.field,
      arrayChild: true,
      name: name,
      dataPath: null,
      type: this.field.arrayType,
      default: null
    };
  }

  private getControlNameForIndex(index: number): string {
    return `${index}`;
  }

  deleteItem(field: any) {
    const index = this.arrayFields.indexOf(field);
    if (index >= 0) {
      this.arrayFields.splice(index, 1);
      this.arrayForm.removeControl(field.name);
    }
  }

  private addEmptyItemIfNecessary() {
    if (this.fieldHasValue(this.emptyItemName)) {
      this.addEmptyItem();
    }
  }

  fieldHasValue(name: string): boolean {
    const formControl = this.arrayForm.controls[name];
    if (!formControl) {
      return false;
    }
    return (typeof formControl.value === 'string' && formControl.value.length > 0) || formControl.value != null;
  }

  private addEmptyItem() {
    const field = this.createField();
    this.emptyItemName = field.name;
    this.arrayForm.addControl(field.name, new FormControl(null));
    this.arrayFields.push(field);
  }

  canDeleteItem(itemField: any): boolean {
    return !this.field.readonly && this.fieldHasValue(itemField.name);
  }
}
