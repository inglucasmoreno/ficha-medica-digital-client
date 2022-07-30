import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class MedicosExternosService {
  constructor(private http:HttpClient) {}

  // Obtener medico externo por ID
  getMedicoExterno(id: string): Observable<any>{
    return this.http.get(`${base_url}/medicos-externos/${id}`, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }
  
  // Listado de medicos
  listarMedicosExternos( direccion : number = -1, columna: string = 'createdAt' ): Observable<any>{
    return this.http.get(`${base_url}/medicos-externos`, {
      params: {
        direccion: String(direccion),
        columna
      },
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Nuevo medico
  nuevoMedico(data: any): Observable<any>{
    return this.http.post(`${base_url}/medicos-externos`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Actualizar medico
  actualizarMedico(id: string, data: any): Observable<any>{
    return this.http.put(`${base_url}/medicos-externos/${id}`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }  
    })
  }
}
