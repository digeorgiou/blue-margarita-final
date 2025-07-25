import { authService } from './authService';
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

    private handleAuthError(response: Response): void {
        console.error('AUTH ERROR DETAILS:', {
            status: response.status,
            statusText: response.statusText,
            url: response.url,
            headers: Object.fromEntries(response.headers.entries())
        });
        if (response.status === 401) {
            console.error('Authentication failed - token may be expired or invalid');
            throw new Error(`401 Unauthorized: ${response.statusText} - Check console for details`);
        }
    }

    // =============================================================================
    // CORE CRUD OPERATIONS - FOR SUPPLIER MANAGEMENT PAGE
    // =============================================================================

    async createSupplier(supplierData: SupplierInsertDTO): Promise<SupplierReadOnlyDTO> {
        try {
            const response = await fetch(`${API_BASE_URL}`, {
                method: 'POST',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(supplierData)
            });

            if (!response.ok) {
                if (response.status === 400) {
                    throw new Error('Validation errors');
                }
                if (response.status === 401) {
                    this.handleAuthError(response);
                    throw new Error('Authentication failed - please log in again');
                }
                if (response.status === 409) {
                    throw new Error('Supplier with TIN or email already exists');
                }
                throw new Error(`Failed to create supplier: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Create supplier error:', error);
            throw error;
        }
    }

    async updateSupplier(supplierId: number, supplierData: SupplierUpdateDTO): Promise<SupplierReadOnlyDTO> {
        try {
            const response = await fetch(`${API_BASE_URL}/${supplierId}`, {
                method: 'PUT',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(supplierData)
            });

            if (!response.ok) {
                if (response.status === 400) {
                    throw new Error('Validation errors');
                }
                if (response.status === 401) {
                    this.handleAuthError(response);
                    throw new Error('Authentication failed - please log in again');
                }
                if (response.status === 404) {
                    throw new Error('Supplier not found');
                }
                if (response.status === 409) {
                    throw new Error('TIN or email conflicts with existing supplier');
                }
                throw new Error(`Failed to update supplier: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Update supplier error:', error);
            throw error;
        }
    }

    async deleteSupplier(supplierId: number): Promise<void> {
        try {
            const response = await fetch(`${API_BASE_URL}/${supplierId}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                if (response.status === 401) {
                    this.handleAuthError(response);
                    throw new Error('Authentication failed - please log in again');
                }
                if (response.status === 403) {
                    throw new Error('Access denied - requires ADMIN role');
                }
                if (response.status === 404) {
                    throw new Error('Supplier not found');
                }
                throw new Error(`Failed to delete supplier: ${response.status}`);
            }
        } catch (error) {
            console.error('Delete supplier error:', error);
            throw error;
        }
    }

    async getSupplierById(supplierId: number): Promise<SupplierReadOnlyDTO> {
        try {
            const response = await fetch(`${API_BASE_URL}/${supplierId}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                if (response.status === 401) {
                    this.handleAuthError(response);
                    throw new Error('Authentication failed - please log in again');
                }
                if (response.status === 404) {
                    throw new Error('Supplier not found');
                }
                throw new Error(`Failed to get supplier: ${response.status}`);
            }

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

            if (filters.name) queryParams.append('name', filters.name);
            if (filters.email) queryParams.append('email', filters.email);
            if (filters.phoneNumber) queryParams.append('phoneNumber', filters.phoneNumber);
            if (filters.tin) queryParams.append('tin', filters.tin);
            if (filters.isActive !== undefined) queryParams.append('isActive', filters.isActive.toString());
            if (filters.page !== undefined) queryParams.append('page', filters.page.toString());
            if (filters.pageSize !== undefined) queryParams.append('pageSize', filters.pageSize.toString());
            if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
            if (filters.sortDirection) queryParams.append('sortDirection', filters.sortDirection);

            const response = await fetch(`${API_BASE_URL}?${queryParams}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                if (response.status === 401) {
                    this.handleAuthError(response);
                    throw new Error('Authentication failed - please log in again');
                }
                throw new Error(`Failed to get suppliers: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Get suppliers filtered paginated error:', error);
            throw error;
        }
    }

    async getSupplierDetailedView(supplierId: number): Promise<SupplierDetailedViewDTO> {
        try {
            const response = await fetch(`${API_BASE_URL}/${supplierId}/details`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                if (response.status === 401) {
                    this.handleAuthError(response);
                    throw new Error('Authentication failed - please log in again');
                }
                if (response.status === 404) {
                    throw new Error('Supplier not found');
                }
                throw new Error(`Failed to get supplier detailed view: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Get supplier detailed view error:', error);
            throw error;
        }
    }

    // =============================================================================
    // SUPPLIER SEARCH  - FOR RECORD PURCHASE AND OTHER FORMS
    // =============================================================================



    async searchSuppliersForAutocomplete(searchTerm: string): Promise<SupplierSearchResultDTO[]> {
        try {
            const queryParams = new URLSearchParams();
            queryParams.append('searchTerm', searchTerm);

            const response = await fetch(`${API_BASE_URL}/search?${queryParams}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                if (response.status === 401) {
                    this.handleAuthError(response);
                    throw new Error('Authentication failed - please log in again');
                }
                throw new Error(`Failed to search suppliers: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Search suppliers for autocomplete error:', error);
            throw error;
        }
    }
}

// Export a singleton instance
export const supplierService = new SupplierService();