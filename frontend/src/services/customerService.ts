// Complete updated customerService.ts using the new ApiErrorHandler

import { authService } from './authService';
import { ApiErrorHandler } from '../utils/apiErrorHandler';
import {
    CustomerListItemDTO,
    CustomerInsertDTO,
    CustomerUpdateDTO,
    CustomerDetailedViewDTO,
    CustomerSearchResultDTO,
    Paginated
} from "../types/api/customerInterface.ts";

const API_BASE_URL = '/api/customers';

class CustomerService {

    private getAuthHeaders(): HeadersInit {
        const headers = authService.getAuthHeaders();
        console.log('Auth headers being sent:', headers);
        return headers;
    }

    // =============================================================================
    // CORE CRUD OPERATIONS - FOR CUSTOMER MANAGEMENT PAGE
    // =============================================================================

    async createCustomer(customerData: CustomerInsertDTO): Promise<CustomerListItemDTO> {
        try {
            // Use the enhanced fetch that automatically handles errors according to your backend contract
            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}`, {
                method: 'POST',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(customerData)
            });

            return await response.json();
        } catch (error) {
            console.error('Create customer error:', error);
            throw error; // ApiError will be handled by the modal
        }
    }

    async updateCustomer(customerId: number, customerData: CustomerUpdateDTO): Promise<CustomerListItemDTO> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/${customerId}`, {
                method: 'PUT',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(customerData)
            });

            return await response.json();
        } catch (error) {
            console.error('Update customer error:', error);
            throw error;
        }
    }

    async deleteCustomer(customerId: number): Promise<void> {
        try {
            await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/${customerId}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });
        } catch (error) {
            console.error('Delete customer error:', error);
            throw error;
        }
    }

    async getCustomerById(customerId: number): Promise<CustomerDetailedViewDTO> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/${customerId}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            return await response.json();
        } catch (error) {
            console.error('Get customer by ID error:', error);
            throw error;
        }
    }

    async getCustomerDetailedView(customerId: number): Promise<CustomerDetailedViewDTO> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/${customerId}/details`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            return await response.json();
        } catch (error) {
            console.error('Get customer detailed view error:', error);
            throw error;
        }
    }

    // =============================================================================
    // CUSTOMER SEARCH AND FILTERING
    // =============================================================================

    async getCustomersFilteredPaginated(filters: {
        email?: string;
        lastname?: string;
        tin?: string;
        phoneNumber?: string;
        searchTerm?: string;
        wholesaleOnly?: boolean;
        isActive?: boolean;
        page?: number;
        pageSize?: number;
        sortBy?: string;
        sortDirection?: string;
    }): Promise<Paginated<CustomerListItemDTO>> {
        try {
            const queryParams = new URLSearchParams();

            // Add all filter parameters
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, value.toString());
                }
            });

            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}?${queryParams}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            return await response.json();
        } catch (error) {
            console.error('Get customers filtered paginated error:', error);
            throw error;
        }
    }

    async searchCustomersForAutocomplete(searchTerm: string): Promise<CustomerSearchResultDTO[]> {
        try {
            const queryParams = new URLSearchParams();
            queryParams.append('searchTerm', searchTerm);

            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/search?${queryParams}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            return await response.json();
        } catch (error) {
            console.error('Search customers for autocomplete error:', error);
            throw error;
        }
    }
}

// Export a singleton instance
export const customerService = new CustomerService();