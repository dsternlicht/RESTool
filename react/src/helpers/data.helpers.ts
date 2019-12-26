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

    if (!extractedData) {
      return null;
    }

    if (attr) {
      return extractedData[attr];
    }

    return extractedData;
  }

}

export const dataHelpers = new DataHelpers();