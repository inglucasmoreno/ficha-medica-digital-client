import { Component, OnInit } from '@angular/core';
import { add, format } from 'date-fns';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { FichasService } from 'src/app/services/fichas.service';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Component({
  selector: 'app-fichas',
  templateUrl: './fichas.component.html',
  styles: [
  ]
})
export class FichasComponent implements OnInit {
	
  // Permisos de usuarios login
	public permisos = { all: false };
  public permiso_escritura = ['FICHAS_ALL'];

	// Modal
	public showModalFicha = false;

	// Estado formulario
	public estadoFormulario = 'crear';

	// Unidades de medida
  public ficha: any;
	public idFicha: string = '';
	public fichas: any = [];
  
  public dataFicha: any = { 
    apellido: '',
    nombre: '',
    dni: '',
    nro_afiliado: '',
    fecha_nacimiento: '',
    grupo_sanguineo: '',
    rh: '',
    creatorUser: '',
    updatorUser: '',  
  }

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
		columna: 'apellido'
	}

	constructor(private fichasService : FichasService,
					    private authService: AuthService,
					    private alertService: AlertService,
					    private dataService: DataService) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Dashboard - Fichas';
    this.dataService.showMenu = false;
    this.alertService.loading();
    this.listarFichas();
    console.log(this.authService.usuario);
  }

  // Abrir modal
  abrirModal(estado: string, ficha: any = null): void {
    window.scrollTo(0,0);
    this.reiniciarFormulario();
    this.descripcion = '';

    if(estado === 'editar') this.getFicha(ficha);
    else this.showModalFicha = true;

    this.estadoFormulario = estado;
  }

  // Obtener ficha
  getFicha(ficha: any): void {
    this.idFicha = ficha._id;
    this.alertService.loading();
    this.fichasService.getFicha(ficha._id).subscribe({

      next: ({ficha}) => {

        this.ficha = ficha;

        let { 
          apellido, 
          nombre, 
          dni, 
          nro_afiliado, 
          fecha_nacimiento, 
          grupo_sanguineo, 
          rh, 
          creatorUser, 
          updatorUser } = ficha;
         
        // Adaptando fecha
        fecha_nacimiento = format(add(new Date(fecha_nacimiento), {hours: 3}), 'yyyy-MM-dd')

        this.dataFicha = {
          apellido,
          nombre,
          dni,
          nro_afiliado,
          fecha_nacimiento,
          grupo_sanguineo,
          rh,
          creatorUser,
          updatorUser,      
        }

        this.alertService.close();
        this.showModalFicha = true;
      },

      error: ({error}) => {
        this.alertService.errorApi(error.msg);
      }

    });

  }

  // Listar fichas
  listarFichas(): void {
  this.fichasService.listarFichas(
    this.ordenar.direccion,
    this.ordenar.columna
  )
  .subscribe({

      next: ({ fichas }) => {
        this.fichas = fichas;
        this.showModalFicha = false;
        this.alertService.close();
      },

      error: ({error}) => {
        this.alertService.errorApi(error.message);
      }

   });
  }

  // Verificar datos
  verificarDatos(): boolean {

    const {
      apellido,
      nombre,
      dni,
      nro_afiliado,
      fecha_nacimiento
    } = this.dataFicha;
    
    const verificacion = apellido.trim() === '' ||
                         nombre.trim() === '' ||
                         dni.trim() === '' ||
                         nro_afiliado.trim() === '' ||
                         fecha_nacimiento.trim() === ''

    if(verificacion) return true;
    else return false;

  }

  // Nueva ficha
  nuevaFicha(): void {

    if(this.verificarDatos()){
      this.alertService.info('Completar los campos obligatorios');
      return;
    }

    this.verificarDatos();

    this.alertService.loading();

    this.dataFicha.creatorUser = this.authService.usuario.userId;
    this.dataFicha.updatorUser = this.authService.usuario.userId;

    // Adaptacion de fecha de nacimiento
    this.dataFicha.fecha_nacimiento = add(new Date(this.dataFicha.fecha_nacimiento), {hours: 3});

    this.fichasService.nuevaFicha(this.dataFicha).subscribe({

      next: () => {
        this.listarFichas();
      },
      
      error: ({error}) => {
        this.alertService.errorApi(error.message);
      }

    });

  }

  // Actualizar ficha
  actualizarFicha(): void {

    if(this.verificarDatos()){
      this.alertService.info('Completar los campos obligatorios');
      return;
    }

    // Adaptacion de fecha de nacimiento
    this.dataFicha.fecha_nacimiento = add(new Date(this.dataFicha.fecha_nacimiento), {hours: 3});

    // Se coloca el usuario actualizador
    this.dataFicha.updatorUser = this.authService.usuario.userId;
      
    this.alertService.loading();

    this.fichasService.actualizarFicha(this.idFicha, this.dataFicha).subscribe({
      next: () => {
        this.listarFichas();
      },
      error: ({error}) => {
        this.alertService.errorApi(error.message);
      }
    });

  }

  // Actualizar estado Activo/Inactivo
  actualizarEstado(unidad: any): void {

    const { _id, activo } = unidad;

    const {permisos, role} = this.authService.usuario;

    console.log(permisos.includes('FICHAS_ALL'));

    const verificacionPermisos = !permisos.includes('FICHAS_ALL') && role !== 'ADMIN_ROLE';

    if(verificacionPermisos) return this.alertService.info('Usted no tiene permiso para realizar esta acción');

    this.alertService.question({ msg: '¿Quieres actualizar el estado?', buttonText: 'Actualizar' })
        .then(({isConfirmed}) => {
          if (isConfirmed) {
                
            const data = {
              activo: !activo,
              updatorUser: this.authService.usuario.userId
            };
            
            this.alertService.loading();
            this.fichasService.actualizarFicha(_id, data).subscribe({
            
              next: () => {
                this.listarFichas();
              },
              
              error: ({error}) => {
                this.alertService.errorApi(error.message);
              }
            
            });
          }
        });
  }

  // Reiniciando formulario
  reiniciarFormulario(): void {
    this.dataFicha = { 
      apellido: '',
      nombre: '',
      dni: '',
      nro_afiliado: '',
      fecha_nacimiento: '',
      grupo_sanguineo: '',
      rh: '',
      creatorUser: '',
      updatorUser: '',  
    }
  }

  // Imprimir reporte
  imprimirReporte(): void {
    this.alertService.loading();
    this.fichasService.reportesFichas(this.fichas).subscribe({
      next: () => {
        window.open(`${base_url}/pdf/reporte_fichas_medicas.pdf`, '_blank');  
        this.alertService.close();
      },
      error: ({error}) => {
        this.alertService.errorApi(error.message);
      }
    })
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
    this.listarFichas();
  }
}
