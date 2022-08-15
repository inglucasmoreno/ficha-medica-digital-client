import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class FichasService {

  constructor(private http: HttpClient) {}

  // Ficha por ID
  getFicha(id: string): Observable<any>{
    return this.http.get(`${base_url}/fichas/${id}`, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    })
  } 

  // Ficha por ID
  getFichaPorDNI(dni: string): Observable<any>{
    return this.http.get(`${base_url}/fichas/dni/${dni}`, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    })
  } 

  // Listar fichas
  listarFichas( direccion : number = 1, 
                columna: string = 'apellido_nombre',
                desde: number = 0,
                registerpp: number = 10,
                activo: string = '',
                parametro: string = ''): Observable<any>{
    return this.http.get(`${base_url}/fichas`, {
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
    })
  }

  // Nueva ficha
  nuevaFicha(data: any): Observable<any>{
    return this.http.post(`${base_url}/fichas`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    })  
  }

  // Actualizar ficha
  actualizarFicha(id: string, data: any): Observable<any>{
    return this.http.put(`${base_url}/fichas/${id}`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }  
    })
  }

  // Generar reporte de fichas medicas
  reportesFichas(data: any): Observable<any>{
    return this.http.post(`${base_url}/fichas/pdf/reporte`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    })  
  }


}
