import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { DataService } from 'src/app/services/data.service';
import { UsuariosService } from 'src/app/services/usuarios.service';
import gsap from 'gsap';
import { Router } from '@angular/router';

@Component({
  selector: 'app-turnos',
  templateUrl: './turnos.component.html',
  styles: [
  ]
})
export class TurnosComponent implements OnInit {

  public usuarios: any[];
  public idUsuario: string = '';

  constructor(private usuariosService: UsuariosService,
              private router: Router,
              private dataService: DataService,
              private alertService: AlertService) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Dashboard - Turnos';
    gsap.from('.gsap-contenido', { y:100, opacity: 0, duration: .2 });
    this.listarProfesionales();
  }

  listarProfesionales(): void {
    this.alertService.loading();
    this.usuariosService.listarUsuarios().subscribe({
      next: ({usuarios}) => {
        this.usuarios = usuarios.filter(usuario => usuario.activo);
        this.alertService.close();
      },
      error: ({error}) => {
        this.alertService.errorApi(error.message);
      }
    })
  }

  buscarProfesional(): void {
    
    // Verificacion
    if(this.idUsuario.trim() === ''){
      this.alertService.info('Debes seleccionar un profesional');
      return;
    }

    this.router.navigateByUrl(`dashboard/turnos/detalles/${this.idUsuario}`);

  }

  reiniciarFormulario(): void {
    this.idUsuario = '';
  }

}
