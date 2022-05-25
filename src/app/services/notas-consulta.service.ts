import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class NotasConsultaService {

  constructor(private http:HttpClient) {}

  // Obtener notas de consulta por ID
  getNota(id: string): Observable<any>{
    return this.http.get(`${base_url}/notas-consulta/${id}`, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }
  
  // Obtener notas de consulta por ficha
  getNotasPorFicha(id: string): Observable<any>{
    return this.http.get(`${base_url}/notas-consulta/ficha/${id}`, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }  

  // Listado de notas de consulta
  listarNotas( direccion : number = 1, columna: string = 'descripcion' ): Observable<any>{
    return this.http.get(`${base_url}/notas-consulta`, {
      params: {
        direccion: String(direccion),
        columna
      },
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Nueva nota de consulta
  nuevaNota(data: any): Observable<any>{
    return this.http.post(`${base_url}/notas-consulta`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

}
