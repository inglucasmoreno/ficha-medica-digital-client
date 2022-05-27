import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { FichasService } from 'src/app/services/fichas.service';
import { NotasConsultaService } from 'src/app/services/notas-consulta.service';

@Component({
  selector: 'app-ficha-detalles',
  templateUrl: './ficha-detalles.component.html',
  styles: [
  ]
})
export class FichaDetallesComponent implements OnInit {

  // Modals
  public showModalNota = false;

  // Ficha
  public idFicha: string;
  public ficha: any;
  public notasConsulta: any[];

  // Formularios
  public notaConsulta = '';

	// Paginacion
	public paginaActual: number = 1;
	public cantidadItems: number = 10;

	// Filtrado
	public filtro = {
		activo: 'true',
		parametro: ''
	}

	// Ordenar
	public ordenar = {
		direccion: 1,  // Asc (1) | Desc (-1)
		columna: 'apellido'
	}

  constructor(private activatedRoute: ActivatedRoute,
              private authService: AuthService,
              private notasConsultaService: NotasConsultaService,
              private alertService: AlertService,
              private fichaService: FichasService) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe( ({id}) => {
      this.idFicha = id;
      this.obtenerInformacion();
    });
  }

  obtenerInformacion(): void {
    this.alertService.loading();
    this.fichaService.getFicha(this.idFicha).subscribe({
      next: ({ficha}) => {
        this.ficha = ficha;
        console.log(this.ficha);
        this.listarNotasConsulta();
      },
      error: ({error}) => {
        this.alertService.errorApi(error.msg);
      }
    })
  }

  listarNotasConsulta(): void {
    this.notasConsultaService.getNotasPorFicha(this.idFicha).subscribe({
      next: ({notas}) => {
        this.notasConsulta = notas;
        console.log(notas);
        this.alertService.close();
      },
      error: ({error}) => {
        this.alertService.errorApi(error.message);
      }
    })
  }

  // Crear nueva nota de consulta
  crearNotaConsulta(): void {
    
    if(this.notaConsulta.trim() === ''){
      this.alertService.info('Debes colocarle contenido a la nota');
      return;
    }

    this.alertService.loading();
    
    const data = {
      ficha: this.idFicha,
      descripcion: this.notaConsulta,
      creatorUser: this.authService.usuario.userId,
      updatorUser: this.authService.usuario.userId,
    };
    
    this.notasConsultaService.nuevaNota(data).subscribe({
      next: () => {
        this.reiniciarFormularios()
        this.showModalNota = false;
        this.listarNotasConsulta();
      },
      error: ({error}) => {
        this.alertService.errorApi(error.message)
      }
    })
  
  }

  // Abrir modal - Nota de consulta
  abrirModalNota(): void {
    this.showModalNota = true;
  }

  // Reiniciar formularios
  reiniciarFormularios(): void {
    this.notaConsulta = '';  
  }

  // Filtrar Activo/Inactivo
  filtrarActivos(activo: any): void{
    this.paginaActual = 1;
    this.filtro.activo = activo;
  }

  // Filtrar por Parametro
  filtrarParametro(parametro: string): void{
    this.paginaActual = 1;
    this.filtro.parametro = parametro;
  }

  // Ordenar por columna
  ordenarPorColumna(columna: string){
    this.ordenar.columna = columna;
    this.ordenar.direccion = this.ordenar.direccion == 1 ? -1 : 1;
    this.alertService.loading();
    this.listarNotasConsulta();
  }

}
