import { Pipe, PipeTransform } from '@angular/core';
import { format } from 'date-fns';

@Pipe({
  name: 'hora'
})
export class HoraPipe implements PipeTransform {
  transform(fecha: any): string {
    return format(new Date(fecha), 'dd/MM/yyyy') === '01/01/1970' ? 'SIN ESPECIFICAR' : format(new Date(fecha), 'H:mm')
  }
}
