import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'mascotas',
    loadComponent: () =>
      import('./pages/mascotas/mascotas.page').then(
        (m) => m.MascotasPage
      ),
  },
  {
    path: 'mascota-form',
    loadComponent: () =>
      import('./pages/mascota-form/mascota-form.page').then(
        (m) => m.MascotaFormPage
      ),
  },
  {
    path: 'mascota-form/:id',
    loadComponent: () =>
      import('./pages/mascota-form/mascota-form.page').then(
        (m) => m.MascotaFormPage
      ),
  },
  {
    path: 'recordatorios',
    loadComponent: () =>
      import('./pages/recordatorios/recordatorios.page').then(
        (m) => m.RecordatoriosPage
      ),
  },
  {
    path: 'historial',
    loadComponent: () =>
      import('./pages/historial/historial.page').then(
        (m) => m.HistorialPage
      ),
  },
  {
    path: 'configuracion',
    loadComponent: () =>
      import('./pages/configuracion/configuracion.page').then(
        (m) => m.ConfiguracionPage
      ),
  },
];
