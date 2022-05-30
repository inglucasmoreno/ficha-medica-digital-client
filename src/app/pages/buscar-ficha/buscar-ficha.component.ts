import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import gsap from 'gsap';
import { AlertService } from 'src/app/services/alert.service';
import { FichasService } from 'src/app/services/fichas.service';

@Component({
  selector: 'app-buscar-ficha',
  templateUrl: './buscar-ficha.component.html',
  styles: [
  ]
})
export class BuscarFichaComponent implements OnInit {

  public dni: string = '';

  constructor(private alertService: AlertService,
              private router: Router,
              private fichasService: FichasService) { }

  ngOnInit(): void {
    gsap.from('.gsap-contenido', { y:100, opacity: 0, duration: .2 });
  }

  buscarFicha(): void {
    
    if(this.dni.trim() === ''){
      this.alertService.info('Debes colocar un DNI');
      return;
    }

    this.alertService.loading();

    this.fichasService.getFichaPorDNI(this.dni).subscribe({
      next: ({ficha}) => {
        this.reiniciarFormulario();
        this.alertService.close();
        this.router.navigateByUrl(`dashboard/fichas/detalles/${ficha._id}`);
      },
      error: () => {
        this.reiniciarFormulario();
        this.alertService.info('La ficha no existe');
      }
    })

  }

  reiniciarFormulario(): void {
    this.dni = '';
  }

}
