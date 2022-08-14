import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class MedicamentosService {

  constructor(private http:HttpClient) {}

  // Obtener medicamento por ID
  getMedicamento(id: string): Observable<any>{
    return this.http.get(`${base_url}/medicamentos/${id}`, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }
  
  // Listado de medicamentos
  listarMedicamentos(
    direccion : number = -1, 
    columna: string = 'createdAt',
    desde: number = 1,
    registerpp: number = 10,
    activo: string = '',
    parametro: string = ''
  ): Observable<any>{
    return this.http.get(`${base_url}/medicamentos`, {
      params: {
        direccion: String(direccion),
        columna,
        desde,
        registerpp,
        activo,
        parametro   
      },
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Nuevo medicamento
  nuevoMedicamento(data: any): Observable<any>{
    return this.http.post(`${base_url}/medicamentos`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Actualizar medicamento
  actualizarMedicamento(id: string, data: any): Observable<any>{
    return this.http.put(`${base_url}/medicamentos/${id}`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }  
    })
  }


}
