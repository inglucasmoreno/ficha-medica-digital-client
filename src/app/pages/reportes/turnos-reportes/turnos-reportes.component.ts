import { i18nMetaToJSDoc } from '@angular/compiler/src/render3/view/i18n/meta';
import { Component, OnInit } from '@angular/core';
import gsap from 'gsap';
import { AlertService } from 'src/app/services/alert.service';
import { DataService } from 'src/app/services/data.service';
import { FichasService } from 'src/app/services/fichas.service';
import { TurnosService } from 'src/app/services/turnos.service';
import { UsuariosService } from 'src/app/services/usuarios.service';

@Component({
  selector: 'app-turnos-reportes',
  templateUrl: './turnos-reportes.component.html',
  styles: [
  ]
})
export class TurnosReportesComponent implements OnInit {

  public showModalTurnos = false;

  // Listados
  public profesionales: any;
  public operadores: any;
  public turnos: any;

  // Parametros
  parametros = {
    profesional: '',
    operador: '',
    ficha: '',
    direccion: -1,  // Asc (1) | Desc (-1)
    columna: 'createdAt'
  }
  
  // Paciente
  public pacienteDNI = '';
  public pacienteSeleccionado;

  // Paginacion
  public paginaActual: number = 1;
  public cantidadItems: number = 10;

  // Filtrado de turnos
	public filtro = {
		estado: '',
		parametro: ''
	}

  // Ordenar
  public ordenar = {
    direccion: -1,  // Asc (1) | Desc (-1)
    columna: 'createdAt'
  }

  constructor(private usuarioService: UsuariosService,
              private fichasService: FichasService,
              private turnosService: TurnosService,
              private alertService: AlertService,
              private dataService: DataService) { }

  ngOnInit(): void {
    gsap.from('.gsap-contenido', { y:100, opacity: 0, duration: .2 });
    this.dataService.ubicacionActual = 'Dashboard - Reporte de turnos';
    this.listarUsuarios();
  }

  // Listado de usuario - Filtrado de profesionales y Operadores
  listarUsuarios(): void {
    this.alertService.loading();
    this.usuarioService.listarUsuarios().subscribe({
      next: ({usuarios}) => {
        this.profesionales = usuarios.filter(usuario => usuario.role === 'DOCTOR_ROLE');
        this.operadores = usuarios.filter(usuario => usuario.role !== 'DOCTOR_ROLE');
        this.alertService.close();
      },
      error: ({error}) => this.alertService.errorApi(error.message)
    })
  }

  // Generar reporte de turnos
  generarReporte(): void {
    this.alertService.loading();
    this.filtro.estado = '';
    this.turnosService.reporteTurnos(this.parametros).subscribe({
      next: ({turnos}) => {
        this.turnos = turnos;
        this.showModalTurnos = true;
        this.alertService.close();
      },
      error: ({error}) => this.alertService.errorApi(error.message)
    })
  }

  // buscar paciente
  buscarPaciente(): void {
    if(this.pacienteDNI !== ''){
      this.alertService.loading();
      this.fichasService.getFichaPorDNI(this.pacienteDNI).subscribe({
        next: ({ficha}) => {
          this.parametros.ficha = ficha._id;
          this.pacienteSeleccionado = ficha;
          this.alertService.close();
        },
        error: ({error}) => this.alertService.errorApi(error.message)
      });
    }else{
      this.alertService.info('Debe colocar el DNI del paciente');
    }
  }

  // Eliminar seleccionado
  eliminarPacienteSeleccionado(): void {
    this.pacienteSeleccionado = null;
    this.pacienteDNI = '';
    this.parametros.ficha = '';
  }

  // Ordenar por columna
  ordenarPorColumna(columna: string){
    this.parametros.columna = columna;
    this.parametros.direccion = this.parametros.direccion == 1 ? -1 : 1; 
    this.alertService.loading();
    this.generarReporte();
  }

}
