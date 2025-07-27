// Updated procedureService.ts - Following CustomerService pattern with ApiErrorHandler

import { authService } from './authService';
import { ApiErrorHandler } from '../utils/apiErrorHandler';
import {
    ProcedureReadOnlyDTO,
    ProcedureInsertDTO,
    ProcedureUpdateDTO,
    ProcedureDetailedViewDTO,
    ProcedureForDropdownDTO
} from "../types/api/procedureInterface.ts";
import { ProductUsageDTO} from "../types/api/materialInterface.ts";
import { Paginated } from "../types/api/dashboardInterface.ts";

const API_BASE_URL = '/api/procedures';

class ProcedureService {

    private getAuthHeaders(): HeadersInit {
        const headers = authService.getAuthHeaders();
        console.log('Auth headers being sent:', headers);
        return headers;
    }

    // =============================================================================
    // CORE CRUD OPERATIONS - FOR PROCEDURE MANAGEMENT PAGE
    // =============================================================================

    async createProcedure(procedureData: ProcedureInsertDTO): Promise<ProcedureReadOnlyDTO> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}`, {
                method: 'POST',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(procedureData)
            });

            return await response.json();
        } catch (error) {
            console.error('Create procedure error:', error);
            throw error; // ApiError will be handled by the modal
        }
    }

    async updateProcedure(procedureId: number, procedureData: ProcedureUpdateDTO): Promise<ProcedureReadOnlyDTO> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/${procedureId}`, {
                method: 'PUT',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(procedureData)
            });

            return await response.json();
        } catch (error) {
            console.error('Update procedure error:', error);
            throw error;
        }
    }

    async deleteProcedure(procedureId: number): Promise<void> {
        try {
            await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/${procedureId}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });
        } catch (error) {
            console.error('Delete procedure error:', error);
            throw error;
        }
    }

    async getProcedureById(procedureId: number): Promise<ProcedureReadOnlyDTO> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/${procedureId}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

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
            console.error('Get procedures filtered paginated error:', error);
            throw error;
        }
    }

    async getProcedureDetailedView(procedureId: number): Promise<ProcedureDetailedViewDTO> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/${procedureId}/details`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

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
        page?: number;
        pageSize?: number;
        sortBy?: string;
        sortDirection?: string;
    }): Promise<Paginated<ProductUsageDTO>> {
        try {
            const queryParams = new URLSearchParams();

            // Add all filter parameters
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, value.toString());
                }
            });

            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/${procedureId}/products?${queryParams}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            return await response.json();
        } catch (error) {
            console.error('Get products using procedure error:', error);
            throw error;
        }
    }

    async getActiveProceduresForDropdown(): Promise<ProcedureForDropdownDTO[]> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/dropdown`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            return await response.json();
        } catch (error) {
            console.error('Get procedures for dropdown error:', error);
            throw error;
        }
    }

    async searchProceduresForAutocomplete(searchTerm: string): Promise<ProcedureForDropdownDTO[]> {
        try {
            const queryParams = new URLSearchParams();
            queryParams.append('searchTerm', searchTerm);

            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/search?${queryParams}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            return await response.json();
        } catch (error) {
            console.error('Search procedures for autocomplete error:', error);
            throw error;
        }
    }
}



// Export a singleton instance
export const procedureService = new ProcedureService();