import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-privacy',
  imports: [RouterLink, MatButtonModule],
  templateUrl: './privacy.component.html',
  styleUrl: './legal-page.css',
})
export class PrivacyComponent {}
