import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { add, format } from 'date-fns';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { FichasService } from 'src/app/services/fichas.service';
import { TurnosService } from 'src/app/services/turnos.service';
import { UsuariosService } from 'src/app/services/usuarios.service';

@Component({
  selector: 'app-turnos-detalles',
  templateUrl: './turnos-detalles.component.html',
  styles: [
  ]
})
export class TurnosDetallesComponent implements OnInit {

  // Modal turno
  public showModal = false;

  // Usuario - Profesional
  public usuario: any;
  public pacienteSeleccionado: any;

  // Turnos
  public turnos: any;
  public fecha_busqueda: any = format(new Date(), 'yyyy-MM-dd');

  // Formulario - Turno
  public fecha: string = '';
  public hora: string = '';
  public dni: string = '';

  // Ordenar
  public ordenar = {
    direccion: 1,  // Asc (1) | Desc (-1)
    columna: 'fecha_turno'
  }

  constructor(private activatedRoute: ActivatedRoute,
              private dataService: DataService,
              private authService: AuthService,
              private fichasService: FichasService,
              private turnosService: TurnosService,
              private alertService: AlertService,
              private usuariosService: UsuariosService) { }

  // Inicio de componente
  ngOnInit(): void {
    console.log(new Date(format(new Date(),'yyyy-MM-dd:00:00:00')));
    this.dataService.ubicacionActual = 'Dashboard - Detalles de turnos';
    this.alertService.loading();
    this.activatedRoute.params.subscribe(({id}) => {
      this.usuariosService.getUsuario(id).subscribe({
        next: (usuario) => {
          this.usuario = usuario;
          console.log(usuario);
          this.turnosService.listarTurnos(
            this.ordenar.direccion, 
            this.ordenar.columna,
            this.usuario._id
            ).subscribe({
            next: ({turnos}) => {
              this.turnos = turnos;
              console.log(turnos);
              this.alertService.close();
            },
            error: ({error}) => {
              this.alertService.errorApi(error.message);
            }
          });
        },
        error: ({error}) => {
          this.alertService.errorApi(error.message);
        }
      });        
    });
  }

  // Listar turnos
  listarTurnos(): void {
    this.turnosService.listarTurnos(
      this.ordenar.direccion, 
      this.ordenar.columna,
      this.usuario._id      
    ).subscribe({
      next: ({turnos}) => {
        this.turnos = turnos;
        this.showModal = false;
        this.alertService.close();
      },
      error: ({error}) => {
        this.alertService.errorApi(error.message);
      }
    });
  }

  abrirModal(): void {
    this.reiniciarFormulario();
    this.showModal = true;
  }

  modificarFecha(accion: string): void {
    if(accion === 'proximo' && this.fecha_busqueda !== ''){
      this.fecha_busqueda = format(add(new Date(this.fecha_busqueda),{ days: 1, hours: 3 }),'yyyy-MM-dd');
    }else if(accion === 'anterior' && this.fecha_busqueda !== ''){
      this.fecha_busqueda = format(add(new Date(this.fecha_busqueda),{ days: -1, hours: 3 }),'yyyy-MM-dd');   
    }
  }

  nuevoTurno(): void {

    if(this.fecha.trim() === '' || this.hora.trim() === '' || !this.pacienteSeleccionado){
      this.alertService.info('Debe completar los campos obligatorios');
      return;
    }

    this.alertService.loading();

    const nuevaFecha = this.fecha + ':' + this.hora;

    const data = {
      ficha: this.pacienteSeleccionado._id,
      fecha_turno: new Date(nuevaFecha),
      profesional: this.usuario._id,
      creatorUser: this.authService.usuario.userId,
      updatorUser: this.authService.usuario.userId
    }

    this.turnosService.nuevoTurno(data).subscribe({
      next: () => {
        this.listarTurnos();
      },
      error: ({error}) => {
        this.alertService.errorApi(error.message);
      }
    });
  }

  buscarPaciente(): void {
    this.alertService.loading();
    this.fichasService.getFichaPorDNI(this.dni).subscribe({
      next: ({ficha}) => {
        this.alertService.close();
        this.dni = '';
        this.pacienteSeleccionado = ficha;
      },
      error: ({error}) => {
        this.alertService.info('El paciente no esta registrado');
      }
    });
  }

  reiniciarFormulario(): void {
    this.fecha = this.fecha_busqueda;
    this.dni = '';
    this.pacienteSeleccionado = null;  
  }

  // Ordenar por columna
  ordenarPorColumna(columna: string){
    this.ordenar.columna = columna;
    this.ordenar.direccion = this.ordenar.direccion == 1 ? -1 : 1;
    this.alertService.loading();
    this.listarTurnos();
  }

}
