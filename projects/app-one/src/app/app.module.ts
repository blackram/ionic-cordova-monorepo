import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppCommonModule } from 'app-common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AppCommonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
