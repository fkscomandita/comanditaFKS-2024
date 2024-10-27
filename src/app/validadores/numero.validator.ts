import { ValidatorFn, ValidationErrors, AbstractControl } from "@angular/forms";


    export function isNumberValidator(): ValidatorFn {
      return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value;
        if (!isNaN(value)) {
          // El valor es un número
          return null; // No hay errores
        } else {
          // El valor no es un número
          return { 'noNumber': true }; // Devuelve un error
        }
      };
    }