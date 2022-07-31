import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { MedicosExternosService } from 'src/app/services/medicos-externos.service';

@Component({
  selector: 'app-medicos-externos',
  templateUrl: './medicos-externos.component.html',
  styles: [
  ]
})
export class MedicosExternosComponent implements OnInit {

  // Permisos de usuarios login
  public permisos = { all: false };

  // Modal
  public showModalMedico = false;

  // Estado formulario 
  public estadoFormulario = 'crear';

  // Medico
  public idMedico: string = '';
  public medicos: any = [];
  public medicoSeleccionado: any;
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
  direccion: 1,  // Asc (1) | Desc (-1)
  columna: 'apellido'
  }

  constructor(private medicosExternosService: MedicosExternosService,
            private authService: AuthService,
            private alertService: AlertService,
            private dataService: DataService) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Dashboard - Medicos externos'; 
    this.permisos.all = this.permisosUsuarioLogin();
    this.alertService.loading();
    this.listarMedicos(); 
  }

  // Asignar permisos de usuario login
  permisosUsuarioLogin(): boolean {
    return this.authService.usuario.permisos.includes('MEDICOS_EXTERNOS_ALL') || this.authService.usuario.role === 'ADMIN_ROLE';
  }

  // Abrir modal
  abrirModal(estado: string, medico: any = null): void {
    window.scrollTo(0,0);
    this.reiniciarFormulario();
    this.apellido = '';
    this.nombre = '';
    this.dni = '';
    this.idMedico = '';
    
    if(estado === 'editar'){
      this.medicoSeleccionado = medico;
      this.apellido = medico.apellido;
      this.nombre = medico.nombre;
      this.dni = medico.dni;
    }

    this.showModalMedico = true;

    this.estadoFormulario = estado;  
  }

  // Listar medicos
  listarMedicos(): void {
    this.medicosExternosService.listarMedicosExternos( 
      this.ordenar.direccion,
      this.ordenar.columna
      )
    .subscribe( ({ medicos }) => {
      this.medicos = medicos.filter(medico => medico._id !== '000000000000000000000000');
      this.showModalMedico = false;
      this.alertService.close();
    }, (({error}) => {
      this.alertService.errorApi(error.msg);
    }));
  }

  // Nuevo medicao
  nuevoMedico(): void {

    // Verificacion: Descripción vacia
    if(this.apellido.trim() === "" || this.nombre.trim() === ""){
      this.alertService.info('Debes colocar apellido y nombre del médico');
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

    this.medicosExternosService.nuevoMedico(data).subscribe(() => {
      this.listarMedicos();
    },({error})=>{
      this.alertService.errorApi(error.message);  
    });
    
  }

  // Actualizar medico
  actualizarMedico(): void {

    // Verificacion: Descripción vacia
    if(this.apellido.trim() === "" || this.nombre.trim() === ""){
      this.alertService.info('Debes colocar apellido y nombre');
      return;
    }

    this.alertService.loading();

    const data = {
      apellido: this.apellido,
      nombre: this.nombre,
      dni: this.dni,
      updatorUser: this.authService.usuario.userId,
    }

    this.medicosExternosService.actualizarMedico(this.medicoSeleccionado._id, data).subscribe(() => {
      this.listarMedicos();
    },({error})=>{
      this.alertService.errorApi(error.message);
    });
  }

  // Actualizar estado Activo/Inactivo
  actualizarEstado(medico: any): void {
    
    const { _id, activo } = medico;

    this.alertService.question({ msg: '¿Quieres actualizar el estado?', buttonText: 'Actualizar' })
        .then(({isConfirmed}) => {  
          if (isConfirmed) {
            this.alertService.loading();
            this.medicosExternosService.actualizarMedico(_id, {activo: !activo}).subscribe(() => {
              this.alertService.loading();
              this.listarMedicos();
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
    this.listarMedicos();
  }

}
