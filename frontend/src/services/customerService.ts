import { authService } from './authService';
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
    // CORE CRUD OPERATIONS - FOR CUSTOMER MANAGEMENT PAGE
    // =============================================================================

    async createCustomer(customerData: CustomerInsertDTO): Promise<CustomerListItemDTO> {
        try {
            const response = await fetch(`${API_BASE_URL}`, {
                method: 'POST',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(customerData)
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
                    throw new Error('Customer with email or TIN already exists');
                }
                throw new Error(`Failed to create customer: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Create customer error:', error);
            throw error;
        }
    }

    async updateCustomer(customerId: number, customerData: CustomerUpdateDTO): Promise<CustomerListItemDTO> {
        try {
            const response = await fetch(`${API_BASE_URL}/${customerId}`, {
                method: 'PUT',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(customerData)
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
                    throw new Error('Customer not found');
                }
                if (response.status === 409) {
                    throw new Error('Email or TIN conflicts with existing customer');
                }
                throw new Error(`Failed to update customer: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Update customer error:', error);
            throw error;
        }
    }

    async deleteCustomer(customerId: number): Promise<void> {
        try {
            const response = await fetch(`${API_BASE_URL}/${customerId}`, {
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
                    throw new Error('Customer not found');
                }
                throw new Error(`Failed to delete customer: ${response.status}`);
            }
        } catch (error) {
            console.error('Delete customer error:', error);
            throw error;
        }
    }

    async getCustomerById(customerId: number): Promise<CustomerDetailedViewDTO> {
        try {
            const response = await fetch(`${API_BASE_URL}/${customerId}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                if (response.status === 401) {
                    this.handleAuthError(response);
                    throw new Error('Authentication failed - please log in again');
                }
                if (response.status === 404) {
                    throw new Error('Customer not found');
                }
                throw new Error(`Failed to get customer: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Get customer by ID error:', error);
            throw error;
        }
    }

    // =============================================================================
    // CUSTOMER VIEWING AND DETAILS - FOR CUSTOMER MANAGEMENT PAGE
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

            if (filters.email) queryParams.append('email', filters.email);
            if (filters.lastname) queryParams.append('lastname', filters.lastname);
            if (filters.tin) queryParams.append('tin', filters.tin);
            if (filters.phoneNumber) queryParams.append('phoneNumber', filters.phoneNumber);
            if (filters.searchTerm) queryParams.append('searchTerm', filters.searchTerm);
            if (filters.wholesaleOnly !== undefined) queryParams.append('wholesaleOnly', filters.wholesaleOnly.toString());
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
                throw new Error(`Failed to get customers: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Get customers filtered paginated error:', error);
            throw error;
        }
    }

    async getCustomerDetailedView(customerId: number): Promise<CustomerDetailedViewDTO> {
        try {
            const response = await fetch(`${API_BASE_URL}/${customerId}/details`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                if (response.status === 401) {
                    this.handleAuthError(response);
                    throw new Error('Authentication failed - please log in again');
                }
                if (response.status === 404) {
                    throw new Error('Customer not found');
                }
                throw new Error(`Failed to get customer detailed view: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Get customer detailed view error:', error);
            throw error;
        }
    }

    // =============================================================================
    // CUSTOMER SEARCH - FOR RECORD SALE PAGE
    // =============================================================================

    async searchCustomersForAutocomplete(searchTerm: string): Promise<CustomerSearchResultDTO[]> {
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
                throw new Error(`Failed to search customers: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Search customers for autocomplete error:', error);
            throw error;
        }
    }
}

// Export a singleton instance
export const customerService = new CustomerService();