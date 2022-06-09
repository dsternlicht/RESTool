import { IConfigInputField } from "../common/models/config.model";

class DataHelpers {

  public extractDataByDataPath(data: any, dataPath: string | undefined, attr: string | null = null) {
    if (!data || !dataPath) {
      if (attr) {
        return data[attr];
      }
      return data;
    }

    let extractedData: any = data;
    const digProps: string[] = dataPath.split('.');

    for (let prop of digProps) {
      if (typeof extractedData[prop] !== 'undefined') {
        extractedData = extractedData[prop];
      } else {
        return null;
      }
    }

    if (typeof extractedData === 'undefined') {
      return null;
    }

    if (attr) {
      return extractedData[attr];
    }

    return extractedData;
  }

  public checkIfFieldIsObject(field: IConfigInputField): boolean {
    if (field.type === 'object') {
      return true;
    }

    if (field.type === 'array') {
      if (!field.arrayType || field.arrayType === 'object') {
        return true;
      }
    }

    return false;
  }

  public normaliseInputFieldValue(field: IConfigInputField, value: any): any {
    switch (field.type) {
      case "boolean":
        if (value === 'true') {
          return true;
        }

        return value;
      case "select-multi":
        if (typeof value !== 'string') {
          return value;
        }

        if (value === '') {
          return [];
        }

        return value.split(",");
      default:
        return value;
    }
  }

  public updateInputFieldFromFields(fieldName: string, value: any, fields: IConfigInputField[]): IConfigInputField[] {
    return fields.map((field) => {
      if (field.name !== fieldName) {
        return field;
      }

      field.value = dataHelpers.normaliseInputFieldValue(field, value);

      return field;
    })
  }
}

export const dataHelpers = new DataHelpers();
