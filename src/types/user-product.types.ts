import { Product } from './product.types';
import { User } from './user.types';

/**
 * Interface representing a user-product relationship
 * Describes the association between a user and their product purchase
 */
export interface UserProduct {
  /**
   * Unique identifier for the user-product record
   */
  id: number;
  /**
   * Serial number of the product
   */
  serialNumber: string;
  /**
   * Date when the product was purchased
   */
  purchaseDate: string;
  /**
   * Purchase price of the product
   */
  purchasePrice: number;
  /**
   * Location where the product was purchased
   */
  purchaseLocation: string;
  /**
   * Receipt number for the purchase
   */
  receiptNumber: string;
  /**
   * Additional notes about the purchase
   */
  notes: string;
  /**
   * Timestamp when the record was created
   */
  createdAt: string;
  /**
   * Timestamp when the record was last updated
   */
  updatedAt: string;
  /**
   * The product associated with this user
   */
  product: Product;
  /**
   * The user who owns this product
   */
  user: User;
}
