import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { UsuariosService } from '../../services/usuarios.service';
import { AlertService } from '../../services/alert.service';
import { Usuario } from 'src/app/models/usuario.model';
import { DataService } from 'src/app/services/data.service';
import gsap from 'gsap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HistorialDiasLaboralesService } from '../../services/historial-dias-laborales.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styles: [
  ]
})
export class PerfilComponent implements OnInit {

  constructor(private authService: AuthService,
              private dataService: DataService,
              private historialDiasLaboralesService: HistorialDiasLaboralesService,
              private fb: FormBuilder,
              private usuariosService: UsuariosService,
              private alertService: AlertService) { }

  public usuarioLogin: Usuario;
  public passwordForm: FormGroup;

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

  ngOnInit(): void {

    gsap.from('.gsap-contenido', { y:100, opacity: 0, duration: .2 });
    this.dataService.ubicacionActual = "Dashboard - Perfil";
    this.getUsuario();
    
    // Formulario reactivo para password
    this.passwordForm = this.fb.group({
      password: ['', Validators.required],
      repetir: ['', Validators.required]
    });
  }

  // Obtener datos de usuario
  getUsuario(): void {
    this.alertService.loading();
    this.usuariosService.getUsuario(this.authService.usuario.userId).subscribe( (usuario: Usuario) => {
      this.alertService.close();
      this.usuarioLogin = usuario;
      this.dias_laborales = usuario.dias_laborales;
      this.dias_laboralesTMP = usuario.dias_laborales;
      this.ajustarDias();
    },({error}) => {
      this.alertService.errorApi(error.msg);
    })
  }

  // Actualizar password
  actualizarPassword(): void {
    this.alertService.loading();
    this.usuariosService.actualizarUsuario(this.usuarioLogin._id, this.passwordForm.value).subscribe( () => {
      this.reiniciarValores();
      this.alertService.success('Contraseña actualizada');
    },({error}) => { 
      this.alertService.errorApi(error.msg)
    });
  }

  ajustarDias(): any {
    this.dias_laborales?.includes('lunes') ? this.dias.lunes = true : this.dias.lunes = false;
    this.dias_laborales?.includes('martes') ? this.dias.martes = true : this.dias.martes = false;
    this.dias_laborales?.includes('miércoles') ? this.dias.miercoles = true : this.dias.miercoles = false;
    this.dias_laborales?.includes('jueves') ? this.dias.jueves = true : this.dias.jueves = false;
    this.dias_laborales?.includes('viernes') ? this.dias.viernes = true : this.dias.viernes = false;
    this.dias_laborales?.includes('sábado') ? this.dias.sabado = true : this.dias.sabado = false;
    this.dias_laborales?.includes('domingo') ? this.dias.domingo = true : this.dias.domingo = false;
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

  actualizarDias(): void {
    
    
    const dias_laborales = this.adicionarDias();
    
    if(JSON.stringify(this.dias_laborales) !== JSON.stringify(this.dias_laboralesTMP)){ // Se actualiza si es necesario
      this.alertService.loading();
      
      // Actualizacion de informacion de usuario
      this.usuariosService.actualizarUsuario(this.usuarioLogin._id,{dias_laborales}).subscribe({
        next: () => {
          
          const data = {
            usuario: this.authService.usuario.userId,
            dias_laborales: this.dias_laborales,
            creatorUser: this.authService.usuario.userId,
            updatorUser: this.authService.usuario.userId,
          }
  
          // Actualizacion del historial de turnos
          this.historialDiasLaboralesService.nuevoHistorial(data).subscribe({
            next: () => {
              this.dias_laboralesTMP = this.dias_laborales;
              this.alertService.success('Días laborales actualizados');
            },
            error: ({error}) => this.alertService.errorApi(error.message)
          });
  
        },
        error: ({error}) => {
          this.alertService.errorApi(error);
        }
      });
    }else{
      this.alertService.info('No es necesario realizar cambios');
    }

  }

  // Reiniciar valores
  reiniciarValores(): void {
    this.passwordForm.patchValue({
      password: '',
      repetir: ''
    });
  }

}
