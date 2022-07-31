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

  // Permisos de usuarios login
  public permisos = { all: false };

  // Modal
  public showModalAutorizacion = false;

  // Estado formulario 
  public estadoFormulario = 'crear';

  // Ficha
  public idFicha;
  public ficha;

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
          this.autorizacionesMedicamentosService.listarAutorizaciones(
            this.ordenar.direccion,
            this.ordenar.columna
          ).subscribe({
            next: ({autorizaciones}) => {
              this.autorizaciones = autorizaciones;
              console.log(autorizaciones);
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
    this.apellido = '';
    this.nombre = '';
    this.dni = '';
    this.idAutorizacion = '';
    
    if(estado === 'editar'){
      this.autorizacionSeleccionada = autorizacion;
      this.apellido = autorizacion.apellido;
      this.nombre = autorizacion.nombre;
      this.dni = autorizacion.dni;
    }

    this.showModalAutorizacion = true;

    this.estadoFormulario = estado;  
  }

  // Listar autorizaciones
  listarAutorizaciones(): void {
    this.autorizacionesMedicamentosService.listarAutorizaciones( 
      this.ordenar.direccion,
      this.ordenar.columna
      )
    .subscribe( ({ autorizaciones }) => {
      this.autorizaciones = autorizaciones;
      console.log(autorizaciones);
      this.showModalAutorizacion = false;
      this.alertService.close();
    }, (({error}) => {
      this.alertService.errorApi(error.msg);
    }));
  }

  // Nueva autorizacion
  nuevaAutorizacion(): void {

    // Verificacion: Descripción vacia
    if(this.apellido.trim() === "" || this.nombre.trim() === ""){
      this.alertService.info('Debes completar los datos obligatorios');
      return;
    }

    this.alertService.loading();

    const data = {
      apellido: this.apellido,
      nombre: this.nombre,
      dni: this.dni,
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

    // Verificacion: Descripción vacia
    if(this.apellido.trim() === "" || this.nombre.trim() === ""){
      this.alertService.info('Debes completar los campos obligatorios');
      return;
    }

    this.alertService.loading();

    const data = {
      apellido: this.apellido,
      nombre: this.nombre,
      dni: this.dni,
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

  // Reiniciando formulario
  reiniciarFormulario(): void {
    this.apellido = '';
    this.nombre = '';  
    this.dni = '';  
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
