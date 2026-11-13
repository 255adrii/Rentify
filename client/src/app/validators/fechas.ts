import { AbstractControl, ValidationErrors } from '@angular/forms';

export function fechasOrdenadas(control: AbstractControl): ValidationErrors | null {
  const { fechaInicio, fechaFin } = control.value;
  return fechaInicio && fechaFin && fechaInicio >= fechaFin ? { fechas: true } : null;
}
