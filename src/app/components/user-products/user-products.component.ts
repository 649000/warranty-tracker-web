import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserProductService } from '../../services/user-product.service';
import { UserProduct } from '../../models/user-product';

@Component({
  selector: 'app-user-products',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-products.component.html',
  styleUrls: ['./user-products.component.css']
})
export class UserProductsComponent implements OnInit {
  userProducts: UserProduct[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(private userProductService: UserProductService) {}

  ngOnInit(): void {
    this.loadUserProducts();
  }

  loadUserProducts(): void {
    this.loading = true;
    this.error = null;

    this.userProductService.getUserProducts().subscribe({
      next: (products) => {
        this.userProducts = products;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load your products. Please try again.';
        console.error('Error loading user products:', err);
        this.loading = false;
      }
    });
  }

  formatDate(date: Date | string): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString();
  }

  formatPrice(price?: number): string {
    if (!price) return 'N/A';
    return `$${price.toFixed(2)}`;
  }
}
