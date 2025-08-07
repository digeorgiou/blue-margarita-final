import { authService } from './authService';
import { ApiErrorHandler } from '../utils/apiErrorHandler';
import {
    StockManagementDTO,
    StockUpdateDTO,
    StockUpdateResultDTO,
    StockManagementFilters, StockLimitUpdateDTO
} from '../types/api/stockManagementInterface';
import { ProductSearchResultDTO } from '../types/api/productInterface';
import { Paginated } from '../types/api/dashboardInterface';

const API_BASE_URL = '/api/stock-management';

class StockManagementService {

    private getAuthHeaders(): HeadersInit {
        const headers = authService.getAuthHeaders();
        console.log('Auth headers being sent:', headers);
        return headers;
    }

    // =============================================================================
    // STOCK MANAGEMENT PAGE - MAIN METHODS
    // =============================================================================

    async getProductsForStockManagement(filters: StockManagementFilters): Promise<Paginated<StockManagementDTO>> {
        try {
            const queryParams = new URLSearchParams();

            // Add all filter parameters - matching your controller exactly
            if (filters.nameOrCode) queryParams.append('nameOrCode', filters.nameOrCode);
            if (filters.categoryId) queryParams.append('categoryId', filters.categoryId.toString());
            if (filters.status) queryParams.append('status', filters.status);
            if (filters.minStock !== undefined) queryParams.append('minStock', filters.minStock.toString());
            if (filters.maxStock !== undefined) queryParams.append('maxStock', filters.maxStock.toString());
            if (filters.page !== undefined) queryParams.append('page', filters.page.toString());
            if (filters.pageSize !== undefined) queryParams.append('pageSize', filters.pageSize.toString());
            if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
            if (filters.sortDirection) queryParams.append('sortDirection', filters.sortDirection);

            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/products?${queryParams}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            return await response.json();
        } catch (error) {
            console.error('Get products for stock management error:', error);
            throw error;
        }
    }

    async searchProductsForStockUpdate(searchTerm: string): Promise<ProductSearchResultDTO[]> {
        try {
            const queryParams = new URLSearchParams();
            queryParams.append('searchTerm', searchTerm);

            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/products/search?${queryParams}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            return await response.json();
        } catch (error) {
            console.error('Search products for stock update error:', error);
            throw error;
        }
    }

    // =============================================================================
    // STOCK UPDATE OPERATIONS
    // =============================================================================

    async updateProductStock(updateData: StockUpdateDTO): Promise<StockUpdateResultDTO> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/update-stock`, {
                method: 'PATCH',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });

            return await response.json();
        } catch (error) {
            console.error('Update product stock error:', error);
            throw error;
        }
    }

    async updateProductStockLimit(updateData: StockLimitUpdateDTO): Promise<StockLimitUpdateResultDTO> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/update-stock-limit`, {
                method: 'PATCH',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });

            return await response.json();
        } catch (error) {
            console.error('Update product stock error:', error);
            throw error;
        }
    }


    // =============================================================================
    // HELPER METHODS
    // =============================================================================

    async getStockUpdateTypes(): Promise<Record<string, string>> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/update-types`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            return await response.json();
        } catch (error) {
            console.error('Get stock update types error:', error);
            throw error;
        }
    }
}

// Export a singleton instance
export const stockManagementService = new StockManagementService();