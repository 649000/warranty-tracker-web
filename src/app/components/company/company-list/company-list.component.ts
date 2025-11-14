import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CompanyService } from '../../../services/company.service';
import { Company } from '../../../models/company';

@Component({
  selector: 'app-company-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './company-list.component.html',
  styleUrls: ['./company-list.component.css']
})
export class CompanyListComponent implements OnInit {
  companies: Company[] = [];
  filteredCompanies: Company[] = [];
  searchTerm: string = '';
  loading: boolean = true;
  error: string | null = null;

  constructor(private companyService: CompanyService) {}

  ngOnInit(): void {
    this.loadCompanies();
  }

  loadCompanies(): void {
    this.loading = true;
    this.error = null;

    this.companyService.getAllCompanies().subscribe({
      next: (companies) => {
        this.companies = companies;
        this.filteredCompanies = companies;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load companies. Please try again.';
        console.error('Error loading companies:', err);
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    if (this.searchTerm.trim()) {
      this.companyService.searchCompanies(this.searchTerm).subscribe({
        next: (companies) => {
          this.filteredCompanies = companies;
        },
        error: (err) => {
          console.error('Error searching companies:', err);
          this.filteredCompanies = [];
        }
      });
    } else {
      this.filteredCompanies = this.companies;
    }
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filteredCompanies = this.companies;
  }

  viewCompany(company: Company): void {
    // TODO: Navigate to company detail view
    console.log('View company:', company);
  }
}
