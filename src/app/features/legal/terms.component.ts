import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { SiteHeaderComponent } from '../../shared/site-header.component';
import { SiteFooterComponent } from '../../shared/site-footer.component';

@Component({
  selector: 'app-terms',
  imports: [RouterLink, MatButtonModule, SiteHeaderComponent, SiteFooterComponent],
  templateUrl: './terms.component.html',
  styleUrl: './legal-page.css',
})
export class TermsComponent {}
