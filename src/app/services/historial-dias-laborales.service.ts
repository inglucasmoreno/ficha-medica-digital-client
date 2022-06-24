import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class HistorialDiasLaboralesService {

  constructor(private http:HttpClient) {}

  // Obtener historial por ID
  getHistorial(id: string): Observable<any>{
    return this.http.get(`${base_url}/historial-dias-laborales/${id}`, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }
  
  // Obtener historial por medico
  getHistorialPorMedico(id: string, direccion: number = -1, columna: string = 'createdAt'): Observable<any>{
    return this.http.get(`${base_url}/historial-dias-laborales/usuario/${id}`, {
      params: {
        direccion,
        columna
      },
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }  

  // Listado de historiales
  listarHistoriales( direccion : number = -1, columna: string = 'createdAt' ): Observable<any>{
    return this.http.get(`${base_url}/historial-dias-laborales`, {
      params: {
        direccion: String(direccion),
        columna
      },
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Nuevo historial
  nuevoHistorial(data: any): Observable<any>{
    return this.http.post(`${base_url}/historial-dias-laborales`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }


}
