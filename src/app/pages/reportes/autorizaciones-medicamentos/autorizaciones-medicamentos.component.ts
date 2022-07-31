import { Component, OnInit } from '@angular/core';
import gsap from 'gsap';
import { DataService } from '../../../services/data.service';
import { AlertService } from '../../../services/alert.service';
import { UsuariosService } from '../../../services/usuarios.service';
import { MedicosExternosService } from '../../../services/medicos-externos.service';
import { MedicamentosService } from '../../../services/medicamentos.service';
import { AutorizacionesMedicamentosService } from 'src/app/services/autorizaciones-medicamentos.service';

@Component({
  selector: 'app-autorizaciones-medicamentos',
  templateUrl: './autorizaciones-medicamentos.component.html',
  styles: [
  ]
})
export class AutorizacionesMedicamentosComponent implements OnInit {

  public pacienteSeleccionado = null;
  public pacienteDNI = '';
  
  // Formulario
  public profesional_tipo = '';
  public profesional_interno = '';
  public profesional_externo = '';
  public medicamento = '';

  // Listados
  public medicamentos: any[] = [];
  public medicosExternos: any[] = [];
  public medicosInternos: any[] = [];

  constructor(private dataService: DataService,
              private alertService: AlertService,
              private usuariosService: UsuariosService,
              private medicosExternosService: MedicosExternosService,
              private medicamentosService: MedicamentosService,
              private autorizacionesMedicamentosService: AutorizacionesMedicamentosService) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Dashboard - Reporte de medicamentos';
    gsap.from('.gsap-contenido', { y:100, opacity: 0, duration: .2 });
    this.calculosIniciales();
  }

  calculosIniciales(): void {
    this.alertService.loading();
    this.medicamentosService.listarMedicamentos(1, 'descripcion').subscribe({
      next: ({medicamentos}) => {
        this.medicamentos = medicamentos;
        this.medicosExternosService.listarMedicosExternos(1, 'apellido').subscribe({
          next: ({medicos}) => {
            this.medicosExternos = medicos.filter(medico => medico._id !== '000000000000000000000000');
            this.usuariosService.listarUsuarios(1, 'apellido').subscribe({
              next: ({usuarios}) => {
                this.medicosInternos = usuarios.filter(usuario => usuario.role === 'DOCTOR_ROLE');
                this.alertService.close();
              },
              error: ({error}) => this.alertService.errorApi(error.message)
            })
          },
          error: ({error}) => this.alertService.errorApi(error.message)
        })
      },
      error: ({error}) => this.alertService.errorApi(error.message) 
    })
  }

}
