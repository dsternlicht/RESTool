import { IConfigInputField } from '../common/models/config.model';

class FileHelpers {

  public isMultipartForm(fields: IConfigInputField[]): boolean {
    for (const fieldIndex in fields) {
      let field = fields[fieldIndex];

      if (field.type === 'file') {
        return true;
      }
    }

    return false;
  }

  
}

export const fileHelpers = new FileHelpers();