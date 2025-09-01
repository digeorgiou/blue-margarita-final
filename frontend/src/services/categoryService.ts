import { authService } from './authService';
import { ApiErrorHandler } from '../utils/apiErrorHandler';
import {
    CategoryReadOnlyDTO,
    CategoryInsertDTO,
    CategoryUpdateDTO,
    CategoryForDropdownDTO,
    CategoryDetailedViewDTO,
    Paginated
} from "../types/api/categoryInterface.ts";

const API_BASE_URL = '/api/categories';

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
        page?: number;
        pageSize?: number;
        sortBy?: string;
        sortDirection?: string;
    } = {}): Promise<Paginated<CategoryReadOnlyDTO>> {
        try {
            const params = new URLSearchParams();

            if (filters.name) params.append('name', filters.name);
            if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
            if (filters.page !== undefined) params.append('page', filters.page.toString());
            if (filters.pageSize !== undefined) params.append('pageSize', filters.pageSize.toString());
            if (filters.sortBy) params.append('sortBy', filters.sortBy);
            if (filters.sortDirection) params.append('sortDirection', filters.sortDirection);

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