import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroTurnos'
})
export class FiltroTurnosPipe implements PipeTransform {

  transform(valores: any[], parametro: string, estado: string): any {
    
    let filtrados: any[];

    if(estado === 'confirmados') filtrados = valores.filter( valor => valor.confirmacion );
    else if(estado === 'vencidos') filtrados = valores.filter( valor => valor.vencido );
    else if(estado === 'cancelados') filtrados = valores.filter( valor => valor.cancelado );
    else filtrados = valores;
    
    // Filtrado por parametro
    parametro = parametro.toLocaleLowerCase();
    
    if(parametro.length !== 0){
      return filtrados.filter( valor => { 
        return valor.ficha.nro_afiliado.toLocaleLowerCase().includes(parametro) ||
               valor.ficha.dni.toLocaleLowerCase().includes(parametro)
      });
    }else{
      return filtrados;
    }
  }
}
