import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class TurnosService {

  constructor(private http:HttpClient) {}

  // Obtener turnos por ID
  getTurno(id: string): Observable<any>{
    return this.http.get(`${base_url}/turnos/${id}`, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Listado de turnos
  listarTurnos( direccion : number = -1, columna: string = 'createdAt' , usuario = '', fecha = '' ): Observable<any>{
    return this.http.get(`${base_url}/turnos`, {
      params: {
        direccion: String(direccion),
        columna,
        usuario,
        fecha
      },
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Reporte de turnos
  reporteTurnos(parametros: any): Observable<any>{
    return this.http.get(`${base_url}/turnos/seccion/reportes/finales`, {
      params: {
        ficha: parametros.ficha || '',
        profesional: parametros.profesional || '',
        operador: parametros.operador || '',
        columna: String(parametros.columna) || 'createdAt',
        direccion: parametros.direccion || -1,
      },
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Listado de turnos por ficha
  listarTurnosPorFicha( direccion : number = -1, columna: string = 'createdAt', ficha = ''): Observable<any>{
    return this.http.get(`${base_url}/turnos/filtrado/ficha`, {
      params: {
        direccion: String(direccion),
        columna,
        ficha,
      },
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Nuevo turno
  nuevoTurno(data: any): Observable<any>{
    return this.http.post(`${base_url}/turnos`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Turnos vencidos
  turnosVencidos(): Observable<any>{
    return this.http.get(`${base_url}/turnos/vencidos/baja`, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Actualizar turno
  actualizarTurno(id: string, data: any): Observable<any>{
    return this.http.put(`${base_url}/turnos/${id}`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }  
    })
  }


}
