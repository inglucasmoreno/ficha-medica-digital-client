import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { DataService } from 'src/app/services/data.service';
import { UsuariosService } from 'src/app/services/usuarios.service';
import gsap from 'gsap';

@Component({
  selector: 'app-turnos',
  templateUrl: './turnos.component.html',
  styles: [
  ]
})
export class TurnosComponent implements OnInit {

  public usuarios: any[];

  constructor(private usuariosService: UsuariosService,
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
        this.usuarios = usuarios;
        this.alertService.close();
      },
      error: ({error}) => {
        this.alertService.errorApi(error.message);
      }
    })
  }

}
