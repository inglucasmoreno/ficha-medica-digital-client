import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { add, format } from 'date-fns';
import { es } from 'date-fns/locale';
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

  public permiso_escritura = ['TURNOS_ALL'];

  // Dia de hoy
  public fechaHoy = format(new Date, 'yyyy-MM-dd');

  // Tipo de accion sobre formulario
  public tipoAccion = 'crear'; // crear/editar

  // Modal turno
  public showModal = false;
  public showModalDetalles = false;

  // Usuario - Profesional
  public usuario: any;
  public pacienteSeleccionado: any;

  // Turnos
  public turnos: any;
  public turnoSeleccionado: any;
  public fecha_busqueda: any = format(new Date(), 'yyyy-MM-dd');

  // Formulario - Turno
  public fecha: string = '';
  public hora: string = '';
  public dni: string = '';

  // Alertas
  public alertas = {
    diaIncorrecto: false
  }

	// Filtrado
	public filtro = {
		estado: '',
		parametro: ''
	}

  // Ordenar
  public ordenar = {
    direccion: 1,  // Asc (1) | Desc (-1)
    columna: 'fecha_turno'
  }

  public dias: any[] = [];

  constructor(private activatedRoute: ActivatedRoute,
              private dataService: DataService,
              private authService: AuthService,
              private fichasService: FichasService,
              private turnosService: TurnosService,
              private alertService: AlertService,
              private usuariosService: UsuariosService) { }

  // Inicio de componente
  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Dashboard - Detalles de turnos';
    this.alertService.loading();
    this.activatedRoute.params.subscribe(({id}) => {
      this.usuariosService.getUsuario(id).subscribe({
        next: (usuario) => {
          this.usuario = usuario;
          this.dias = usuario.dias_laborales;
          this.turnosService.listarTurnos(
            this.ordenar.direccion, 
            this.ordenar.columna,
            this.usuario._id,
            this.fecha_busqueda
            ).subscribe({
            next: ({turnos}) => {
              this.turnos = turnos;
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
    this.alertService.loading();
    this.turnosService.listarTurnos(
      this.ordenar.direccion, 
      this.ordenar.columna,
      this.usuario._id,
      this.fecha_busqueda      
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

  abrirModal(tipo: string, turno = null): void {
    this.tipoAccion = tipo;
    this.turnoSeleccionado = turno;
    if(tipo === 'crear'){
      this.reiniciarFormulario();
    }else if(tipo === 'editar'){
      this.fecha = format(new Date(turno.fecha_turno),'yyyy-MM-dd');
      this.hora = format(new Date(turno.fecha_turno),'HH:mm');
      this.pacienteSeleccionado = turno.ficha;
    }
    this.showModal = true;
  }

  abrirModalDetalles(turno = null): void {
    this.reiniciarFormulario();
    this.pacienteSeleccionado = turno.ficha;
    this.turnoSeleccionado = turno;
    this.showModalDetalles = true;
  }

  modificarFecha(accion: string): void {
    if(accion === 'proximo' && this.fecha_busqueda !== ''){
      this.fecha_busqueda = format(add(new Date(this.fecha_busqueda),{ days: 1, hours: 3 }),'yyyy-MM-dd');
      this.listarTurnos();
    }else if(accion === 'anterior' && this.fecha_busqueda !== ''){
      this.fecha_busqueda = format(add(new Date(this.fecha_busqueda),{ days: -1, hours: 3 }),'yyyy-MM-dd');   
      this.listarTurnos();
    }
  }

  nuevoTurno(): void {

    // Verificacion de campos obligatorios
    if(this.fecha.trim() === '' || this.hora.trim() === '' || !this.pacienteSeleccionado){
      this.alertService.info('Debe completar los campos obligatorios');
      return;
    }

    // Verificacion de dia laboral
    if(this.alertas.diaIncorrecto){
      this.alertService.info('El profesional no esta disponible ese día');
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

  actualizarTurno(): void {

    if(this.fecha.trim() === '' || this.hora.trim() === '' || !this.pacienteSeleccionado){
      this.alertService.info('Debe completar los campos obligatorios');
      return;
    }

    // Verificacion de dia laboral
    if(this.alertas.diaIncorrecto){
      this.alertService.info('El profesional no esta disponible ese día');
      return;
    }

    this.alertService.loading();

    const nuevaFecha = this.fecha + ':' + this.hora;

    const data = {
      ficha: this.pacienteSeleccionado._id,
      fecha_turno: new Date(nuevaFecha),
      profesional: this.usuario._id,
      updatorUser: this.authService.usuario.userId
    }

    this.turnosService.actualizarTurno(this.turnoSeleccionado._id, data).subscribe({
      next: () => {
        this.listarTurnos();
      },
      error: ({error}) => {
        this.alertService.errorApi(error.message);
      }
    });

  }

  // Confirmar turno
  confirmarTurno(turno: any): void {
    const { _id } = turno;
      this.alertService.question({ msg: '¿Quieres confirmar el turno?', buttonText: 'Confirmar' })
        .then(({isConfirmed}) => {  
          if (isConfirmed) {
            this.alertService.loading();
            this.turnosService.actualizarTurno(_id, { confirmacion: true, activo: false }).subscribe(() => {
            this.listarTurnos();
          }, ({error}) => {
            this.alertService.close();
            this.alertService.errorApi(error.message);
          });
        }
      });
  }

  // Cancelar turno
  cancelarTurno(turno: any): void {
    const { _id } = turno;
      this.alertService.question({ msg: '¿Quieres cancelar el turno?', buttonText: 'Cancelar' })
        .then(({isConfirmed}) => {  
          if (isConfirmed) {
            this.alertService.loading();
            this.turnosService.actualizarTurno(_id, { cancelado: true, activo: false }).subscribe(() => {
            this.listarTurnos();
          }, ({error}) => {
            this.alertService.close();
            this.alertService.errorApi(error.message);
          });
        }
      });
  }

  // Verificar fecha
  verificarFecha(): void {
    if(this.fecha){
      const diaSeleccionado = format(add(new Date(this.fecha),{ hours: 3 }),'eeee',{locale: es});
      if(!this.dias.includes(diaSeleccionado)) this.alertas.diaIncorrecto = true;
      else this.alertas.diaIncorrecto = false;
    }
  }

  reiniciarFormulario(): void {
    this.fecha = this.fecha_busqueda;
    this.verificarFecha();  // Se verifica si la fecha seleccionada es laboral para el profesional
    this.hora = '';
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
