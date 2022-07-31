import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';

import { UsuariosService } from 'src/app/services/usuarios.service';
import { AlertService } from '../../services/alert.service';

import gsap from 'gsap';
import { TipoMedicoService } from 'src/app/services/tipo-medico.service';
import { HistorialDiasLaboralesService } from '../../services/historial-dias-laborales.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-nuevo-usuario',
  templateUrl: './nuevo-usuario.component.html',
  styles: [
  ]
})
export class NuevoUsuarioComponent implements OnInit {

  // Modal: permisos
  public showModal = false;

  // Tipos de medicos
  public tipos: any[];
  public tipo: any = "000000000000000000000000";

  // Dias laborales
  public dias_laborales = ['lunes'];
  public dias = {
    lunes: true,
    martes: true,
    miercoles: true,
    jueves: true,
    viernes: true,
    sabado: true,
    domingo: true,
  }

  // Permisos
  public permisos = {
    usuarios: 'USUARIOS_NOT_ACCESS',
    tipo_medico: 'TIPO_MEDICO_NOT_ACCESS',
    fichas: 'FICHAS_NOT_ACCESS',
    buscador_fichas: 'BUSCADOR_FICHAS_NOT_ACCESS',
    turnos: 'TURNOS_NOT_ACCESS',
    medicamentos: 'MEDICAMENTOS_NOT_ACCESS',
    reportes: 'REPORTES_NOT_ACCESS'
  };

  // Modelo reactivo
  public usuarioForm: FormGroup;

  constructor(private fb: FormBuilder,
              private router: Router,
              private tipoMedicoService: TipoMedicoService,
              private historialDiasLaboralesService: HistorialDiasLaboralesService,
              private usuariosService: UsuariosService,
              private authService: AuthService,
              private alertService: AlertService,
              private dataService: DataService
              ) { }

  ngOnInit(): void {
    
    // Animaciones y Datos de ruta
    gsap.from('.gsap-contenido', { y:100, opacity: 0, duration: .2 });
    this.dataService.ubicacionActual = 'Dashboard - Creando usuario';

    // Formulario reactivo
    this.usuarioForm = this.fb.group({
      usuario: ['', Validators.required],
      apellido: ['', Validators.required],
      nombre: ['', Validators.required],
      dni: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', Validators.required],
      repetir: ['', Validators.required],
      role: ['ADMIN_ROLE', Validators.required],
      activo: ['true', Validators.required]
    });

    this.obtenerTiposMedicos();

  }

  // Tipo de medicos
  obtenerTiposMedicos(): void {
    this.alertService.loading();
    this.tipoMedicoService.listarTipos().subscribe({
      next: ({tipos}) => {
        this.tipos = tipos.filter(tipo => (tipo.activo && tipo._id !== '000000000000000000000000'));
        this.alertService.close();
      },
      error: ({error}) => {
        this.alertService.errorApi(error.message);
      }
    })
  }

  // Crear nuevo usuario
  nuevoUsuario(): void {

    const { status } = this.usuarioForm;
    const {usuario, apellido, nombre, dni, email, role, password, repetir} = this.usuarioForm.value;
    
    // Se verifica que los campos no tengan un espacio vacio
    const campoVacio = usuario.trim() === '' || 
                       apellido.trim() === '' ||
                       dni.trim() === '' || 
                       email.trim() === '' || 
                       nombre.trim() === '' ||
                       password.trim() === '' ||
                       repetir.trim() === '';

    // Se verifica si los campos son invalidos
    if(status === 'INVALID' || campoVacio){
      this.alertService.formularioInvalido();
      return;
    }

    // Se verifica si las contraseñas coinciden
    if(password !== repetir){
      this.alertService.info('Las contraseñas deben coincidir');
      return;   
    }

    let data: any;

    if(role === 'DOCTOR_ROLE') data = {...this.usuarioForm.value, tipo_medico: this.tipo }
    else data = {...this.usuarioForm.value, tipo_medico: '000000000000000000000000' }
    
    // Se agregan los permisos
    if(role !== 'ADMIN_ROLE') data.permisos = this.adicionarPermisos();
    else data.permisos = [];

    // Agregar dias laborales
    let dias_laborales = [];
    if(role === 'DOCTOR_ROLE') dias_laborales = this.adicionarDias();
    
    data = { ...data, dias_laborales };

    this.alertService.loading();  // Comienzo de loading

    // Se crear el nuevo usuario
    this.usuariosService.nuevoUsuario(data).subscribe(({usuario}) => {
      
      
      if(role !== 'DOCTOR_ROLE'){
        this.alertService.close();  // Finaliza el loading
        this.router.navigateByUrl('dashboard/usuarios');
      }else{
        
        const dataHistorial = {
          usuario: usuario._id,
          dias_laborales: data.dias_laborales,
          creatorUser: this.authService.usuario.userId,
          updatorUser: this.authService.usuario.userId, 
        };

        this.historialDiasLaboralesService.nuevoHistorial(dataHistorial).subscribe({
          next: () => {
            this.alertService.close();  // Finaliza el loading
            this.router.navigateByUrl('dashboard/usuarios');            
          },
          error: ({error}) => this.alertService.errorApi(error.message)
        });
      
      } 
      
    
    },( ({error}) => {
      this.alertService.close();  // Finaliza el loading
      this.alertService.errorApi(error.message);
      return;  
    }));

  }

