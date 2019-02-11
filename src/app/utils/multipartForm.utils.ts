import {Injectable} from '@angular/core';
import { FormGroup } from '@angular/forms';

@Injectable()
export class MultipartFormUtils {

  constructor() {
  }

  private isMultipartForm(fields: any[]): boolean {

    for (const fieldIndex in fields)
    {
      let field = fields[fieldIndex];

      if (field.type == "file")
        return true;
    }

    return false;
  }

  private extractMultipartFormData(fields: any[], formGroup: FormGroup): FormData {
    let formData = new FormData();

    for (const fieldIndex in fields)
    {
      let field = fields[fieldIndex];
      let value = formGroup.controls[field.name].value;

      if (typeof value === 'string' && value.length ===0) {
        value = null;
      }

      if (field.type == "file") {
        // TODO: Support more than 1 file input per form.
        let fileInput : HTMLInputElement = document.querySelector('input[type="file"]');

        if (fileInput.files.length > 0) {
          let firstFile = fileInput.files[0];
          formData.append(field.name, firstFile, firstFile.name);
        }
      } else if (value != null && value != undefined) {   
        formData.append(field.name, value);
      }
    }

    return formData;
  }
}
