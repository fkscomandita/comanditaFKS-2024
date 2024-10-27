import { AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';

export function dateStringValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; // Si el campo está vacío, se considera válido (puedes ajustarlo según tus requerimientos)
    }

    // Patrón para verificar formato dd/mm/yyyy
    const dateFormat = /^\d{2}\/\d{2}\/\d{4}$/;

    // Verificar si el valor cumple con el patrón
    if (!dateFormat.test(control.value)) {
      return { 'dateString': { value: control.value } };
    }

    // Verificar si la fecha es válida
    const parts = control.value.split('/');
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // El mes en JavaScript es base 0 (0 - enero, 11 - diciembre)
    const year = parseInt(parts[2], 10);
    const date = new Date(year, month, day);

    if (!(date.getDate() === day && date.getMonth() === month && date.getFullYear() === year)) {
      return { 'dateString': { value: control.value } };
    }

    return null; // Retorna null si la validación es exitosa
  };
}
