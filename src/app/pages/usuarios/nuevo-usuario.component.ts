import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';

import { UsuariosService } from 'src/app/services/usuarios.service';
import { AlertService } from '../../services/alert.service';

import gsap from 'gsap';

@Component({
  selector: 'app-nuevo-usuario',
  templateUrl: './nuevo-usuario.component.html',
  styles: [
  ]
})
export class NuevoUsuarioComponent implements OnInit {

  // Modal: permisos
  public showModal = false;

  // Permisos
  public permisos = {
    usuarios: 'USUARIOS_NOT_ACCESS',
    fichas: 'FICHAS_NOT_ACCESS',
    buscador_fichas: 'BUSCADOR_FICHAS_NOT_ACCESS',
    turnos: 'TURNOS_NOT_ACCESS'
  };

  // Modelo reactivo
  public usuarioForm: FormGroup;

  constructor(private fb: FormBuilder,
              private router: Router,
              private usuariosService: UsuariosService,
              private alertService: AlertService,
              private dataService: DataService
              ) { }

  ngOnInit(): void {
    
    // Animaciones y Datos de ruta
    gsap.from('.gsap-contenido', { y:100, opacity: 0, duration: .2 });
    this.dataService.ubicacionActual = 'Dashboard - Creando usuario';

    // Formulario reactivo
    this.usuarioForm = this.fb.group({
      usuario: ['testing', Validators.required],
      apellido: ['testing', Validators.required],
      nombre: ['testing', Validators.required],
      dni: ['34060312', Validators.required],
      email: ['testing@gmail.com', Validators.required],
      password: ['craneo', Validators.required],
      repetir: ['craneo', Validators.required],
      role: ['USER_ROLE', Validators.required],
      activo: ['true', Validators.required]
    });

  }

  // Crear nuevo usuario
  nuevoUsuario(): void {

    const { status } = this.usuarioForm;
    const {usuario, apellido, nombre, dni, email, role, password, repetir} = this.usuarioForm.value;
    
    console.log(this.usuarioForm.valid);

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

    // Se agregan los permisos
    let data: any = this.usuarioForm.value;
    
    if(role !== 'ADMIN_ROLE') data.permisos = this.adicionarPermisos();
    else data.permisos = [];

    this.alertService.loading();  // Comienzo de loading

    // Se crear el nuevo usuario
    this.usuariosService.nuevoUsuario(data).subscribe(() => {
      this.alertService.close();  // Finaliza el loading
      this.router.navigateByUrl('dashboard/usuarios');
    },( ({error}) => {
      this.alertService.close();  // Finaliza el loading
      this.alertService.errorApi(error.message);
      return;  
    }));

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

}
