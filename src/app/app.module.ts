import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { MaterialExampleModule } from "../material.module";
import { DatepickerLocaleComponent } from "./datepicker-locale.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
  DateAdapter,
  MatNativeDateModule,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from "@angular/material/core";
import { HttpClientModule } from "@angular/common/http";
import { IMaskModule } from "angular-imask";
import {
  LuxonDateAdapter,
  MAT_LUXON_DATE_ADAPTER_OPTIONS,
  MAT_LUXON_DATE_FORMATS,
} from "@angular/material-luxon-adapter";
import { FormFieldCustomControlExample } from "./app.component";
import { DateLocaleMaskService } from "./date-locale-mask.service";

@NgModule({
  declarations: [FormFieldCustomControlExample, DatepickerLocaleComponent],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    HttpClientModule,
    MatNativeDateModule,
    MaterialExampleModule,
    ReactiveFormsModule,
    IMaskModule,
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: "en-US" },
    {
      provide: DateLocaleMaskService,
      useClass: DateLocaleMaskService,
    },
    {
      provide: DateAdapter,
      useClass: LuxonDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_LUXON_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: MAT_LUXON_DATE_FORMATS },
  ],
  bootstrap: [FormFieldCustomControlExample],
})
export class AppModule {}
