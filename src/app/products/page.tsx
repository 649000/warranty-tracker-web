'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi } from '@/services/product.service';
import { userProductApi } from '@/services/user-product.service';
import { Product } from '@/types/product.types';
import { UserProduct } from '@/types/user-product.types';

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    productId: 0,
    serialNumber: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    purchasePrice: 0,
    purchaseLocation: '',
    receiptNumber: '',
    notes: ''
  });

  // Fetch products
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: productApi.getAllProducts,
  });

  // Fetch user products
  const { data: userProducts = [], isLoading: userProductsLoading } = useQuery({
    queryKey: ['userProducts'],
    queryFn: userProductApi.getUserProducts,
  });

  // Create user product mutation
  const { mutate: createUserProduct, isPending: isCreating } = useMutation({
    mutationFn: userProductApi.createUserProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProducts'] });
      setShowAddForm(false);
      setFormData({
        productId: 0,
        serialNumber: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        purchasePrice: 0,
        purchaseLocation: '',
        receiptNumber: '',
        notes: ''
      });
    }
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createUserProduct({
      ...formData,
      purchasePrice: parseFloat(formData.purchasePrice as any)
    });
  };

  // Filter products based on search term
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.modelNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
              <p className="text-gray-600 mt-2">Manage your registered products and warranties</p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Product
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 py-3 sm:text-sm border-gray-300 rounded-md"
              placeholder="Search products..."
            />
          </div>
        </div>

        {/* Add Product Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Register New Product</h2>
                  <button 
                    onClick={() => setShowAddForm(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="productId" className="block text-sm font-medium text-gray-700">Product</label>
                      <select
                        id="productId"
                        value={formData.productId}
                        onChange={(e) => setFormData({...formData, productId: parseInt(e.target.value)})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        required
                      >
                        <option value="">Select a product</option>
                        {products.map(product => (
                          <option key={product.id} value={product.id}>
                            {product.name} - {product.modelNumber}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="serialNumber" className="block text-sm font-medium text-gray-700">Serial Number</label>
                      <input
                        type="text"
                        id="serialNumber"
                        value={formData.serialNumber}
                        onChange={(e) => setFormData({...formData, serialNumber: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700">Purchase Date</label>
                      <input
                        type="date"
                        id="purchaseDate"
                        value={formData.purchaseDate}
                        onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-700">Purchase Price ($)</label>
                      <input
                        type="number"
                        id="purchasePrice"
                        value={formData.purchasePrice}
                        onChange={(e) => setFormData({...formData, purchasePrice: parseFloat(e.target.value) || 0})}
                        step="0.01"
                        min="0"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="purchaseLocation" className="block text-sm font-medium text-gray-700">Purchase Location</label>
                      <input
                        type="text"
                        id="purchaseLocation"
                        value={formData.purchaseLocation}
                        onChange={(e) => setFormData({...formData, purchaseLocation: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="receiptNumber" className="block text-sm font-medium text-gray-700">Receipt Number</label>
                      <input
                        type="text"
                        id="receiptNumber"
                        value={formData.receiptNumber}
                        onChange={(e) => setFormData({...formData, receiptNumber: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
                      <textarea
                        id="notes"
                        rows={3}
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCreating}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {isCreating ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </>
                      ) : 'Save Product'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Products List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {userProductsLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : userProducts.length === 0 ? (
            <div className="text-center py-12">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No products registered</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by registering your first product.</p>
              <div className="mt-6">
                <button
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Product
                </button>
              </div>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Serial Number
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Purchase Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {userProducts.map((userProduct) => (
                  <tr key={userProduct.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {userProduct.product.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {userProduct.product.modelNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {userProduct.serialNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(userProduct.purchaseDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${userProduct.purchasePrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                      <button className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
