'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { warrantyApi } from '@/services/warranty.service';
import { userProductApi } from '@/services/user-product.service';
import { Warranty } from '@/types/warranty.types';
import { UserProduct } from '@/types/user-product.types';

export default function WarrantiesPage() {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    userProductId: 0,
    companyId: 0,
    startDate: new Date().toISOString().split('T')[0],
    warrantyPeriod: 365,
    warrantyType: 'Standard',
    notes: ''
  });

  // Fetch warranties
  const { data: warranties = [], isLoading: warrantiesLoading } = useQuery({
    queryKey: ['warranties'],
    queryFn: warrantyApi.getUserWarranties,
  });

  // Fetch user products
  const { data: userProducts = [], isLoading: userProductsLoading } = useQuery({
    queryKey: ['userProducts'],
    queryFn: userProductApi.getUserProducts,
  });

  // Create warranty mutation
  const { mutate: createWarranty, isPending: isCreating } = useMutation({
    mutationFn: warrantyApi.createWarranty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warranties'] });
      setShowAddForm(false);
      setFormData({
        userProductId: 0,
        companyId: 0,
        startDate: new Date().toISOString().split('T')[0],
        warrantyPeriod: 365,
        warrantyType: 'Standard',
        notes: ''
      });
    }
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createWarranty({
      ...formData,
      startDate: formData.startDate
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Warranties</h1>
              <p className="text-gray-600 mt-2">Manage your product warranties and track expiration dates</p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Warranty
            </button>
          </div>
        </div>

        {/* Add Warranty Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Add New Warranty</h2>
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
                      <label htmlFor="userProductId" className="block text-sm font-medium text-gray-700">Product</label>
                      <select
                        id="userProductId"
                        value={formData.userProductId}
                        onChange={(e) => setFormData({...formData, userProductId: parseInt(e.target.value)})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        required
                      >
                        <option value="">Select a product</option>
                        {userProducts.map(userProduct => (
                          <option key={userProduct.id} value={userProduct.id}>
                            {userProduct.product.name} - {userProduct.serialNumber}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
                      <input
                        type="date"
                        id="startDate"
                        value={formData.startDate}
                        onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="warrantyPeriod" className="block text-sm font-medium text-gray-700">Warranty Period (days)</label>
                      <input
                        type="number"
                        id="warrantyPeriod"
                        value={formData.warrantyPeriod}
                        onChange={(e) => setFormData({...formData, warrantyPeriod: parseInt(e.target.value) || 0})}
                        min="1"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="warrantyType" className="block text-sm font-medium text-gray-700">Warranty Type</label>
                      <input
                        type="text"
                        id="warrantyType"
                        value={formData.warrantyType}
                        onChange={(e) => setFormData({...formData, warrantyType: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        required
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
                      ) : 'Save Warranty'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Warranties List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {warrantiesLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : warranties.length === 0 ? (
            <div className="text-center py-12">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No warranties found</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding your first warranty.</p>
              <div className="mt-6">
                <button
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Warranty
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
                    Start Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {warranties.map((warranty) => (
                  <tr key={warranty.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {warranty.userProduct.product.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {warranty.userProduct.serialNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(warranty.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(warranty.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {warranty.warrantyPeriod} days
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        warranty.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800' 
                          : warranty.status === 'EXPIRED' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                        {warranty.status}
                      </span>
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
