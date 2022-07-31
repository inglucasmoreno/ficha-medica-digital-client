import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class AutorizacionesMedicamentosService {

  constructor(private http:HttpClient) {}

  // Obtener autorizacion por ID
  getAutorizacion(id: string): Observable<any>{
    return this.http.get(`${base_url}/autorizaciones-medicamentos/${id}`, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }
  
  // Listado de autorizaciones
  listarAutorizaciones( direccion : number = -1, columna: string = 'createdAt', ficha: string = '' ): Observable<any>{
    return this.http.get(`${base_url}/autorizaciones-medicamentos`, {
      params: {
        direccion: String(direccion),
        columna
      },
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Nueva autorizacion
  nuevaAutorizacion(data: any): Observable<any>{
    return this.http.post(`${base_url}/autorizaciones-medicamentos`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Actualizar autorizacion
  actualizarAutorizacion(id: string, data: any): Observable<any>{
    return this.http.put(`${base_url}/autorizaciones-medicamentos/${id}`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }  
    })
  }

  // Calculos iniciales
  calculosIniciales(direccion : number = -1, columna: string = 'createdAt', ficha: string = ''): Observable<any>{
    return this.http.get(`${base_url}/autorizaciones-medicamentos/calculos-iniciales/${ficha}`, {
      params: {
        direccion: String(direccion),
        columna
      },
      headers: {
        'Authorization': localStorage.getItem('token')
      }  
    })
  }

}
