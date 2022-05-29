import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class AntecedentesService {

  constructor(private http:HttpClient) {}

  // Obtener antecedente por ID
  getAntecedente(id: string): Observable<any>{
    return this.http.get(`${base_url}/antecedentes/${id}`, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }
  
  // Obtener antecedentes por ficha
  getAntecedentesPorFicha(id: string, direccion: number = -1, columna: string = 'createdAt'): Observable<any>{
    return this.http.get(`${base_url}/antecedentes/ficha/${id}`, {
      params: {
        direccion,
        columna
      },
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }  

  // Listado de antecedentes
  listarAntecedentes( direccion : number = -1, columna: string = 'createdAt' ): Observable<any>{
    return this.http.get(`${base_url}/antecedentes`, {
      params: {
        direccion: String(direccion),
        columna
      },
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Nuevo antecedentes
  nuevoAntecedente(data: any): Observable<any>{
    return this.http.post(`${base_url}/antecedentes`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

}
