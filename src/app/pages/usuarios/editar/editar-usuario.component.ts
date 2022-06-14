import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Usuario } from '../../../models/usuario.model';
import { UsuariosService } from '../../../services/usuarios.service';
import { AlertService } from 'src/app/services/alert.service';
import { DataService } from 'src/app/services/data.service';

import gsap from 'gsap';
import { TipoMedicoService } from 'src/app/services/tipo-medico.service';

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
      const {usuario, apellido, nombre, dni, email, role, activo} = this.usuario;

      this.tipo = usuarioRes.tipo_medico._id; 

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

    this.alertService.loading();

    this.usuariosService.actualizarUsuario(this.id, data).subscribe(() => {
      this.alertService.close();
      this.router.navigateByUrl('dashboard/usuarios');
    }, ({error}) => {
      this.alertService.close();
      this.alertService.errorApi(error.message);
    });

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

  // Funcion del boton regresar
  regresar(): void{
    this.router.navigateByUrl('/dashboard/usuarios');
  }

}
