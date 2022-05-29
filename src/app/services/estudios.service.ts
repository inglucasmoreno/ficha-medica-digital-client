import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class EstudiosService {

  constructor(private http:HttpClient) {}

  // Obtener estudios por ID
  getEstudio(id: string): Observable<any>{
    return this.http.get(`${base_url}/estudios/${id}`, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }
  
  // Obtener estudios por ficha
  getEstudiosPorFicha(id: string, direccion: number = -1, columna: string = 'createdAt'): Observable<any>{
    return this.http.get(`${base_url}/estudios/ficha/${id}`, {
      params: {
        direccion,
        columna
      },
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }  

  // Listado de estudios
  listarEstudios( direccion : number = -1, columna: string = 'createdAt' ): Observable<any>{
    return this.http.get(`${base_url}/estudios`, {
      params: {
        direccion: String(direccion),
        columna
      },
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Nuevo estudio
  nuevoEstudio(data: any): Observable<any>{
    return this.http.post(`${base_url}/estudios`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

}
