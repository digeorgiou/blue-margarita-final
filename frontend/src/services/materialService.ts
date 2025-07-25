import { authService } from './authService';
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
    // CORE CRUD OPERATIONS - FOR MATERIAL MANAGEMENT PAGE
    // =============================================================================

    async createMaterial(materialData: MaterialInsertDTO): Promise<MaterialReadOnlyDTO> {
        try {
            const response = await fetch(`${API_BASE_URL}`, {
                method: 'POST',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(materialData)
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
                    throw new Error('Material with name already exists');
                }
                throw new Error(`Failed to create material: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Create material error:', error);
            throw error;
        }
    }

    async updateMaterial(materialId: number, materialData: MaterialUpdateDTO): Promise<MaterialReadOnlyDTO> {
        try {
            const response = await fetch(`${API_BASE_URL}/${materialId}`, {
                method: 'PUT',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(materialData)
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
                    throw new Error('Material not found');
                }
                if (response.status === 409) {
                    throw new Error('Material with name already exists');
                }
                throw new Error(`Failed to update material: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Update material error:', error);
            throw error;
        }
    }

    async deleteMaterial(materialId: number): Promise<void> {
        try {
            const response = await fetch(`${API_BASE_URL}/${materialId}`, {
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
                    throw new Error('Material not found');
                }
                throw new Error(`Failed to delete material: ${response.status}`);
            }
        } catch (error) {
            console.error('Delete material error:', error);
            throw error;
        }
    }

    async getMaterialById(materialId: number): Promise<MaterialReadOnlyDTO> {
        try {
            const response = await fetch(`${API_BASE_URL}/${materialId}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                if (response.status === 401) {
                    this.handleAuthError(response);
                    throw new Error('Authentication failed - please log in again');
                }
                if (response.status === 404) {
                    throw new Error('Material not found');
                }
                throw new Error(`Failed to get material: ${response.status}`);
            }

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

            if (filters.name) queryParams.append('name', filters.name);
            if (filters.unitOfMeasure) queryParams.append('unitOfMeasure', filters.unitOfMeasure);
            if (filters.isActive !== undefined) queryParams.append('isActive', filters.isActive.toString());
            if (filters.minCost !== undefined) queryParams.append('minCost', filters.minCost.toString());
            if (filters.maxCost !== undefined) queryParams.append('maxCost', filters.maxCost.toString());
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
                throw new Error(`Failed to get materials: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Get materials filtered paginated error:', error);
            throw error;
        }
    }

    async getMaterialDetailedView(materialId: number): Promise<MaterialDetailedViewDTO> {
        try {
            const response = await fetch(`${API_BASE_URL}/${materialId}/details`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                if (response.status === 401) {
                    this.handleAuthError(response);
                    throw new Error('Authentication failed - please log in again');
                }
                if (response.status === 404) {
                    throw new Error('Material not found');
                }
                throw new Error(`Failed to get material detailed view: ${response.status}`);
            }

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

            if (filters.nameOrCode) queryParams.append('nameOrCode', filters.nameOrCode);
            if (filters.categoryId !== undefined) queryParams.append('categoryId', filters.categoryId.toString());
            if (filters.procedureId !== undefined) queryParams.append('procedureId', filters.procedureId.toString());
            if (filters.minPrice !== undefined) queryParams.append('minPrice', filters.minPrice.toString());
            if (filters.maxPrice !== undefined) queryParams.append('maxPrice', filters.maxPrice.toString());
            if (filters.minStock !== undefined) queryParams.append('minStock', filters.minStock.toString());
            if (filters.maxStock !== undefined) queryParams.append('maxStock', filters.maxStock.toString());
            if (filters.isActive !== undefined) queryParams.append('isActive', filters.isActive.toString());
            if (filters.page !== undefined) queryParams.append('page', filters.page.toString());
            if (filters.pageSize !== undefined) queryParams.append('pageSize', filters.pageSize.toString());
            if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
            if (filters.sortDirection) queryParams.append('sortDirection', filters.sortDirection);

            const response = await fetch(`${API_BASE_URL}/${materialId}/products?${queryParams}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                if (response.status === 401) {
                    this.handleAuthError(response);
                    throw new Error('Authentication failed - please log in again');
                }
                if (response.status === 404) {
                    throw new Error('Material not found');
                }
                throw new Error(`Failed to get products using material: ${response.status}`);
            }

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

            const response = await fetch(`${API_BASE_URL}/search?${queryParams}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                if (response.status === 401) {
                    this.handleAuthError(response);
                    throw new Error('Authentication failed - please log in again');
                }
                throw new Error(`Failed to search materials: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Search materials for autocomplete error:', error);
            throw error;
        }
    }
}

// Export a singleton instance
export const materialService = new MaterialService();