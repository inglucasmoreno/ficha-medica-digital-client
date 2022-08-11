import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { InicializacionService } from 'src/app/services/inicializacion.service';
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

// Flag y mensaje de estado
public flag_fichas_importadas = false;
public mensaje = '';

// Archivos para importacion
public file: any;
public archivoSubir: any;

// Modal
public showModalMedicamento = false;
public showModalImportarMedicamentos = false;

// Estado formulario 
public estadoFormulario = 'crear';

// Medicamento
public idMedicamento: string = '';
public medicamentos: any = [];
public medicamentoSeleccionado: any;
public descripcion: string = '';
public nombre_comercial: string = '';

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
  columna: 'nombre_comercial'
}

constructor(private medicamentosService: MedicamentosService,
            private inicializacionService: InicializacionService,
            public authService: AuthService,
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
    this.nombre_comercial = '';
    this.idMedicamento = '';
    
    if(estado === 'editar'){
      this.medicamentoSeleccionado = medicamento;
      this.nombre_comercial = medicamento.nombre_comercial;
      this.descripcion = medicamento.descripcion;
    }

    this.showModalMedicamento = true;

    this.estadoFormulario = estado;  
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

    // Verificacion: Descripción vacia
    if(this.nombre_comercial.trim() === ""){
      this.alertService.info('Debes colocar un nombre comercial');
      return;
    }

    // Verificacion: Descripción vacia
    if(this.descripcion.trim() === ""){
      this.alertService.info('Debes colocar una descripción');
      return;
    }

    this.alertService.loading();

    const data = {
      descripcion: this.descripcion,
      nombre_comercial: this.nombre_comercial,
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

    // Verificacion: Descripción vacia
    if(this.nombre_comercial.trim() === ""){
      this.alertService.info('Debes colocar un nombre comercial');
      return;
    }

    // Verificacion: Descripción vacia
    if(this.descripcion.trim() === ""){
      this.alertService.info('Debes colocar una descripción');
      return;
    }

    this.alertService.loading();

    const data = {
      nombre_comercial: this.nombre_comercial,
      descripcion: this.descripcion,
      updatorUser: this.authService.usuario.userId,
    }

    this.medicamentosService.actualizarMedicamento(this.medicamentoSeleccionado._id, data).subscribe(() => {
      this.listarMedicamentos();
    },({error})=>{
      this.alertService.errorApi(error.message);
    });
  }

  // Actualizar estado Activo/Inactivo
  actualizarEstado(medicamento: any): void {
    
    const { _id, activo } = medicamento;

    this.alertService.question({ msg: '¿Quieres actualizar el estado?', buttonText: 'Actualizar' })
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

  // Capturando archivo de importacion
  capturarArchivo(event: any): void {
    if(event.target.files[0]){
      // Se capatura el archivo
      this.archivoSubir = event.target.files[0];
  
      // Se verifica el formato - Debe ser un excel
      const formato = this.archivoSubir.type.split('/')[1];
      const condicion = formato !== 'vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  
      if(condicion){
        this.file = null;
        this.archivoSubir = null;
        return this.alertService.info('Debes seleccionar un archivo de excel');      
      }
    }
  }

  // Abrir modal de importacion de fichas
  abrirImportarMedicamentos(): void {
    this.file = null;
    this.showModalImportarMedicamentos = true;
  }

  // Importar medicamentos
  importarMedicamentos(): void {

    if(!this.file) return this.alertService.info('Debe seleccionar un archivo de excel');

    this.alertService.loading();
    const formData =  new FormData();
    formData.append('file', this.archivoSubir); // FormData -> key = 'file' y value = Archivo

    this.inicializacionService.importarMedicamentos(formData, this.authService.usuario.userId).subscribe({
      next: ({msg}) => {
        this.mensaje = msg;
        this.flag_fichas_importadas = true;
        this.listarMedicamentos();        
      },
      error: ({error}) => {
        this.alertService.errorApi(error.message);
      }
    })

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
