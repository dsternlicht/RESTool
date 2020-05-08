import { IConfigInputField } from "../common/models/config.model";

class DataHelpers {

  public extractDataByDataPath(data: any, dataPath: string, attr: string | null = null) {
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

}

export const dataHelpers = new DataHelpers();