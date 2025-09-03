import { authService } from './authService';
import { ApiErrorHandler } from '../utils/apiErrorHandler';
import {
    MaterialReadOnlyDTO,
    MaterialInsertDTO,
    MaterialUpdateDTO,
    MaterialSearchResultDTO,
    MaterialDetailedViewDTO,
    ProductUsageDTO,
} from "../types/api/materialInterface.ts";
import { Paginated } from "../types/api/dashboardInterface.ts";

const API_BASE_URL = '/api/materials';

class MaterialService {

    private getAuthHeaders(): HeadersInit {
        const headers = authService.getAuthHeaders();
        console.log('Auth headers being sent:', headers);
        return headers;
    }

    // =============================================================================
    // CORE CRUD OPERATIONS - FOR MATERIAL MANAGEMENT PAGE
    // =============================================================================

    async createMaterial(materialData: MaterialInsertDTO): Promise<MaterialReadOnlyDTO> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}`, {
                method: 'POST',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(materialData)
            });

            return await response.json();
        } catch (error) {
            console.error('Create material error:', error);
            throw error; // ApiError will be handled by the modal
        }
    }

    async updateMaterial(materialId: number, materialData: MaterialUpdateDTO): Promise<MaterialReadOnlyDTO> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/${materialId}`, {
                method: 'PUT',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(materialData)
            });

            return await response.json();
        } catch (error) {
            console.error('Update material error:', error);
            throw error;
        }
    }

    async deleteMaterial(materialId: number): Promise<void> {
        try {
            await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/${materialId}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });
        } catch (error) {
            console.error('Delete material error:', error);
            throw error;
        }
    }

    async restoreMaterial(materialId: number): Promise<MaterialReadOnlyDTO> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/${materialId}/restore`, {
                method: 'PUT',
                headers: this.getAuthHeaders()
            });

            return await response.json();
        } catch (error) {
            console.error('Restore material error:', error);
            throw error;
        }
    }

    async getMaterialById(materialId: number): Promise<MaterialReadOnlyDTO> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/${materialId}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            return await response.json();
        } catch (error) {
            console.error('Get material by ID error:', error);
            throw error;
        }
    }

    // =============================================================================
    // MATERIAL VIEWING AND LISTING - FOR MATERIAL MANAGEMENT PAGE
    // =============================================================================

    async getMaterialsFilteredPaginated(filters: {
        name?: string;
        unitOfMeasure?: string;
        isActive?: boolean;
        minCost?: number;
        maxCost?: number;
        page?: number;
        pageSize?: number;
        sortBy?: string;
        sortDirection?: string;
    }): Promise<Paginated<MaterialReadOnlyDTO>> {
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
            console.error('Get materials filtered paginated error:', error);
            throw error;
        }
    }

    async getMaterialDetailedView(materialId: number): Promise<MaterialDetailedViewDTO> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/${materialId}/details`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            return await response.json();
        } catch (error) {
            console.error('Get material detailed view error:', error);
            throw error;
        }
    }

    async getAllProductsUsingMaterial(materialId: number, filters: {
        nameOrCode?: string;
        categoryId?: number;
        procedureId?: number;
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

            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/${materialId}/products?${queryParams}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            return await response.json();
        } catch (error) {
            console.error('Get products using material error:', error);
            throw error;
        }
    }

    // =============================================================================
    // MATERIAL SEARCH - FOR RECORD PURCHASE PAGE
    // =============================================================================

    async searchMaterialsForAutocomplete(searchTerm: string): Promise<MaterialSearchResultDTO[]> {
        try {
            const queryParams = new URLSearchParams();
            queryParams.append('searchTerm', searchTerm);

            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/search?${queryParams}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            return await response.json();
        } catch (error) {
            console.error('Search materials for autocomplete error:', error);
            throw error;
        }
    }

}

// Export a singleton instance
export const materialService = new MaterialService();