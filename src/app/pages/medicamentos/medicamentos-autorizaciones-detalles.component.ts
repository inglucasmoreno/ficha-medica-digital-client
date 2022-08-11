import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { AutorizacionesMedicamentosService } from 'src/app/services/autorizaciones-medicamentos.service';
import { DataService } from 'src/app/services/data.service';
import { FichasService } from 'src/app/services/fichas.service';

@Component({
  selector: 'app-medicamentos-autorizaciones-detalles',
  templateUrl: './medicamentos-autorizaciones-detalles.component.html',
  styles: [
  ]
})
export class MedicamentosAutorizacionesDetallesComponent implements OnInit {

  // Formulario
  public profesional_tipo = 'Interno';
  public profesional_interno = '';
  public profesional_externo = '';
  public medicamento = '';
  public cantidad = null;
  public diagnostico = '';

  // Permisos de usuarios login
  public permisos = { all: false };

  // Modal
  public showModalAutorizacion = false;

  // Estado formulario 
  public estadoFormulario = 'crear';

  // Ficha
  public idFicha;
  public ficha;

  // Medicos externos
  public medicosExternos: any[] = [];

  // Medicos internos
  public medicosInternos: any[] = [];

  // Medicamentos
  public medicamentos: any[] = [];

  // Autorizacion
  public idAutorizacion: string = '';
  public autorizaciones: any = [];
  public autorizacionSeleccionada: any;
  public apellido: string = '';
  public nombre: string = '';
  public dni: string = '';

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
    direccion: -1,  // Asc (1) | Desc (-1)
    columna: 'createdAt'
  }

  constructor(private autorizacionesMedicamentosService: AutorizacionesMedicamentosService,
              private activatedRoute: ActivatedRoute,
              private fichasService: FichasService,
              private authService: AuthService,
              private alertService: AlertService,
              private dataService: DataService) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Dashboard - Autorización de medicamentos'; 
    this.permisos.all = this.permisosUsuarioLogin();
    this.alertService.loading();
    this.cargaInicial();
  }

  // Asignar permisos de usuario login
  permisosUsuarioLogin(): boolean {
    return this.authService.usuario.permisos.includes('AUTORIZACIONES_MEDICAMENTOS_ALL') || this.authService.usuario.role === 'ADMIN_ROLE';
  }

  // Carga inicial del componente
  cargaInicial(): void {
    this.activatedRoute.params.subscribe(({id}) => {
      this.idFicha = id; 
      this.fichasService.getFicha(id).subscribe({
        next: ({ficha}) => {
          this.ficha = ficha;
          this.autorizacionesMedicamentosService.calculosIniciales(
          this.ordenar.direccion,
          this.ordenar.columna,
          ficha._id
          ).subscribe({
            next: (res) => {
              const { medicos_externos, medicos_internos, medicamentos, autorizaciones } = res.resultados;
              this.medicosExternos = medicos_externos;
              this.medicosInternos = medicos_internos;
              this.medicamentos = medicamentos;
              this.autorizaciones = autorizaciones;
              this.alertService.close();
            },
            error: ({error}) => this.alertService.errorApi(error.message)
          })
        },
        error: ({error}) => this.alertService.errorApi(error.message)
      })
    });
  }

  // Abrir modal
  abrirModal(estado: string, autorizacion: any = null): void {
    window.scrollTo(0,0);
    this.reiniciarFormulario();
    this.idAutorizacion = '';
    
    this.autorizacionSeleccionada = autorizacion;

    if(estado === 'editar'){
      this.profesional_tipo = autorizacion.profesional_tipo;
      this.profesional_interno = autorizacion.profesional_interno._id;
      this.profesional_externo = autorizacion.profesional_externo._id;
      this.medicamento = autorizacion.medicamento._id;
      this.cantidad = autorizacion.cantidad;
      this.diagnostico = autorizacion.diagnostico;
    }

    this.showModalAutorizacion = true;

    this.estadoFormulario = estado;  
  }

  // Listar autorizaciones
  listarAutorizaciones(): void {
    this.autorizacionesMedicamentosService.listarAutorizaciones( 
      this.ordenar.direccion,
      this.ordenar.columna,
      this.idFicha
      )
    .subscribe( ({ autorizaciones }) => {
      this.autorizaciones = autorizaciones;
      this.showModalAutorizacion = false;
      this.reiniciarFormulario();
      this.alertService.close();
    }, (({error}) => {
      this.alertService.errorApi(error.msg);
    }));
  }

  // Nueva autorizacion
  nuevaAutorizacion(): void {
    
    // -- Verificaciones
    
    // Profesional interno
    if(this.profesional_tipo === 'Interno' && this.profesional_interno === ''){
      this.alertService.info('Debe seleccionar un médico interno');
      return;
    }

    // Profesional externo
    if(this.profesional_tipo === 'Externo' && this.profesional_externo === ''){
      this.alertService.info('Debe seleccionar un médico externo');
      return;
    }

    // Medicamento
    if(this.medicamento === ''){
      this.alertService.info('Debe seleccionar un medicamento');
      return;
    }

    // Cantidad
    if(this.cantidad <= 0){
      this.alertService.info('Debe colocar una cantidad válida');
      return;
    }

    this.alertService.loading();


    const data = {
      ficha: this.idFicha,
      profesional_tipo: this.profesional_tipo,
      profesional_externo: this.profesional_tipo === 'Externo' ? this.profesional_externo : '000000000000000000000000',
      profesional_interno: this.profesional_tipo === 'Interno' ? this.profesional_interno : '000000000000000000000000',
      cantidad: this.cantidad,
      medicamento: this.medicamento,
      diagnostico: this.diagnostico,
      creatorUser: this.authService.usuario.userId,
      updatorUser: this.authService.usuario.userId,
    }

    this.autorizacionesMedicamentosService.nuevaAutorizacion(data).subscribe(() => {
      this.listarAutorizaciones();
    },({error})=>{
      this.alertService.errorApi(error.message);  
    });
    
  }

  // Actualizar autorizacion
  actualizarAutorizacion(): void {

    // Cantidad
    if(this.cantidad <= 0){
      this.alertService.info('Debe colocar una cantidad válida');
      return;
    }

    // Profesional interno
    if(this.profesional_tipo === 'Interno' && this.profesional_interno === ''){
      this.alertService.info('Debe seleccionar un médico interno');
      return;
    }

    // Profesional externo
    if(this.profesional_tipo === 'Externo' && this.profesional_externo === ''){
      this.alertService.info('Debe seleccionar un médico externo');
      return;
    }

    // Medicamento
    if(this.medicamento === ''){
      this.alertService.info('Debe seleccionar un medicamento');
      return;
    }

    this.alertService.loading();

    const data = {
      ficha: this.idFicha,
      profesional_tipo: this.profesional_tipo,
      profesional_externo: this.profesional_tipo === 'Externo' ? this.profesional_externo : '000000000000000000000000',
      profesional_interno: this.profesional_tipo === 'Interno' ? this.profesional_interno : '000000000000000000000000',
      cantidad: this.cantidad,
      medicamento: this.medicamento,
      diagnostico: this.diagnostico,
      creatorUser: this.authService.usuario.userId,
      updatorUser: this.authService.usuario.userId,
    }

    this.autorizacionesMedicamentosService.actualizarAutorizacion(this.autorizacionSeleccionada._id, data).subscribe(() => {
      this.listarAutorizaciones();
    },({error})=>{
      this.alertService.errorApi(error.message);
    });
  }

  // Actualizar estado Activo/Inactivo
  actualizarEstado(autorizacion: any): void {
    
    const { _id, activo } = autorizacion;

    this.alertService.question({ msg: '¿Quieres actualizar el estado?', buttonText: 'Actualizar' })
        .then(({isConfirmed}) => {  
          if (isConfirmed) {
            this.alertService.loading();
            this.autorizacionesMedicamentosService.actualizarAutorizacion(_id, {activo: !activo}).subscribe(() => {
              this.alertService.loading();
              this.listarAutorizaciones();
            }, ({error}) => {
              this.alertService.close();
              this.alertService.errorApi(error.message);
            });
          }
        });

  }

  // Reiniciar Internos/Externos
  reiniciarInternosExternos(): void {
    this.profesional_externo = '';
    this.profesional_interno = '';
  }

  // Reiniciando formulario
  reiniciarFormulario(): void {
    this.profesional_tipo = 'Interno';
    this.profesional_interno = '';
    this.profesional_externo = '';
    this.medicamento = '';
    this.cantidad = null;
    this.diagnostico = '';
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
    this.listarAutorizaciones();
  }

}
