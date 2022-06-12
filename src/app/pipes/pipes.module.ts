import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FechaPipe } from './fecha.pipe';
import { RolPipe } from './rol.pipe';
import { MonedaPipe } from './moneda.pipe';
import { FiltroUsuariosPipe } from './filtro-usuarios.pipe';
import { FiltroFichasPipe } from './filtro-fichas.pipe';
import { HoraPipe } from './hora.pipe';
import { FiltroTipoMedicoPipe } from './filtro-tipo-medico.pipe';
import { FiltroTurnosPipe } from './filtro-turnos.pipe';

@NgModule({
  declarations: [
    FechaPipe,
    RolPipe,
    MonedaPipe,
    FiltroUsuariosPipe,
    FiltroFichasPipe,
    HoraPipe,
    FiltroTipoMedicoPipe,
    FiltroTurnosPipe,
  ],
  imports: [
    CommonModule
  ],
  exports: [
    FechaPipe,
    RolPipe,
    MonedaPipe,
    FiltroUsuariosPipe,
    FiltroFichasPipe,
    HoraPipe,
    FiltroTipoMedicoPipe,
    FiltroTurnosPipe,
  ]
})
export class PipesModule { }
