import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { MedicamentosService } from 'src/app/services/medicamentos.service';

@Component({
  selector: 'app-medicamentos',
  templateUrl: './medicamentos.component.html',
  styles: [
  ]
})
export class MedicamentosComponent implements OnInit {

// Permisos de usuarios login
public permisos = { all: false };

// Modal
public showModalMedicamento = false;

// Estado formulario 
public estadoFormulario = 'crear';

// Medicamento
public idMedicamento: string = '';
public medicamentos: any = [];
public medicamentoSeleccionado: any;
public descripcion: string = '';

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
  columna: 'descripcion'
}

constructor(private medicamentosService: MedicamentosService,
            private authService: AuthService,
            private alertService: AlertService,
            private dataService: DataService) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Dashboard - Medicamentos'; 
    this.permisos.all = this.permisosUsuarioLogin();
    this.alertService.loading();
    this.listarMedicamentos(); 
  }

  // Asignar permisos de usuario login
  permisosUsuarioLogin(): boolean {
    return this.authService.usuario.permisos.includes('MEDICAMENTOS_ALL') || this.authService.usuario.role === 'ADMIN_ROLE';
  }

  // Abrir modal
  abrirModal(estado: string, medicamento: any = null): void {
    window.scrollTo(0,0);
    this.reiniciarFormulario();
    this.descripcion = '';
    this.idMedicamento = '';
    
    if(estado === 'editar') this.getMedicamento(medicamento);
    else this.showModalMedicamento = true;

    this.estadoFormulario = estado;  
  }

  // Traer datos de medicamento
  getMedicamento(medicamento: any): void {
    this.alertService.loading();
    this.idMedicamento = medicamento._id;
    this.medicamentoSeleccionado = medicamento;
    this.medicamentosService.getMedicamento(medicamento._id).subscribe(({medicamento}) => {
      this.descripcion = medicamento.descripcion;
      this.alertService.close();
      this.showModalMedicamento = true;
    },({error})=>{
      this.alertService.errorApi(error);
    });
  }

  // Listar medicamento
  listarMedicamentos(): void {
    this.medicamentosService.listarMedicamentos( 
      this.ordenar.direccion,
      this.ordenar.columna
      )
    .subscribe( ({ medicamentos }) => {
      this.medicamentos = medicamentos;
      this.showModalMedicamento = false;
      this.alertService.close();
    }, (({error}) => {
      this.alertService.errorApi(error.msg);
    }));
  }

  // Nuevo medicamento
  nuevoMedicamento(): void {

    // Verificacion: Descripci??n vacia
    if(this.descripcion.trim() === ""){
      this.alertService.info('Debes colocar una descripci??n');
      return;
    }

    this.alertService.loading();

    const data = {
      descripcion: this.descripcion,
      creatorUser: this.authService.usuario.userId,
      updatorUser: this.authService.usuario.userId,
    }

    this.medicamentosService.nuevoMedicamento(data).subscribe(() => {
      this.listarMedicamentos();
    },({error})=>{
      this.alertService.errorApi(error.message);  
    });
    
  }

  // Actualizar medicamento
  actualizarMedicamento(): void {

    // Verificacion: Descripci??n vacia
    if(this.descripcion.trim() === ""){
      this.alertService.info('Debes colocar una descripci??n');
      return;
    }

    this.alertService.loading();

    const data = {
      descripcion: this.descripcion,
      updatorUser: this.authService.usuario.userId,
    }

    this.medicamentosService.actualizarMedicamento(this.idMedicamento, data).subscribe(() => {
      this.listarMedicamentos();
    },({error})=>{
      this.alertService.errorApi(error.message);
    });
  }

  // Actualizar estado Activo/Inactivo
  actualizarEstado(medicamento: any): void {
    
    const { _id, activo } = medicamento;

    this.alertService.question({ msg: '??Quieres actualizar el estado?', buttonText: 'Actualizar' })
        .then(({isConfirmed}) => {  
          if (isConfirmed) {
            this.alertService.loading();
            this.medicamentosService.actualizarMedicamento(_id, {activo: !activo}).subscribe(() => {
              this.alertService.loading();
              this.listarMedicamentos();
            }, ({error}) => {
              this.alertService.close();
              this.alertService.errorApi(error.message);
            });
          }
        });

  }

  // Reiniciando formulario
  reiniciarFormulario(): void {
    this.descripcion = '';  
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
    this.listarMedicamentos();
  }

}
