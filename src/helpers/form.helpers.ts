import { IConfigInputField } from "../common/models/config.model";

/**
 * Form Helper Utilities
 */
class FormHelpers {

  /**
   * Checks if form has unsaved changes by comparing initial and current field values
   * @param initialFields - Original field values when form was loaded
   * @param currentFields - Current field values
   * @returns true if any field value has changed
   */
  public isFormDirty(initialFields: IConfigInputField[], currentFields: IConfigInputField[]): boolean {
    if (!initialFields || !currentFields) {
      return false;
    }

    // Compare each current field with its initial value
    for (const currentField of currentFields) {
      const initialField = initialFields.find(f => f.name === currentField.name);

      // If field didn't exist initially, check if it has a non-empty value
      if (!initialField) {
        if (this.hasNonEmptyValue(currentField)) {
          return true;
        }
        continue;
      }

      // Compare values based on field type
      if (this.isFieldValueChanged(initialField, currentField)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Checks if a field has a non-empty/non-default value
   */
  private hasNonEmptyValue(field: IConfigInputField): boolean {
    const value = field.value;

    if (value === null || value === undefined || value === '') {
      return false;
    }

    if (Array.isArray(value) && value.length === 0) {
      return false;
    }

    if (field.type === 'boolean' && value === false) {
      return false;
    }

    return true;
  }

  /**
   * Compares initial and current field values to detect changes
   */
  private isFieldValueChanged(initialField: IConfigInputField, currentField: IConfigInputField): boolean {
    const initialValue = initialField.value;
    const currentValue = currentField.value;

    // Handle file fields - file uploads always count as changes if a file is selected
    if (currentField.type === 'file') {
      // Check if a file input exists and has files
      const fileInput = document.querySelector(`input[name="${currentField.name || 'file'}"]`) as HTMLInputElement;
      return !!(fileInput?.files && fileInput.files.length > 0);
    }

    // Handle boolean fields
    if (currentField.type === 'boolean') {
      return Boolean(initialValue) !== Boolean(currentValue);
    }

    // Handle array fields
    if (currentField.type === 'array' || Array.isArray(currentValue)) {
      return !this.areArraysEqual(initialValue, currentValue);
    }

    // Handle object/JSON fields (stored as stringified JSON)
    if (currentField.type === 'object' || currentField.arrayType === 'object') {
      return this.normalizeJsonString(initialValue) !== this.normalizeJsonString(currentValue);
    }

    // Handle number/integer fields
    if (currentField.type === 'number' || currentField.type === 'integer') {
      // Convert to numbers for comparison (handles "123" vs 123)
      const initialNum = this.toNumber(initialValue);
      const currentNum = this.toNumber(currentValue);
      return initialNum !== currentNum;
    }

    // Handle select-multi fields (can be array or comma-separated string)
    if (currentField.type === 'select-multi') {
      const initialArray = this.toArray(initialValue);
      const currentArray = this.toArray(currentValue);
      return !this.areArraysEqual(initialArray, currentArray);
    }

    // Default: string comparison for text, select, password, etc.
    return this.normalizeString(initialValue) !== this.normalizeString(currentValue);
  }

  /**
   * Normalizes a value to a string for comparison
   */
  private normalizeString(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }
    return String(value).trim();
  }

  /**
   * Normalizes JSON strings for comparison (handles formatting differences)
   */
  private normalizeJsonString(value: any): string {
    if (!value) return '';

    try {
      // If it's already an object, stringify it
      if (typeof value === 'object') {
        return JSON.stringify(value);
      }

      // If it's a string, parse and re-stringify to normalize formatting
      const parsed = JSON.parse(value);
      return JSON.stringify(parsed);
    } catch {
      // If parsing fails, treat as regular string
      return String(value).trim();
    }
  }

  /**
   * Converts a value to a number, handling null/undefined/empty
   */
  private toNumber(value: any): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    const num = Number(value);
    return isNaN(num) ? null : num;
  }

  /**
   * Converts a value to an array
   */
  private toArray(value: any): any[] {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      return value.split(',').map(v => v.trim()).filter(v => v);
    }
    return [value];
  }

  /**
   * Compares two arrays for equality (order matters)
   */
  private areArraysEqual(arr1: any, arr2: any): boolean {
    const a1 = this.toArray(arr1);
    const a2 = this.toArray(arr2);

    if (a1.length !== a2.length) {
      return false;
    }

    for (let i = 0; i < a1.length; i++) {
      if (a1[i] !== a2[i]) {
        return false;
      }
    }

    return true;
  }
}

export const formHelpers = new FormHelpers();
