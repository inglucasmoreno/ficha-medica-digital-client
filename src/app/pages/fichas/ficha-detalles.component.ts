import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { add, format, formatDistanceStrict } from 'date-fns';
import { es } from 'date-fns/locale';
import { AlergiasService } from 'src/app/services/alergias.service';
import { AlertService } from 'src/app/services/alert.service';
import { AntecedentesService } from 'src/app/services/antecedentes.service';
import { AuthService } from 'src/app/services/auth.service';
import { CirugiasService } from 'src/app/services/cirugias.service';
import { DataService } from 'src/app/services/data.service';
import { EstudiosService } from 'src/app/services/estudios.service';
import { FichasService } from 'src/app/services/fichas.service';
import { NotasConsultaService } from 'src/app/services/notas-consulta.service';
import { TurnosService } from 'src/app/services/turnos.service';

@Component({
  selector: 'app-ficha-detalles',
  templateUrl: './ficha-detalles.component.html',
  styles: [
  ]
})
export class FichaDetallesComponent implements OnInit {

  // Secciones de datos - Antendentes | Alergias | Cirugias
  public seccion = 'Antecedentes';
  
  // Edad del paciente
  public edad;

  // Modals - Creacion
  public showModalFicha = false;
  public showModalNota = false;
  public showModalAntecedente = false;
  public showModalAlergia = false;
  public showModalCirugia = false;
  public showModalEstudio = false;

  // Modals - Informacion
  public showModalInfoNota = false;
  public showModalInfoAntecedente = false;
  public showModalInfoAlergia = false;
  public showModalInfoCirugia = false;
  public showModalInfoEstudio = false;

  // Modals - Turnos
  public showModalTurnos = false;

  // Turnos
  public turnos: any[];