  abrirPermisos(): void {
    this.showModal = true;
  }

  // Asignar permisos por tipo de usuario seleccionado
  asignarPermisosTipoUsuario():void {
    
    const { role } = this.usuarioForm.value;

    if(role === 'ADMINISTRATIVE_ROLE'){
      this.permisos = {
        usuarios: 'USUARIOS_NOT_ACCESS',
        tipo_medico: 'TIPO_MEDICO_NOT_ACCESS',
        fichas: 'FICHAS_ALL',
        buscador_fichas: 'BUSCADOR_FICHAS_NOT_ACCESS',
        turnos: 'TURNOS_ALL',
        medicamentos: 'MEDICAMENTOS_NOT_ACCESS',
        reportes: 'REPORTES_NOT_ACCESS'   
      }
    }else if(role === 'DOCTOR_ROLE'){
      this.permisos = {
        usuarios: 'USUARIOS_NOT_ACCESS',
        tipo_medico: 'TIPO_MEDICO_NOT_ACCESS',
        fichas: 'FICHAS_READ',
        buscador_fichas: 'BUSCADOR_FICHAS_ALL',
        turnos: 'TURNOS_NOT_ACCESS',
        medicamentos: 'MEDICAMENTOS_NOT_ACCESS',
        reportes: 'REPORTES_NOT_ACCESS'
      }
    }else if(role === 'MEDICAMENTOS_ROLE'){
      this.permisos = {
        usuarios: 'USUARIOS_NOT_ACCESS',
        tipo_medico: 'TIPO_MEDICO_NOT_ACCESS',
        fichas: 'FICHAS_NOT_ACCESS',
        buscador_fichas: 'BUSCADOR_FICHAS_NOT_ACCESS',
        turnos: 'TURNOS_NOT_ACCESS',
        medicamentos: 'MEDICAMENTOS_ALL',
        reportes: 'REPORTES_NOT_ACCESS'
      }
    }

  }
  
  cambiarDia(dia: string): any {
    if(dia === 'lunes') this.dias.lunes = !this.dias.lunes;
    else if(dia === 'martes') this.dias.martes = !this.dias.martes;
    else if(dia === 'miércoles') this.dias.miercoles = !this.dias.miercoles;
    else if(dia === 'jueves') this.dias.jueves = !this.dias.jueves;
    else if(dia === 'viernes') this.dias.viernes = !this.dias.viernes;
    else if(dia === 'sábado') this.dias.sabado = !this.dias.sabado;
    else if(dia === 'domingo') this.dias.domingo = !this.dias.domingo;    
  }

  adicionarDias(): any {

    this.dias_laborales = [];
    if(this.dias.lunes) this.dias_laborales.push('lunes');
    if(this.dias.martes) this.dias_laborales.push('martes');
    if(this.dias.miercoles) this.dias_laborales.push('miércoles');
    if(this.dias.jueves) this.dias_laborales.push('jueves');
    if(this.dias.viernes) this.dias_laborales.push('viernes');
    if(this.dias.sabado) this.dias_laborales.push('sábado');
    if(this.dias.domingo) this.dias_laborales.push('domingo');

    return this.dias_laborales;

  }

  // Se arma el arreglo de permisos
  adicionarPermisos(): any {

    let permisos: any[] = [];    
    
    // Seccion usuarios
    if(this.permisos.usuarios !== 'USUARIOS_NOT_ACCESS'){
      permisos.push('USUARIOS_NAV');
      permisos.push(this.permisos.usuarios);
    }

    // Seccion tipo de medicos
    if(this.permisos.tipo_medico !== 'TIPO_MEDICO_NOT_ACCESS'){
      permisos.push('TIPO_MEDICO_NAV');
      permisos.push(this.permisos.tipo_medico);
    }
    
    // Seccion fichas
    if(this.permisos.fichas !== 'FICHAS_NOT_ACCESS'){
      permisos.push('FICHAS_NAV');
      permisos.push(this.permisos.fichas);
    }

    // Seccion buscador de fichas
    if(this.permisos.buscador_fichas !== 'BUSCADOR_FICHAS_NOT_ACCESS'){
      permisos.push('BUSCADOR_FICHAS_NAV');
      permisos.push(this.permisos.buscador_fichas);
    }

    // Seccion turnos
    if(this.permisos.turnos !== 'TURNOS_NOT_ACCESS'){
      permisos.push('TURNOS_NAV');
      permisos.push(this.permisos.turnos);
    }

    // Seccion reportes
    if(this.permisos.medicamentos !== 'MEDICAMENTOS_NOT_ACCESS'){
      permisos.push('MEDICAMENTOS_NAV');
      permisos.push(this.permisos.medicamentos);
    }

    // Seccion reportes
    if(this.permisos.reportes !== 'REPORTES_NOT_ACCESS'){
      permisos.push('REPORTES_NAV');
      permisos.push(this.permisos.reportes);
    }

    return permisos;  
  
  }

}