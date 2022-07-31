import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroAutorizaciones'
})
export class FiltroAutorizacionesPipe implements PipeTransform {

  transform(valores: any[], parametro: string): any {
        
    // Filtrado por parametro
    parametro = parametro.toLocaleLowerCase();
    
    if(parametro.length !== 0){
      return valores.filter( valor => { 
        return valor.medicamento.descripcion.toLocaleLowerCase().includes(parametro) ||
               valor.profesional_tipo.toLocaleLowerCase().includes(parametro) ||
               (valor.profesional_interno.apellido.toLocaleLowerCase() + ' ' + valor.profesional_interno.nombre.toLocaleLowerCase()).includes(parametro) ||
               (valor.profesional_interno.nombre.toLocaleLowerCase() + ' ' + valor.profesional_interno.apellido.toLocaleLowerCase()).includes(parametro) ||
               (valor.profesional_externo.apellido.toLocaleLowerCase() + ' ' + valor.profesional_externo.nombre.toLocaleLowerCase()).includes(parametro) ||
               (valor.profesional_externo.nombre.toLocaleLowerCase() + ' ' + valor.profesional_externo.apellido.toLocaleLowerCase()).includes(parametro)
      });
    }else{
      return valores;
    }

  }

}
