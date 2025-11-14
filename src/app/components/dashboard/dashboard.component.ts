import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserProductService } from '../../services/user-product.service';
import { WarrantyService } from '../../services/warranty.service';
import { ClaimService } from '../../services/claim.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  userProductCount: number = 0;
  warrantyCount: number = 0;
  claimCount: number = 0;

  constructor(
    private userProductService: UserProductService,
    private warrantyService: WarrantyService,
    private claimService: ClaimService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // Load user's products count
    this.userProductService.getUserProducts().subscribe({
      next: (products) => this.userProductCount = products.length,
      error: (err) => console.error('Error loading user products:', err)
    });

    // Load warranties count
    this.warrantyService.getWarranties().subscribe({
      next: (warranties) => this.warrantyCount = warranties.length,
      error: (err) => console.error('Error loading warranties:', err)
    });

    // Load claims count
    this.claimService.getClaims().subscribe({
      next: (claims) => this.claimCount = claims.length,
      error: (err) => console.error('Error loading claims:', err)
    });
  }
}
