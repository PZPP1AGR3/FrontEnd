import {ApplicationConfig, importProvidersFrom, provideExperimentalZonelessChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import {provideAnimations} from "@angular/platform-browser/animations";
import {ConfirmationService, MessageService} from "primeng/api";
import {DialogService} from "primeng/dynamicdialog";
import {provideHttpClient, withInterceptors} from "@angular/common/http";
import {ApiModule, BASE_PATH} from "./core/swagger";
import {environment} from "../environments/environment";

export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection(),
    provideAnimations(),
    provideRouter(routes),
    {provide: MessageService},
    {provide: DialogService},
    {provide: ConfirmationService},
    provideHttpClient(
      withInterceptors([])
    ),
    importProvidersFrom(
      ApiModule
    ),
    {provide: BASE_PATH, useValue: environment.apiUrl}
  ]
};
