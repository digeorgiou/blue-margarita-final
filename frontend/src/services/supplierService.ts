// Updated supplierService.ts - Following CustomerService pattern with ApiErrorHandler

import { authService } from './authService';
import { ApiErrorHandler } from '../utils/apiErrorHandler';
import {
    SupplierReadOnlyDTO,
    SupplierInsertDTO,
    SupplierUpdateDTO,
    SupplierSearchResultDTO,
    SupplierDetailedViewDTO,
} from "../types/api/supplierInterface.ts";
import { Paginated } from "../types/api/dashboardInterface.ts";

const API_BASE_URL = '/api/suppliers';

class SupplierService {

    private getAuthHeaders(): HeadersInit {
        const headers = authService.getAuthHeaders();
        console.log('Auth headers being sent:', headers);
        return headers;
    }

    // =============================================================================
    // CORE CRUD OPERATIONS - FOR SUPPLIER MANAGEMENT PAGE
    // =============================================================================

    async createSupplier(supplierData: SupplierInsertDTO): Promise<SupplierReadOnlyDTO> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}`, {
                method: 'POST',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(supplierData)
            });

            return await response.json();
        } catch (error) {
            console.error('Create supplier error:', error);
            throw error; // ApiError will be handled by the modal
        }
    }

    async updateSupplier(supplierId: number, supplierData: SupplierUpdateDTO): Promise<SupplierReadOnlyDTO> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/${supplierId}`, {
                method: 'PUT',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(supplierData)
            });

            return await response.json();
        } catch (error) {
            console.error('Update supplier error:', error);
            throw error;
        }
    }

    async deleteSupplier(supplierId: number): Promise<void> {
        try {
            await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/${supplierId}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });
        } catch (error) {
            console.error('Delete supplier error:', error);
            throw error;
        }
    }

    async getSupplierById(supplierId: number): Promise<SupplierReadOnlyDTO> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/${supplierId}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            return await response.json();
        } catch (error) {
            console.error('Get supplier by ID error:', error);
            throw error;
        }
    }

    // =============================================================================
    // SUPPLIER VIEWING AND DETAILS - FOR SUPPLIER MANAGEMENT PAGE
    // =============================================================================

    async getSuppliersFilteredPaginated(filters: {
        name?: string;
        email?: string;
        phoneNumber?: string;
        tin?: string;
        isActive?: boolean;
        page?: number;
        pageSize?: number;
        sortBy?: string;
        sortDirection?: string;
    }): Promise<Paginated<SupplierReadOnlyDTO>> {
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
            console.error('Get suppliers filtered paginated error:', error);
            throw error;
        }
    }

    async getSupplierDetailedView(supplierId: number): Promise<SupplierDetailedViewDTO> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/${supplierId}/details`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            return await response.json();
        } catch (error) {
            console.error('Get supplier detailed view error:', error);
            throw error;
        }
    }

    // =============================================================================
    // SUPPLIER SEARCH - FOR RECORD PURCHASE AND OTHER FORMS
    // =============================================================================

    async searchSuppliersForAutocomplete(searchTerm: string): Promise<SupplierSearchResultDTO[]> {
        try {
            const queryParams = new URLSearchParams();
            queryParams.append('searchTerm', searchTerm);

            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/search?${queryParams}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            return await response.json();
        } catch (error) {
            console.error('Search suppliers for autocomplete error:', error);
            throw error;
        }
    }
}

// Export a singleton instance
export const supplierService = new SupplierService();