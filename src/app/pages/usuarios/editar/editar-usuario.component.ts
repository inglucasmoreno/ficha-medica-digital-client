import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Usuario } from '../../../models/usuario.model';
import { UsuariosService } from '../../../services/usuarios.service';
import { AlertService } from 'src/app/services/alert.service';
import { DataService } from 'src/app/services/data.service';

import gsap from 'gsap';
import { TipoMedicoService } from 'src/app/services/tipo-medico.service';
import { AuthService } from '../../../services/auth.service';
import { HistorialDiasLaboralesService } from '../../../services/historial-dias-laborales.service';

@Component({
  selector: 'app-editar-usuario',
  templateUrl: './editar-usuario.component.html',
  styles: [
  ]
})
export class EditarUsuarioComponent implements OnInit {

  // Modal
  public showModal = false;
  
  // Tipos de medicos
  public tipos: any[];
  public tipo: any = "000000000000000000000000";

  // Dias laborales
  public dias_laboralesTMP = [];
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
    turnos: 'TURNOS_NOT_ACCESS'
  };

  public id: string;
  public usuario: Usuario;
  public usuarioForm: FormGroup;

  constructor(private router: Router,
              private fb: FormBuilder,
              private tipoMedicoService: TipoMedicoService,
              private activatedRoute: ActivatedRoute,
              private authService: AuthService,
              private historialDiasLaboralesService: HistorialDiasLaboralesService,
              private usuariosService: UsuariosService,
              private alertService: AlertService,
              private dataService: DataService) { }

  ngOnInit(): void {
    
    // Animaciones y Datos de ruta
    gsap.from('.gsap-contenido', { y:100, opacity: 0, duration: .2 });
    this.dataService.ubicacionActual = 'Dashboard - Editando usuario';

    // Formulario reactivo
    this.usuarioForm = this.fb.group({
      usuario: ['', Validators.required],
      apellido: ['', Validators.required],
      nombre: ['', Validators.required],
      dni: ['', Validators.required],
      email: ['', Validators.email],
      role: ['USER_ROLE', Validators.required],
      activo: ['true', Validators.required],
    });
  
    this.getUsuario(); // Datos iniciales de usuarios

  }

  // Datos iniciales de usuarios
  getUsuario(): void {
    
    // Se buscan los datos iniciales del usuario a editar
    this.alertService.loading();
    this.activatedRoute.params.subscribe(({id}) => { this.id = id; });
    this.usuariosService.getUsuario(this.id).subscribe(usuarioRes => {
      
      // Marcar permisos
      this.getPermisos(usuarioRes.permisos); // Se obtienen los permisos

      this.usuario = usuarioRes;
      const {usuario, apellido, nombre, dni, email, role, dias_laborales, activo} = this.usuario;

      this.tipo = usuarioRes.tipo_medico._id; 

      if(dias_laborales && role === 'DOCTOR_ROLE'){
        this.dias_laborales = dias_laborales;
        this.dias_laboralesTMP = dias_laborales;
      }else{
        this.dias_laborales = [];
      }
    
      this.ajustarDias();

      this.usuarioForm.patchValue({
        usuario,
        apellido,
        nombre,
        dni,
        email,
        role,
        activo: String(activo)
      });

      // Se obtienen los tipos de medicos
      this.tipoMedicoService.listarTipos().subscribe({
        next: ({tipos}) => {
          this.tipos = tipos.filter(tipo => (tipo.activo && tipo._id !== '000000000000000000000000'));
          this.alertService.close();
        },
        error: ({error}) => {
          this.alertService.errorApi(error.message);
        }
      })

    },({error})=> {
      this.alertService.errorApi(error.message); 
    });
  
  }

  // Se obtienen los permisos
  getPermisos(permisosFnc: Array<string>): void {
    
    permisosFnc.forEach( permiso => {
    
      // Usuarios
      (permiso === 'USUARIOS_ALL' || permiso === 'USUARIOS_READ') ? this.permisos.usuarios = permiso : null;

      // Fichas
      (permiso === 'FICHAS_ALL' || permiso === "FICHAS_READ") ? this.permisos.fichas = permiso : null;

      // Tipos de medicos
      (permiso === 'TIPO_MEDICO_ALL' || permiso === "TIPO_MEDICO_READ") ? this.permisos.tipo_medico = permiso : null;

      // Buscador de fichas
      (permiso === 'BUSCADOR_FICHAS_ALL' || permiso === "BUSCADOR_FICHAS_READ") ? this.permisos.buscador_fichas = permiso : null;

      // Turnos
      (permiso === 'TURNOS_ALL' || permiso === "TURNOS_READ") ? this.permisos.turnos = permiso : null;

    });

  }

  // Editar usuario
  editarUsuario(): void | boolean{
      
    const {usuario, apellido, dni, role, nombre, email} = this.usuarioForm.value;

    // Se verifica que los campos no tengan un espacio vacio
    const campoVacio = usuario.trim() === '' || 
                       apellido.trim() === '' || 
                       dni.trim() === '' || 
                       email.trim() === '' || 
                       nombre.trim() === '';

    // Se verifica que todos los campos esten rellenos
    if (this.usuarioForm.status === 'INVALID' || campoVacio){
      this.alertService.formularioInvalido()
      return false;
    }

    let data: any;

    if(role === 'DOCTOR_ROLE') data = {...this.usuarioForm.value, tipo_medico: this.tipo}
    else data = {...this.usuarioForm.value, tipo_medico: '000000000000000000000000'} 
    
    
    // Se agregan los permisos
    if(role !== 'ADMIN_ROLE') data.permisos = this.adicionarPermisos(); // Se adicionan los permisos a la data para actualizacion
    else data.permisos = [];

    // Agregar dias laborales
    let dias_laborales = [];
    if(role === 'DOCTOR_ROLE') dias_laborales = this.adicionarDias();
    data = { ...data, dias_laborales };

    this.alertService.loading();

    this.usuariosService.actualizarUsuario(this.id,data).subscribe({

      next: () => {
        if(role !== 'DOCTOR_ROLE'){
          this.alertService.close();  // Finaliza el loading
          this.router.navigateByUrl('dashboard/usuarios');
        }else{
          if(JSON.stringify(this.dias_laboralesTMP) !== JSON.stringify(data.dias_laborales)){
            const dataHistorial = {
              usuario: this.id,
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
          }else{
            this.alertService.close();  // Finaliza el loading
            this.router.navigateByUrl('dashboard/usuarios');           
          }
        }  
      },
      error: ({error}) => this.alertService.errorApi(error.message)

    })

  }

  abrirPermisos(): void {
    this.showModal = true;
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
    
    return permisos;  
  
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
        turnos: 'TURNOS_ALL'
      }
    }else if(role === 'DOCTOR_ROLE'){
      this.permisos = {
        usuarios: 'USUARIOS_NOT_ACCESS',
        tipo_medico: 'TIPO_MEDICO_NOT_ACCESS',
        fichas: 'FICHAS_READ',
        buscador_fichas: 'BUSCADOR_FICHAS_ALL',
        turnos: 'TURNOS_NOT_ACCESS'
      }
    }

  }

  ajustarDias(): any {
    this.dias_laborales.includes('lunes') ? this.dias.lunes = true : this.dias.lunes = false;
    this.dias_laborales.includes('martes') ? this.dias.martes = true : this.dias.martes = false;
    this.dias_laborales.includes('miércoles') ? this.dias.miercoles = true : this.dias.miercoles = false;
    this.dias_laborales.includes('jueves') ? this.dias.jueves = true : this.dias.jueves = false;
    this.dias_laborales.includes('viernes') ? this.dias.viernes = true : this.dias.viernes = false;
    this.dias_laborales.includes('sábado') ? this.dias.sabado = true : this.dias.sabado = false;
    this.dias_laborales.includes('domingo') ? this.dias.domingo = true : this.dias.domingo = false;
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

  // Funcion del boton regresar
  regresar(): void{
    this.router.navigateByUrl('/dashboard/usuarios');
  }

}
