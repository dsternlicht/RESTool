import { Inject, Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'rowFilter'})
export class RowFilterPipe implements PipeTransform {
  constructor(@Inject('DataPathUtils') private readonly dataPathUtils) {
  }

  public transform(rows: Array<any>, fields: Array<any>, filterText: string): Array<any> {
    if (!filterText || !fields || !rows) {
        return rows;
    }

    let upperFilterText = filterText.toUpperCase();
    return rows.filter(row => {
      for (let field of fields) {
        let value = this.dataPathUtils.extractDataFromResponse(row, field.dataPath, field.name);
        if (value && value.toString().toUpperCase().indexOf(upperFilterText) !== -1) {
          return true;
        }
      }
      return false;
    });
  }
}
