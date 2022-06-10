import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class TipoMedicoService {

  constructor(private http:HttpClient) {}

  // Obtener tipo por ID
  getTipo(id: string): Observable<any>{
    return this.http.get(`${base_url}/tipo-medico/${id}`, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Listado de tipos
  listarTipos( direccion : number = -1, columna: string = 'descripcion' ): Observable<any>{
    return this.http.get(`${base_url}/tipo-medico`, {
      params: {
        direccion: String(direccion),
        columna
      },
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Nuevo tipo
  nuevoTipo(data: any): Observable<any>{
    return this.http.post(`${base_url}/tipo-medico`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Actualizar tipo
  actualizarTipo(id: string, data: any): Observable<any>{
    return this.http.put(`${base_url}/tipo-medico/${id}`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }  
    })
  }


}
