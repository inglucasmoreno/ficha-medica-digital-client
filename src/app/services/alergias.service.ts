import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class AlergiasService {

  constructor(private http:HttpClient) {}

  // Obtener alergia por ID
  getAlergia(id: string): Observable<any>{
    return this.http.get(`${base_url}/alergias/${id}`, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }
  
  // Obtener alergias por ficha
  getAlergiasPorFicha(id: string, direccion: number = -1, columna: string = 'createdAt'): Observable<any>{
    return this.http.get(`${base_url}/alergias/ficha/${id}`, {
      params: {
        direccion,
        columna
      },
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }  

  // Listado de alergias
  listarAlergias( direccion : number = -1, columna: string = 'createdAt' ): Observable<any>{
    return this.http.get(`${base_url}/alergias`, {
      params: {
        direccion: String(direccion),
        columna
      },
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Nueva alergia
  nuevaAlergia(data: any): Observable<any>{
    return this.http.post(`${base_url}/alergias`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

}