  // Ficha
  public idFicha: string;
  public ficha: any;
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
  };


  // Notas de conulta
  public notaConsulta: string = '';
  public notasConsulta: any[];
  public notaSeleccionada: any;

  // Antecedentes
  public antecedente: string = '';
  public antecedentes: any[];
  public antecedenteSeleccionado: any;

  // Alergias
  public alergia: string = '';
  public alergias: any[];
  public alergiaSeleccionada: any;

  // Cirugias
  public cirugia: string = '';
  public cirugia_fecha: string = '';
  public cirugia_institucion: string = '';
  public cirugias: any[];
  public cirugiaSeleccionada: any;

  // Estudios
  public estudio: string = '';
  public estudios: any[];
  public laboratorio: string = '';
  public estudioSeleccionado: any;

	// Ordenar
	public ordenar = {
		direccionNotas: -1, 
    direccionAntecedentes: -1,
    direccionAlergias: -1,
    direccionCirugias: -1,
    direccionEstudios: -1,
		columnaNotas: 'createdAt',
    columnaAntecedentes: 'createdAt',
    columnaAlergias: 'createdAt',
    columnaCirugias: 'fecha_realizacion',
    columnaEstudios: 'createdAt'
	}

    // Filtrado de turnos
	public filtroTurnos = {
		estado: '',
		parametro: ''
	}

    // Ordenar turnos
	public ordenarTurnos = {
		direccion: -1,  // Asc (1) | Desc (-1)
		columna: 'createdAt'
	}

  constructor(private activatedRoute: ActivatedRoute,
              public authService: AuthService,
              private dataService: DataService,
              private notasConsultaService: NotasConsultaService,
              private alergiasService: AlergiasService,
              private turnosService: TurnosService,
              private antecedentesService: AntecedentesService,
              private cirugiasService: CirugiasService,
              private estudiosService: EstudiosService,
              private alertService: AlertService,
              private fichasService: FichasService) { }


  // Inicio de componente
  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Dashboard - Detalle de ficha';
    this.activatedRoute.params.subscribe( ({id}) => {
      this.idFicha = id;
      this.obtenerInformacion();
    });
  }

  // Obtener informacion - Inicio de componente
  obtenerInformacion(): void {
    this.alertService.loading();
    
    // Listado de notas de consulta
    this.fichasService.getFicha(this.idFicha).subscribe({
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

        // Calculando edad del paciente
        const hoy = new Date();
        const nacimiento = new Date(fecha_nacimiento);

        this.edad = formatDistanceStrict(
          hoy,
          nacimiento,
          {locale: es}
        )
        
        // Adaptando fecha
        fecha_nacimiento = format(new Date(fecha_nacimiento), 'yyyy-MM-dd');

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
        
        this.notasConsultaService.getNotasPorFicha(
          this.idFicha,
          this.ordenar.direccionNotas, 
          this.ordenar.columnaNotas
        ).subscribe({
        
        next: ({notas}) => {
          
          this.notasConsulta = notas;
          
          // Listado de antecedentes
          this.antecedentesService.getAntecedentesPorFicha(
            this.idFicha, 
            this.ordenar.direccionAntecedentes,
            this.ordenar.columnaAntecedentes
            ).subscribe({
              next: ({antecedentes}) => {
              this.antecedentes = antecedentes;
              this.alergiasService.getAlergiasPorFicha(
                this.idFicha, 
                this.ordenar.direccionAntecedentes,
                this.ordenar.columnaAntecedentes
                ).subscribe({
                next: ({alergias}) => {
                  this.alergias = alergias;
                  this.cirugiasService.getCirugiasPorFicha(
                    this.idFicha, 
                    this.ordenar.direccionAlergias,
                    this.ordenar.columnaAlergias
                    ).subscribe({
                    next: ({cirugias}) => {
                      this.cirugias = cirugias;
                      this.estudiosService.getEstudiosPorFicha(
                        this.idFicha, 
                        this.ordenar.direccionCirugias,
                        this.ordenar.columnaCirugias
                        ).subscribe({
                        next: ({estudios}) => {
                          this.estudios = estudios;
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
          
        },
        error: ({error}) => {
          this.alertService.errorApi(error.message);
        } 
      }) 
      },
      error: ({error}) => {
        this.alertService.errorApi(error.msg);
      }
    })
  }


  // Obtener datos de ficha
  obtenerFicha(): void {
    this.fichasService.getFicha(this.idFicha).subscribe({
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

        fecha_nacimiento = format(new Date(fecha_nacimiento), 'yyyy-MM-dd');

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
        this.showModalFicha = false;
        this.alertService.close();
      },
      error: ({error}) => {
        this.alertService.errorApi(error.message);
      }
    })
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

  // Actualizar ficha
  actualizarFicha(): void {

    if(this.verificarDatos()){
      this.alertService.info('Completar los campos obligatorios');
      return;
    }

    this.dataFicha.fecha_nacimiento = add(new Date(this.dataFicha.fecha_nacimiento), {hours: 3});
    this.dataFicha.updatorUser = this.authService.usuario.userId;
      
    this.alertService.loading();

    this.fichasService.actualizarFicha(this.idFicha, this.dataFicha).subscribe({
      next: () => {
        this.obtenerFicha();
      },
      error: ({error}) => {
        this.alertService.errorApi(error.message);
      }
    });

  }

  // Listando notas de consulta
  listarNotasConsulta(): void {
    this.alertService.loading();
    this.notasConsultaService.getNotasPorFicha(
        this.idFicha,
        this.ordenar.direccionNotas, 
        this.ordenar.columnaNotas
      ).subscribe({
      
      next: ({notas}) => {
        this.notasConsulta = notas;
        this.alertService.close();
      },
      
      error: ({error}) => {
        this.alertService.errorApi(error.message);
      }
    
    })
  }

  // Listando antecedentes
  listarAntecedentes(): void {
    this.alertService.loading();
    this.antecedentesService.getAntecedentesPorFicha(
      this.idFicha, 
      this.ordenar.direccionAntecedentes,
      this.ordenar.columnaAntecedentes
      ).subscribe({
      next: ({antecedentes}) => {
        this.antecedentes = antecedentes;
        this.alertService.close();
      },
      error: ({error}) => {
        this.alertService.errorApi(error.message);
      }
    }); 
  }

  // Listando alergias
  listarAlergias(): void {
    this.alertService.loading();
    this.alergiasService.getAlergiasPorFicha(
      this.idFicha, 
      this.ordenar.direccionAlergias,
      this.ordenar.columnaAlergias
      ).subscribe({
      next: ({alergias}) => {
        this.alergias = alergias;
        this.alertService.close();
      },
      error: ({error}) => {
        this.alertService.errorApi(error.message);
      }
    }); 
  }

  // Listando cirugias
  listarCirugias(): void {
    this.alertService.loading();
    this.cirugiasService.getCirugiasPorFicha(
      this.idFicha, 
      this.ordenar.direccionCirugias,
      this.ordenar.columnaCirugias
      ).subscribe({
      next: ({cirugias}) => {
        this.cirugias = cirugias;
        this.alertService.close();
      },
      error: ({error}) => {
        this.alertService.errorApi(error.message);
      }
    }); 
  }

  // Listando estudios
  listarEstudios(): void {
    this.alertService.loading();
    this.estudiosService.getEstudiosPorFicha(
      this.idFicha, 
      this.ordenar.direccionEstudios,
      this.ordenar.columnaEstudios
      ).subscribe({
      next: ({estudios}) => {
        this.estudios = estudios;
        this.alertService.close();
      },
      error: ({error}) => {
        this.alertService.errorApi(error.message);
      }
    }); 
  }

  // Crear nueva nota de consulta
  crearNotaConsulta(): void {
    
    if(this.notaConsulta.trim() === ''){
      this.alertService.info('Debes colocarle contenido a la nota');
      return;
    }

    this.alertService.loading();
    
    const data = {
      ficha: this.idFicha,
      descripcion: this.notaConsulta,
      creatorUser: this.authService.usuario.userId,
      updatorUser: this.authService.usuario.userId,
    };
    
    this.notasConsultaService.nuevaNota(data).subscribe({
      next: () => {
        this.reiniciarFormularios()
        this.showModalNota = false;
        this.listarNotasConsulta();
      },
      error: ({error}) => {
        this.alertService.errorApi(error.message)
      }
    })
  
  }

  // Crear antecedente
  crearAntecedente(): void {
    
    if(this.antecedente.trim() === ''){
      this.alertService.info('Debes colocar los datos de la nota');
      return;
    }

    this.alertService.loading();
    
    const data = {
      ficha: this.idFicha,
      descripcion: this.antecedente,
      creatorUser: this.authService.usuario.userId,
      updatorUser: this.authService.usuario.userId,
    };
    
    this.antecedentesService.nuevoAntecedente(data).subscribe({
      next: () => {
        this.reiniciarFormularios()
        this.showModalAntecedente = false;
        this.listarAntecedentes();
      },
      error: ({error}) => {
        this.alertService.errorApi(error.message)
      }
    })
  
  }

  // Crear alergia
  crearAlergia(): void {
  
    if(this.alergia.trim() === ''){
      this.alertService.info('Debes completar los datos de la alergia');
      return;
    }

    this.alertService.loading();
    
    const data = {
      ficha: this.idFicha,
      tipo_alergia: this.alergia,
      creatorUser: this.authService.usuario.userId,
      updatorUser: this.authService.usuario.userId,
    };
    
    this.alergiasService.nuevaAlergia(data).subscribe({
      next: () => {
        this.reiniciarFormularios()
        this.showModalAlergia = false;
        this.listarAlergias();
      },
      error: ({error}) => {
        this.alertService.errorApi(error.message)
      }
    })
  
  }

  // Crear cirugia
  crearCirugia(): void {

    if(this.cirugia.trim() === '' || 
      this.cirugia_fecha.trim() === ''
    ){
      this.alertService.info('Debes completar los datos de la cirugia');
      return;
    }

    this.alertService.loading();
    
    const data = {
      ficha: this.idFicha,
      tipo_cirugia: this.cirugia,
      institucion: this.cirugia_institucion,
      fecha_realizacion: add(new Date(this.cirugia_fecha),{ hours: 3 }),
      creatorUser: this.authService.usuario.userId,
      updatorUser: this.authService.usuario.userId,
    };
    
    this.cirugiasService.nuevaCirugia(data).subscribe({
      next: () => {
        this.reiniciarFormularios()
        this.showModalCirugia = false;
        this.listarCirugias();
      },
      error: ({error}) => {
        this.alertService.errorApi(error.message)
      }
    })
  
  }

  // Crear estudio
  crearEstudio(): void {

    if(this.estudio.trim() === ''){
      this.alertService.info('Debes colocarle una descripción al estudio');
      return;
    }

    this.alertService.loading();
    
    const data = {
      ficha: this.idFicha,
      descripcion: this.estudio,
      laboratorio: this.laboratorio,
      creatorUser: this.authService.usuario.userId,
      updatorUser: this.authService.usuario.userId,
    };
    
    this.estudiosService.nuevoEstudio(data).subscribe({
      next: () => {
        this.reiniciarFormularios()
        this.showModalEstudio = false;
        this.listarEstudios();
      },
      error: ({error}) => {
        this.alertService.errorApi(error.message)
      }
    })
  
  }

  // Buscar turnos
  buscarTurnos(): void {
    this.alertService.loading();
    this.turnosService.listarTurnosPorFicha(this.ordenarTurnos.direccion, this.ordenarTurnos.columna, this.idFicha).subscribe({
      next: ({turnos}) => {
        this.turnos = turnos;
        this.showModalTurnos = true;
        this.alertService.close();
      },
      error: ({error}) => {
        this.alertService.errorApi(error);
      }
    });
  }

  // Abrir modal - Datos de ficha
  abrirModalFicha(): void {
    this.reiniciarFormularios();
    this.showModalFicha = true;
  }

  // Abrir modal - Nota de consulta
  abrirModalNota(): void {
    this.reiniciarFormularios();
    this.showModalNota = true;
  }

  // Abrir modal - Antecendetes
  abrirModalAntecedentes(): void {
    this.reiniciarFormularios();
    this.showModalAntecedente = true;
  }

  // Abrir modal - Alergias
  abrirModalAlergias(): void {
    this.reiniciarFormularios();
    this.showModalAlergia = true;
  }

  // Abrir modal - Cirugias
  abrirModalCirugias(): void {
    this.reiniciarFormularios();
    this.showModalCirugia = true;
  }

  // Abrir modal - Estudios
  abrirModalEstudios(): void {
    this.reiniciarFormularios();
    this.showModalEstudio = true;
  }

  // Abrir modal - Informacion - Nota de consulta
  abrirInfoNota(nota: any): void {
    this.notaSeleccionada = nota;
    this.showModalInfoNota = true;
  }

  // Abrir modal - Informacion - Antecedentes
  abrirInfoAntecedente(antecedente: any): void {
    this.antecedenteSeleccionado = antecedente;
    this.showModalInfoAntecedente = true;
  }

  // Abrir modal - Informacion - Alergia
  abrirInfoAlergia(alergia: any): void {
    this.alergiaSeleccionada = alergia;
    this.showModalInfoAlergia = true;
  }

  // Abrir modal - Informacion - Cirugia
  abrirInfoCirugia(cirugia: any): void {
    this.cirugiaSeleccionada = cirugia;
    this.showModalInfoCirugia = true;
  }

  // Abrir modal - Informacion - Estudios
  abrirInfoEstudio(estudio: any): void {
    this.estudioSeleccionado = estudio;
    this.showModalInfoEstudio = true;
  }

  // Abrir modal turnos
  abrirModalTurnos(): void {
    this.filtroTurnos.estado = '';
    this.ordenarTurnos = {
      direccion: -1,  // Asc (1) | Desc (-1)
      columna: 'createdAt'
    }
    this.turnos = [];
    this.buscarTurnos();
  }
  

  // Reiniciar formularios
  reiniciarFormularios(): void {
    this.notaConsulta = '';  
    this.antecedente = '';
    this.alergia = '';
    this.cirugia_fecha = '';
    this.cirugia = '';
    this.cirugia_institucion = '';
    this.estudio = '';
    this.laboratorio = '';
  }

  // Ordenar por columna - Notas de consulta
  ordenarPorColumnaNotas(columna: string){
    this.ordenar.columnaNotas = columna;
    this.ordenar.direccionNotas = this.ordenar.direccionNotas == 1 ? -1 : 1;
    this.alertService.loading();
    this.listarNotasConsulta();
  }

  // Ordenar por columna - Antecedentes
  ordenarPorColumnaAntecedentes(columna: string){
    this.ordenar.columnaAntecedentes = columna;
    this.ordenar.direccionAntecedentes = this.ordenar.direccionAntecedentes == 1 ? -1 : 1;
    this.alertService.loading();
    this.listarAntecedentes();
  }

  // Ordenar por columna - Alergias
  ordenarPorColumnaAlergias(columna: string){
    this.ordenar.columnaAlergias = columna;
    this.ordenar.direccionAlergias = this.ordenar.direccionAlergias == 1 ? -1 : 1;
    this.alertService.loading();
    this.listarAlergias();
  }

  // Ordenar por columna - Cirugias
  ordenarPorColumnaCirugias(columna: string){
    this.ordenar.columnaCirugias = columna;
    this.ordenar.direccionCirugias = this.ordenar.direccionCirugias == 1 ? -1 : 1;
    this.alertService.loading();
    this.listarCirugias();
  }

  // Ordenar por columna - Estudios
  ordenarPorColumnaEstudios(columna: string){
    this.ordenar.columnaEstudios = columna;
    this.ordenar.direccionEstudios = this.ordenar.direccionEstudios == 1 ? -1 : 1;
    this.alertService.loading();
    this.listarEstudios();
  }

  // Ordenar por columna turnos
  ordenarPorColumnaTurnos(columna: string){
    this.ordenarTurnos.columna = columna;
    this.ordenarTurnos.direccion = this.ordenarTurnos.direccion == 1 ? -1 : 1;
    this.buscarTurnos();
  }

}
