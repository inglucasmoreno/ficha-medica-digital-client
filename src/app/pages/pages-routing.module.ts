import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Guards
import { AuthGuard } from '../guards/auth.guard';
import { PermisosGuard } from '../guards/permisos.guard';

// Componentes
import { PagesComponent } from './pages.component';
import { HomeComponent } from './home/home.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { NuevoUsuarioComponent } from './usuarios/nuevo-usuario.component';
import { EditarUsuarioComponent } from './usuarios/editar/editar-usuario.component';
import { EditarPasswordComponent } from './usuarios/editar/editar-password.component';
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

const routes: Routes = [
    {
        path: 'dashboard',
        component: PagesComponent,
        canActivate: [ AuthGuard ],    // Guard - Se verifica si el usuario esta logueado
        children: [
            
            // Home
            { path: 'home', component: HomeComponent },

            // Perfil de usuarios
            { path: 'perfil', component: PerfilComponent },

            // Usuarios
            { path: 'usuarios', data: { permisos: 'USUARIOS_NAV' }, canActivate: [PermisosGuard], component: UsuariosComponent },
            { path: 'usuarios/nuevo', data: { permisos: 'USUARIOS_NAV' }, canActivate: [PermisosGuard], component: NuevoUsuarioComponent },
            { path: 'usuarios/editar/:id', data: { permisos: 'USUARIOS_NAV' }, canActivate: [PermisosGuard], component: EditarUsuarioComponent },
            { path: 'usuarios/password/:id', data: { permisos: 'USUARIOS_NAV' }, canActivate: [PermisosGuard], component: EditarPasswordComponent },
            
            // Tipo de medico
            { path: 'tipo-medico', data: { permisos: 'TIPO_MEDICO_NAV' }, canActivate: [PermisosGuard], component: TipoMedicoComponent },

            // Fichas
            { path: 'fichas', data: { permisos: 'FICHAS_NAV' }, canActivate: [PermisosGuard], component: FichasComponent },
            { path: 'fichas/detalles/:id', data: {}, canActivate: [], component: FichaDetallesComponent },
            { path: 'buscar-ficha', data: { permisos: 'BUSCADOR_FICHAS_NAV' }, canActivate: [PermisosGuard], component: BuscarFichaComponent },

            // Turnos
            { path: 'turnos', data: { permisos: 'TURNOS_NAV' }, canActivate: [PermisosGuard], component: TurnosComponent },
            { path: 'turnos/detalles/:id', data: { permisos: 'TURNOS_NAV' }, canActivate: [PermisosGuard], component: TurnosDetallesComponent },

            // Medicos externos
            { path: 'medicos-externos', data: { permisos: 'MEDICOS_EXTERNOS_NAV' }, canActivate: [PermisosGuard], component: MedicosExternosComponent },

            // Medicamentos
            { path: 'medicamentos/listado', data: { permisos: 'MEDICAMENTOS_NAV' }, canActivate: [PermisosGuard], component: MedicamentosComponent },
            { path: 'medicamentos/autorizaciones', data: { permisos: 'MEDICAMENTOS_NAV' }, canActivate: [PermisosGuard], component: MedicamentosAutorizacionesComponent },
            { path: 'medicamentos/autorizaciones/detalles/:id', data: { permisos: 'MEDICAMENTOS_NAV' }, canActivate: [PermisosGuard], component: MedicamentosAutorizacionesDetallesComponent },
            { path: 'medicamentos/medicos-externos', data: { permisos: 'MEDICAMENTOS_NAV' }, canActivate: [PermisosGuard], component: MedicosExternosComponent },

            // Reportes
            { path: 'reportes/dias-laborales', data: { permisos: 'REPORTES_NAV' }, canActivate: [PermisosGuard], component: DiasLaboralesComponent },
            { path: 'reportes/turnos', data: { permisos: 'REPORTES_NAV' }, canActivate: [PermisosGuard], component: TurnosReportesComponent },

        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PagesRoutingModule {}