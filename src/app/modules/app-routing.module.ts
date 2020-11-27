import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CountryListComponent } from '../components/country-list/country-list.component';
import { ResultsComponent } from '../components/results/results.component';
import { SettingComponent } from '../components/setting/setting.component';

const appRoute: Routes = [
  { path: 'countries/:code', component: ResultsComponent },
  { path: 'countries', component: CountryListComponent },
  { path: 'setting', component: SettingComponent },
  { path: 'result', component: ResultsComponent },
  { path: '**', redirectTo: '/countries', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(appRoute)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
