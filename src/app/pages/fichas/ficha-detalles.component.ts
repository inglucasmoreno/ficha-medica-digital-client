import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { add } from 'date-fns';
import { AlergiasService } from 'src/app/services/alergias.service';
import { AlertService } from 'src/app/services/alert.service';
import { AntecedentesService } from 'src/app/services/antecedentes.service';
import { AuthService } from 'src/app/services/auth.service';
import { CirugiasService } from 'src/app/services/cirugias.service';
import { EstudiosService } from 'src/app/services/estudios.service';
import { FichasService } from 'src/app/services/fichas.service';
import { NotasConsultaService } from 'src/app/services/notas-consulta.service';

@Component({
  selector: 'app-ficha-detalles',
  templateUrl: './ficha-detalles.component.html',
  styles: [
  ]
})
export class FichaDetallesComponent implements OnInit {

  // Secciones de datos - Antendentes | Alergias | Cirugias
  public seccion = 'Antecedentes';

  // Modals
  public showModalNota = false;
  public showModalAntecedente = false;
  public showModalAlergia = false;
  public showModalCirugia = false;
  public showModalEstudio = false;

  // Ficha
  public idFicha: string;
  public ficha: any;
  
  // Notas de conulta
  public notaConsulta: string = '';
  public notasConsulta: any[];

  // Antecedentes
  public antecedente: string = '';
  public antecedentes: any[];

  // Alergias
  public alergia: string = '';
  public alergias: any[];

  // Cirugias
  public cirugia: string = '';
  public cirugia_fecha: string = '';
  public cirugia_institucion: string = '';
  public cirugias: any[];

  // Estudios
  public estudio: string = '';
  public estudios: any[];
  public laboratorio: string = '';

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


  constructor(private activatedRoute: ActivatedRoute,
              private authService: AuthService,
              private notasConsultaService: NotasConsultaService,
              private alergiasService: AlergiasService,
              private antecedentesService: AntecedentesService,
              private cirugiasService: CirugiasService,
              private estudiosService: EstudiosService,
              private alertService: AlertService,
              private fichaService: FichasService) { }


  // Inicio de componente
  ngOnInit(): void {
    this.activatedRoute.params.subscribe( ({id}) => {
      this.idFicha = id;
      this.obtenerInformacion();
    });
  }

  // Obtener informacion - Inicio de componente
  obtenerInformacion(): void {
    this.alertService.loading();
    
    // Listado de notas de consulta
    this.fichaService.getFicha(this.idFicha).subscribe({
      next: ({ficha}) => {
        this.ficha = ficha;
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
                          console.log(estudios);
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
      this.cirugia_fecha.trim() === '' || 
      this.cirugia_institucion === ''
    ){
      this.alertService.info('Debes completar los datos de la cirugia');
      return;
    }

    this.alertService.loading();
    
    const data = {
      ficha: this.idFicha,
      tipo_cirugia: this.cirugia,
      institucion: this.cirugia_institucion,
      fecha_realizacion: add(new Date(this.cirugia_fecha),{ hours: 5 }),
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

}
