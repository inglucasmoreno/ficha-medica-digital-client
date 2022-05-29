import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class CirugiasService {

  constructor(private http:HttpClient) {}

  // Obtener cirugias por ID
  getCirugia(id: string): Observable<any>{
    return this.http.get(`${base_url}/cirugias/${id}`, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }
  
  // Obtener cirugias por ficha
  getCirugiasPorFicha(id: string, direccion: number = -1, columna: string = 'createdAt'): Observable<any>{
    return this.http.get(`${base_url}/cirugias/ficha/${id}`, {
      params: {
        direccion,
        columna
      },
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }  

  // Listado de cirugias
  listarCirugias( direccion : number = -1, columna: string = 'createdAt' ): Observable<any>{
    return this.http.get(`${base_url}/cirugias`, {
      params: {
        direccion: String(direccion),
        columna
      },
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Nueva cirugia
  nuevaCirugia(data: any): Observable<any>{
    return this.http.post(`${base_url}/cirugias`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }


}
