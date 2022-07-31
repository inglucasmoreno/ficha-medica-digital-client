import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import gsap from 'gsap';
import { AlertService } from 'src/app/services/alert.service';
import { DataService } from 'src/app/services/data.service';
import { FichasService } from 'src/app/services/fichas.service';

@Component({
  selector: 'app-medicamentos-autorizaciones',
  templateUrl: './medicamentos-autorizaciones.component.html',
  styles: [
  ]
})
export class MedicamentosAutorizacionesComponent implements OnInit {

  public dniPaciente: string = '';

  constructor(private dataService:DataService,
              private alertService: AlertService,
              private router: Router,
              private fichasService: FichasService) { }

  ngOnInit(): void {
    gsap.from('.gsap-contenido', { y:100, opacity: 0, duration: .2 });
    this.dataService.ubicacionActual = 'Dashboard - Autorización de medicamentos';
  }

  // Buscar paciente
  buscarPaciente(): void {

    if(this.dniPaciente === ''){
      this.alertService.info('Debe colocar un DNI');
      return;
    }

    this.fichasService.getFichaPorDNI(this.dniPaciente).subscribe({
      next: ({ficha}) => {
        this.router.navigateByUrl(`/dashboard/medicamentos/autorizaciones/detalles/${ficha._id}`);
        this.alertService.close();
      },
      error: ({error}) => {
        this.dniPaciente = '';
        this.alertService.errorApi(error.message);
      }
    });
  }

}
