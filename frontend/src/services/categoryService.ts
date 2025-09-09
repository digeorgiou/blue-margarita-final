import { authService } from './authService';
import { ApiErrorHandler } from '../utils/apiErrorHandler';
import {
    CategoryReadOnlyDTO,
    CategoryInsertDTO,
    CategoryUpdateDTO,
    CategoryForDropdownDTO,
    CategoryDetailedViewDTO,
} from "../types/api/categoryInterface.ts";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL + '/categories';

class CategoryService {

    private getAuthHeaders(): HeadersInit {
        const headers = authService.getAuthHeaders();
        console.log('Auth headers being sent:', headers);
        return headers;
    }

    // =============================================================================
    // CORE CRUD OPERATIONS - FOR CATEGORY MANAGEMENT PAGE
    // =============================================================================

    async createCategory(categoryData: CategoryInsertDTO): Promise<CategoryReadOnlyDTO> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}`, {
                method: 'POST',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(categoryData)
            });

            return await response.json();
        } catch (error) {
            console.error('Create category error:', error);
            throw error;
        }
    }

    async updateCategory(categoryData: CategoryUpdateDTO): Promise<CategoryReadOnlyDTO> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/${categoryData.categoryId}`, {
                method: 'PUT',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(categoryData)
            });

            return await response.json();
        } catch (error) {
            console.error('Update category error:', error);
            throw error;
        }
    }

    async deleteCategory(categoryId: number): Promise<void> {
        try {
            await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/${categoryId}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });
        } catch (error) {
            console.error('Delete category error:', error);
            throw error;
        }
    }

    async restoreCategory(categoryId: number): Promise<CategoryReadOnlyDTO> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/${categoryId}/restore`, {
                method: 'PUT',
                headers: this.getAuthHeaders()
            });

            return await response.json();
        } catch (error) {
            console.error('Restore category error:', error);
            throw error;
        }
    }

    async getCategoryById(categoryId: number): Promise<CategoryReadOnlyDTO> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/${categoryId}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            return await response.json();
        } catch (error) {
            console.error('Get category by ID error:', error);
            throw error;
        }
    }

    // =============================================================================
    // CATEGORY VIEWING AND DETAILS - FOR CATEGORY MANAGEMENT PAGE
    // =============================================================================

    async getCategoriesFilteredPaginated(filters: {
        name?: string;
        isActive?: boolean;
    } = {}): Promise<CategoryForDropdownDTO[]> {
        try {
            const params = new URLSearchParams();

            if (filters.name) params.append('name', filters.name);
            if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());

            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}?${params}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            return await response.json();
        } catch (error) {
            console.error('Get categories filtered paginated error:', error);
            throw error;
        }
    }

    async getCategoryDetailedView(categoryId: number): Promise<CategoryDetailedViewDTO> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/${categoryId}/details`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            return await response.json();
        } catch (error) {
            console.error('Get category detailed view error:', error);
            throw error;
        }
    }

    // =============================================================================
    // DROPDOWN AND SELECTION ENDPOINTS - FOR PRODUCT FORMS
    // =============================================================================

    async getCategoriesForDropdown(): Promise<CategoryForDropdownDTO[]> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/dropdown`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            return await response.json();
        } catch (error) {
            console.error('Get categories for dropdown error:', error);
            throw error;
        }
    }
}

// Export a singleton instance
export const categoryService = new CategoryService();