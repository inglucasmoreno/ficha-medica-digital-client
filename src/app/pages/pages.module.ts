import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { PagesComponent } from './pages.component';
import { AppRoutingModule } from '../app-routing.module';
import { SharedModule } from '../shared/shared.module';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { NuevoUsuarioComponent } from './usuarios/nuevo-usuario.component';
import { PipesModule } from '../pipes/pipes.module';
import { ComponentsModule } from '../components/components.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditarUsuarioComponent } from './usuarios/editar/editar-usuario.component';
import { EditarPasswordComponent } from './usuarios/editar/editar-password.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { DirectivesModule } from '../directives/directives.module';
import { PerfilComponent } from './perfil/perfil.component';
import { FichasComponent } from './fichas/fichas.component';
import { FichaDetallesComponent } from './fichas/ficha-detalles.component';
import { BuscarFichaComponent } from './buscar-ficha/buscar-ficha.component';
import { TurnosComponent } from './turnos/turnos.component';
import { TurnosDetallesComponent } from './turnos/turnos-detalles.component';
import { TipoMedicoComponent } from './tipo-medico/tipo-medico.component';
import { DiasLaboralesComponent } from './reportes/dias-laborales/dias-laborales.component';
import { TurnosReportesComponent } from './reportes/turnos-reportes/turnos-reportes.component';
import { MedicamentosComponent } from './medicamentos/medicamentos.component';
import { MedicamentosAutorizacionesComponent } from './medicamentos/medicamentos-autorizaciones.component';
import { MedicamentosAutorizacionesDetallesComponent } from './medicamentos/medicamentos-autorizaciones-detalles.component';
import { MedicosExternosComponent } from './medicos-externos/medicos-externos.component';


@NgModule({
  declarations: [
    HomeComponent,
    PagesComponent,
    UsuariosComponent,
    NuevoUsuarioComponent,
    EditarUsuarioComponent,
    EditarPasswordComponent,
    PerfilComponent,
    FichasComponent,
    FichaDetallesComponent,
    BuscarFichaComponent,
    TurnosComponent,
    TurnosDetallesComponent,
    TipoMedicoComponent,
    DiasLaboralesComponent,
    TurnosReportesComponent,
    MedicamentosComponent,
    MedicamentosAutorizacionesComponent,
    MedicamentosAutorizacionesDetallesComponent,
    MedicosExternosComponent,
  ],
  imports: [
    CommonModule,
    AppRoutingModule,
    DirectivesModule,
    SharedModule,
    PipesModule,
    ComponentsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    FormsModule,
    DirectivesModule
  ]
})
export class PagesModule { }
