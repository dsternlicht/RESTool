import { get } from 'lodash';

import { IConfigInputField } from "../common/models/config.model";

class DataHelpers {

  public extractDataByDataPath(data: unknown, dataPath: string, attr: string | null = null) {
    if (typeof data !== 'object') {
      return data;
    }

    if (data === null) {
      return data;
    }

    if (!dataPath) {
      if (attr) {
        return get(data, attr);
      }
      return data;
    }

    const extractedData = get(data, dataPath);

    if (typeof extractedData === 'undefined') {
      return null;
    }

    if (attr) {
      return get(extractedData, attr);
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