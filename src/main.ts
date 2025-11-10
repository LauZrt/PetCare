import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { environment } from './environments/environment';

import { IonicStorageModule } from '@ionic/storage-angular';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    // Inicializa Ionic correctamente (estilos, componentes, etc.)
    provideIonicAngular(),
    // Rutas de la app
    provideRouter(routes),
    // Activamos Ionic Storage sin romper lo anterior
    importProvidersFrom(IonicStorageModule.forRoot()),
  ],
});
