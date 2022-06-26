import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { HistorialDiasLaboralesService } from 'src/app/services/historial-dias-laborales.service';
import { UsuariosService } from 'src/app/services/usuarios.service';
import gsap from 'gsap';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-dias-laborales',
  templateUrl: './dias-laborales.component.html',
  styles: [
  ]
})
export class DiasLaboralesComponent implements OnInit {

  public usuarios: any;  
  public historiales: any;
  public idMedico = '';

  // Modal
  public showModalDias = false;

  // Paginacion
  public paginaActual: number = 1;
  public cantidadItems: number = 10;

  // Ordenar
  public ordenar = {
    direccion: -1,  // Asc (1) | Desc (-1)
    columna: 'createdAt'
  }

  constructor(private historialDiasLaboralesService: HistorialDiasLaboralesService,
              private dataService: DataService,
              private alertService: AlertService,
              private usuarioService: UsuariosService) { }

  ngOnInit(): void {
    gsap.from('.gsap-contenido', { y:100, opacity: 0, duration: .2 });
    this.dataService.ubicacionActual = 'Dashboard - Historial de días laborales';
    this.listarUsuarios();
  }

  // Listar usuarios
  listarUsuarios(): void {
    this.alertService.loading();
    this.usuarioService.listarUsuarios().subscribe({
      next: ({usuarios}) => {
        this.usuarios = usuarios.filter((usuario) => (usuario.activo && usuario.role === 'DOCTOR_ROLE'));
        this.alertService.close();
      },
      error: ({error}) => this.alertService.errorApi(error.message)
    });
  }

  // Generar historial
  generarHistorial(): void {
    if(this.idMedico !== ''){
      this.alertService.loading();
      this.historialDiasLaboralesService.listarHistorialPorMedico(this.idMedico,this.ordenar.direccion, this.ordenar.columna).subscribe({
        next: ({historiales}) => {
          this.paginaActual = 1;
          this.historiales = historiales;
          this.showModalDias = true;
          this.alertService.close();
        },
        error: ({error}) => this.alertService.errorApi(error.message)
      })
    }
  }

  // Ordenar por columna
  ordenarPorColumna(columna: string){
    this.ordenar.columna = columna;
    this.ordenar.direccion = this.ordenar.direccion == 1 ? -1 : 1; 
    this.alertService.loading();
    this.generarHistorial();
  }

}
