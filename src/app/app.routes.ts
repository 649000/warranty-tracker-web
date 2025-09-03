import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CompanyListComponent } from './components/company/company-list/company-list.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'companies', component: CompanyListComponent },
  { path: '**', redirectTo: '' }
];
