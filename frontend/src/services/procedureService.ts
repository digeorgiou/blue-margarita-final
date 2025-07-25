import { authService } from './authService';
import {
    ProcedureReadOnlyDTO,
    ProcedureInsertDTO,
    ProcedureUpdateDTO,
    ProcedureForDropdownDTO,
    ProcedureDetailedViewDTO,
} from "../types/api/procedureInterface.ts";
import { Paginated } from "../types/api/dashboardInterface.ts";
import {PriceRecalculationResultDT, ProductUsageDTO} from "../types/api/materialInterface.ts";

const API_BASE_URL = '/api/procedures';

class ProcedureService {

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
    // CORE CRUD OPERATIONS - FOR PROCEDURE MANAGEMENT PAGE
    // =============================================================================

    async createProcedure(procedureData: ProcedureInsertDTO): Promise<ProcedureReadOnlyDTO> {
        try {
            const response = await fetch(`${API_BASE_URL}`, {
                method: 'POST',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(procedureData)
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
                    throw new Error('Procedure with name already exists');
                }
                throw new Error(`Failed to create procedure: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Create procedure error:', error);
            throw error;
        }
    }

    async updateProcedure(procedureId: number, procedureData: ProcedureUpdateDTO): Promise<ProcedureReadOnlyDTO> {
        try {
            const response = await fetch(`${API_BASE_URL}/${procedureId}`, {
                method: 'PUT',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(procedureData)
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
                    throw new Error('Procedure not found');
                }
                if (response.status === 409) {
                    throw new Error('Procedure with name already exists');
                }
                throw new Error(`Failed to update procedure: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Update procedure error:', error);
            throw error;
        }
    }

    async deleteProcedure(procedureId: number): Promise<void> {
        try {
            const response = await fetch(`${API_BASE_URL}/${procedureId}`, {
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
                    throw new Error('Procedure not found');
                }
                throw new Error(`Failed to delete procedure: ${response.status}`);
            }
        } catch (error) {
            console.error('Delete procedure error:', error);
            throw error;
        }
    }

    async getProcedureById(procedureId: number): Promise<ProcedureReadOnlyDTO> {
        try {
            const response = await fetch(`${API_BASE_URL}/${procedureId}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                if (response.status === 401) {
                    this.handleAuthError(response);
                    throw new Error('Authentication failed - please log in again');
                }
                if (response.status === 404) {
                    throw new Error('Procedure not found');
                }
                throw new Error(`Failed to get procedure: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Get procedure by ID error:', error);
            throw error;
        }
    }

    // =============================================================================
    // PROCEDURE VIEWING AND LISTING - FOR PROCEDURE MANAGEMENT PAGE
    // =============================================================================

    async getProceduresFilteredPaginated(filters: {
        name?: string;
        isActive?: boolean;
        page?: number;
        pageSize?: number;
        sortBy?: string;
        sortDirection?: string;
    }): Promise<Paginated<ProcedureReadOnlyDTO>> {
        try {
            const queryParams = new URLSearchParams();

            if (filters.name) queryParams.append('name', filters.name);
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
                throw new Error(`Failed to get procedures: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Get procedures filtered paginated error:', error);
            throw error;
        }
    }

    async getProcedureDetailedView(procedureId: number): Promise<ProcedureDetailedViewDTO> {
        try {
            const response = await fetch(`${API_BASE_URL}/${procedureId}/details`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                if (response.status === 401) {
                    this.handleAuthError(response);
                    throw new Error('Authentication failed - please log in again');
                }
                if (response.status === 404) {
                    throw new Error('Procedure not found');
                }
                throw new Error(`Failed to get procedure detailed view: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Get procedure detailed view error:', error);
            throw error;
        }
    }

    // =============================================================================
    // PRODUCT RELATIONSHIP OPERATIONS
    // =============================================================================

    async getAllProductsUsingProcedure(procedureId: number, filters: {
        nameOrCode?: string;
        categoryId?: number;
        materialName?: string;
        materialId?: number;
        minPrice?: number;
        maxPrice?: number;
        minStock?: number;
        maxStock?: number;
        isActive?: boolean;
        lowStock?: boolean;
        page?: number;
        pageSize?: number;
        sortBy?: string;
        sortDirection?: string;
    }): Promise<Paginated<ProductUsageDTO>> {
        try {
            const queryParams = new URLSearchParams();

            if (filters.nameOrCode) queryParams.append('nameOrCode', filters.nameOrCode);
            if (filters.categoryId !== undefined) queryParams.append('categoryId', filters.categoryId.toString());
            if (filters.materialName) queryParams.append('materialName', filters.materialName);
            if (filters.materialId !== undefined) queryParams.append('materialId', filters.materialId.toString());
            if (filters.minPrice !== undefined) queryParams.append('minPrice', filters.minPrice.toString());
            if (filters.maxPrice !== undefined) queryParams.append('maxPrice', filters.maxPrice.toString());
            if (filters.minStock !== undefined) queryParams.append('minStock', filters.minStock.toString());
            if (filters.maxStock !== undefined) queryParams.append('maxStock', filters.maxStock.toString());
            if (filters.isActive !== undefined) queryParams.append('isActive', filters.isActive.toString());
            if (filters.lowStock !== undefined) queryParams.append('lowStock', filters.lowStock.toString());
            if (filters.page !== undefined) queryParams.append('page', filters.page.toString());
            if (filters.pageSize !== undefined) queryParams.append('pageSize', filters.pageSize.toString());
            if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
            if (filters.sortDirection) queryParams.append('sortDirection', filters.sortDirection);

            const response = await fetch(`${API_BASE_URL}/${procedureId}/products?${queryParams}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                if (response.status === 401) {
                    this.handleAuthError(response);
                    throw new Error('Authentication failed - please log in again');
                }
                if (response.status === 404) {
                    throw new Error('Procedure not found');
                }
                throw new Error(`Failed to get products using procedure: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Get products using procedure error:', error);
            throw error;
        }
    }

    // =============================================================================
    // DROPDOWN AND SELECTION ENDPOINTS - FOR PRODUCT FORMS
    // =============================================================================

    async getActiveProceduresForDropdown(): Promise<ProcedureForDropdownDTO[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/dropdown`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                if (response.status === 401) {
                    this.handleAuthError(response);
                    throw new Error('Authentication failed - please log in again');
                }
                throw new Error(`Failed to get procedures dropdown: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Procedures dropdown error:', error);
            throw error;
        }
    }

    // =============================================================================
    // BULK OPERATIONS - PRICE RECALCULATION
    // =============================================================================

    async recalculateAllProductPrices(updaterUserId: number): Promise<PriceRecalculationResultDT> {
        try {
            const queryParams = new URLSearchParams();
            queryParams.append('updaterUserId', updaterUserId.toString());

            const response = await fetch(`${API_BASE_URL}/recalculate-all-prices?${queryParams}`, {
                method: 'POST',
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
                    throw new Error('User not found');
                }
                throw new Error(`Failed to recalculate product prices: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Recalculate all product prices error:', error);
            throw error;
        }
    }
}

// Export a singleton instance
export const procedureService = new ProcedureService();