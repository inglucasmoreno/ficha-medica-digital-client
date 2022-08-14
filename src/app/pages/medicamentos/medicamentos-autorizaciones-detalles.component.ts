import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { AutorizacionesMedicamentosService } from 'src/app/services/autorizaciones-medicamentos.service';
import { DataService } from 'src/app/services/data.service';
import { FichasService } from 'src/app/services/fichas.service';
import { MedicamentosService } from 'src/app/services/medicamentos.service';

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
  public showModalMedicamentos = false;

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
  public medicamentoSeleccionado = null;

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

  // Paginacion - Medicamentos
  public totalItems: number;
  public desde: number = 0;
  public paginaActualMedicamentos: number = 1;
  public cantidadItemsMedicamentos: number = 10;

  // Filtrado
  public filtro = {
    activo: 'true',
    parametro: ''
  }

  public filtroMedicamentos = {
    parametro: ''
  }

  // Ordenar
  public ordenar = {
    direccion: -1,  // Asc (1) | Desc (-1)
    columna: 'createdAt'
  }

  // Ordenar
  public ordenarMedicamentos = {
    direccion: 1,  // Asc (1) | Desc (-1)
    columna: 'descripcion'
  }

  constructor(private autorizacionesMedicamentosService: AutorizacionesMedicamentosService,
              private medicamentosService: MedicamentosService,
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
              const { medicos_externos, medicos_internos, autorizaciones } = res.resultados;
              this.medicosExternos = medicos_externos;
              this.medicosInternos = medicos_internos;
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

  // Listar medicamento
  listarMedicamentos(): void {
    this.medicamentosService.listarMedicamentos( 
      this.ordenarMedicamentos.direccion,
      this.ordenarMedicamentos.columna,
      this.desde,
      this.cantidadItemsMedicamentos,
      'true',
      this.filtroMedicamentos.parametro
      )
    .subscribe( ({ medicamentos, totalItems }) => {
      this.totalItems = totalItems;
      this.medicamentos = medicamentos;
      this.showModalAutorizacion = false;
      this.showModalMedicamentos = true;
      this.alertService.close();
    }, (({error}) => {
      this.alertService.errorApi(error.msg);
    }));
  }

  // Abrir modal
  abrirModal(estado: string, autorizacion: any = null): void {
    window.scrollTo(0,0);
    this.reiniciarFormulario();
    this.idAutorizacion = '';
    
    this.autorizacionSeleccionada = autorizacion;

    if(estado === 'editar'){
      this.medicamentoSeleccionado = autorizacion.medicamento;
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

  // Abrir modal - Medicamentos
  abrirMedicamentos(): void {
    this.alertService.loading();
    this.desde = 0;
    this.paginaActualMedicamentos = 1;
    this.cantidadItemsMedicamentos = 10;
    this.filtroMedicamentos.parametro = '';
    this.listarMedicamentos();
  }

  // Cerrar medicamentos
  cerrarMedicamentos(): void {
    this.showModalMedicamentos = false;
    this.showModalAutorizacion = true;
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
    if(!this.medicamentoSeleccionado){
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
      medicamento: this.medicamentoSeleccionado._id,
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
    if(!this.medicamentoSeleccionado){
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
      medicamento: this.medicamentoSeleccionado,
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

  // Seleccionar medicamento
  seleccionarMedicamento(medicamento: any): void {
    this.medicamentoSeleccionado = medicamento;
    this.showModalMedicamentos = false;
    this.showModalAutorizacion = true;
  }

  // Reiniciar Internos/Externos
  reiniciarInternosExternos(): void {
    this.profesional_externo = '';
    this.profesional_interno = '';
  }

  // Reiniciando formulario
  reiniciarFormulario(): void {
    this.profesional_tipo = 'Interno';
    this.medicamentoSeleccionado = null;
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
  
  // Cambiar cantidad de items
  cambiarCantidadItems(): void {
    this.paginaActualMedicamentos = 1
    this.cambiarPagina(1);
  }

  // Paginacion - Cambiar pagina
  cambiarPagina(nroPagina): void {
    this.paginaActualMedicamentos = nroPagina;
    this.desde = (this.paginaActualMedicamentos - 1) * this.cantidadItemsMedicamentos;
    this.alertService.loading();
    this.listarMedicamentos();
  }

}
