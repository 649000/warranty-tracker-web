import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-terms',
  imports: [RouterLink, MatButtonModule],
  templateUrl: './terms.component.html',
  styleUrl: './legal-page.css',
})
export class TermsComponent {}
