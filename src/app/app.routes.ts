import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CompanyListComponent } from './components/company/company-list/company-list.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { UserProductsComponent } from './components/user-products/user-products.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'companies', component: CompanyListComponent },
  { path: 'products', component: UserProductsComponent },
  { path: '**', redirectTo: '' }
];
