import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatNativeDateModule } from '@angular/material/core';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';

import { MatRadioModule } from '@angular/material/radio';
import { MatCardModule } from '@angular/material/card';
// import { MatMomentDateModule } from '@angular/material-moment-adapter';
const MATERIAL = [
  MatCardModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatButtonToggleModule,
  MatButtonModule,
  MatSnackBarModule,
  MatListModule,
  MatFormFieldModule,
  BrowserAnimationsModule,
  MatIconModule,
  MatSliderModule,
  MatSelectModule,
  MatInputModule,

  MatRadioModule,
  //MatMomentDateModule,
];
@NgModule({
  imports: [MATERIAL],
  exports: [MATERIAL],
})
export class material {}
