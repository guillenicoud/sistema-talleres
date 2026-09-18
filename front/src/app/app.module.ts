import { LOCALE_ID, NgModule } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AlumnosComponent } from './components/alumnos/alumnos.component';
import { TalleresComponent } from './components/talleres/talleres.component';
import { TalleristasComponent } from './components/talleristas/talleristas.component';
import { HttpClientModule } from '@angular/common/http';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { FormsModule } from '@angular/forms';
import { DetalleTallerComponent } from './components/detalle-taller/detalle-taller.component';

registerLocaleData(localeEsAr);

const routes: Routes = [
 { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'alumnos', component: AlumnosComponent },
  { path: 'talleres', component: TalleresComponent },
  { path: 'talleristas', component: TalleristasComponent },
  { path: 'detalle-taller', component: DetalleTallerComponent},
  { path: '**', redirectTo: 'dashboard' },
];


@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    AlumnosComponent,
    TalleresComponent,
    TalleristasComponent,
    SidebarComponent,
    DetalleTallerComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
    FormsModule
  ],
  providers: [{ provide: LOCALE_ID, useValue: 'es-AR' }],
  bootstrap: [AppComponent]
})
export class AppModule { }
