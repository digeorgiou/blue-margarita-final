// productService.ts - Following CustomerService pattern with ApiErrorHandler

import { authService } from './authService';
import { ApiErrorHandler } from '../utils/apiErrorHandler';
import {
    ProductListItemDTO,
    ProductInsertDTO,
    ProductUpdateDTO,
    ProductDetailedViewDTO,
    ProductSearchResultDTO,
    ProductSalesAnalyticsDTO,
    ProductStatsSummaryDTO,
} from "../types/api/productInterface.ts";
import { Paginated } from "../types/api/dashboardInterface.ts";

const API_BASE_URL = '/api/products';

class ProductService {

    private getAuthHeaders(): HeadersInit {
        const headers = authService.getAuthHeaders();
        console.log('Auth headers being sent:', headers);
        return headers;
    }

    // =============================================================================
    // CORE CRUD OPERATIONS - FOR PRODUCT MANAGEMENT PAGE
    // =============================================================================

    async createProduct(productData: ProductInsertDTO): Promise<ProductListItemDTO> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}`, {
                method: 'POST',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            });

            return await response.json();
        } catch (error) {
            console.error('Create product error:', error);
            throw error; // ApiError will be handled by the modal
        }
    }

    async updateProduct(productId: number, productData: ProductUpdateDTO): Promise<ProductListItemDTO> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/${productId}`, {
                method: 'PUT',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            });

            return await response.json();
        } catch (error) {
            console.error('Update product error:', error);
            throw error;
        }
    }

    async deleteProduct(productId: number): Promise<void> {
        try {
            await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/${productId}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });
        } catch (error) {
            console.error('Delete product error:', error);
            throw error;
        }
    }

    // =============================================================================
    // PRODUCT VIEWING AND LISTING - FOR PRODUCT MANAGEMENT PAGE
    // =============================================================================

    async getProductsFilteredPaginated(
        nameOrCode?: string,
        categoryId?: number,
        procedureId?: number,
        materialName?: string,
        materialId?: number,
        minPrice?: number,
        maxPrice?: number,
        stockStatus?: string,
        isActive?: boolean,
        sortBy?: string,
        sortDirection?: string,
        page: number = 0,
        size: number = 12
    ): Promise<Paginated<ProductListItemDTO>> {
        try {
            const params = new URLSearchParams();

            // Add filters
            if (nameOrCode?.trim()) params.append('nameOrCode', nameOrCode.trim());
            if (categoryId !== undefined) params.append('categoryId', categoryId.toString());
            if (procedureId !== undefined) params.append('procedureId', procedureId.toString());
            if (materialName?.trim()) params.append('materialName', materialName.trim());
            if (materialId !== undefined) params.append('materialId', materialId.toString());
            if (minPrice !== undefined) params.append('minPrice', minPrice.toString());
            if (maxPrice !== undefined) params.append('maxPrice', maxPrice.toString());
            if (stockStatus?.trim()) params.append('stockStatus', stockStatus.trim());
            if (isActive !== undefined) params.append('isActive', isActive.toString());

            // Add sorting
            if (sortBy?.trim()) params.append('sortBy', sortBy.trim());
            if (sortDirection?.trim()) params.append('sortDirection', sortDirection.trim());

            // Add pagination
            params.append('page', page.toString());
            params.append('size', size.toString());

            const response = await ApiErrorHandler.enhancedFetch(
                `${API_BASE_URL}?${params.toString()}`,
                {
                    method: 'GET',
                    headers: this.getAuthHeaders()
                }
            );

            return await response.json();
        } catch (error) {
            console.error('Get products paginated error:', error);
            throw error;
        }
    }

    async getProductDetails(productId: number): Promise<ProductDetailedViewDTO> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/${productId}/details`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            return await response.json();
        } catch (error) {
            console.error('Get product details error:', error);
            throw error;
        }
    }

    // =============================================================================
    // SEARCH AND AUTOCOMPLETE - FOR SALES RECORDING
    // =============================================================================

    async searchProductsForAutocomplete(searchTerm: string): Promise<ProductSearchResultDTO[]> {
        try {
            const params = new URLSearchParams();
            params.append('searchTerm', searchTerm.trim());

            const response = await ApiErrorHandler.enhancedFetch(
                `${API_BASE_URL}/search?${params.toString()}`,
                {
                    method: 'GET',
                    headers: this.getAuthHeaders()
                }
            );

            return await response.json();
        } catch (error) {
            console.error('Search products for autocomplete error:', error);
            throw error;
        }
    }

    // =============================================================================
    // MATERIAL RELATIONSHIP MANAGEMENT
    // =============================================================================

    async addMaterialToProduct(productId: number, materialId: number, quantity: number, updaterUserId: number): Promise<ProductListItemDTO> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(
                `${API_BASE_URL}/${productId}/materials/${materialId}?quantity=${quantity}&updaterUserId=${updaterUserId}`,
                {
                    method: 'POST',
                    headers: this.getAuthHeaders()
                }
            );

            return await response.json();
        } catch (error) {
            console.error('Add material to product error:', error);
            throw error;
        }
    }

    async removeMaterialFromProduct(productId: number, materialId: number, updaterUserId: number): Promise<ProductListItemDTO> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(
                `${API_BASE_URL}/${productId}/materials/${materialId}?updaterUserId=${updaterUserId}`,
                {
                    method: 'DELETE',
                    headers: this.getAuthHeaders()
                }
            );

            return await response.json();
        } catch (error) {
            console.error('Remove material from product error:', error);
            throw error;
        }
    }

    // =============================================================================
    // PROCEDURE RELATIONSHIP MANAGEMENT
    // =============================================================================

    async addProcedureToProduct(productId: number, procedureId: number, cost: number, updaterUserId: number): Promise<ProductListItemDTO> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(
                `${API_BASE_URL}/${productId}/procedures/${procedureId}?cost=${cost}&updaterUserId=${updaterUserId}`,
                {
                    method: 'POST',
                    headers: this.getAuthHeaders()
                }
            );

            return await response.json();
        } catch (error) {
            console.error('Add procedure to product error:', error);
            throw error;
        }
    }

    async removeProcedureFromProduct(productId: number, procedureId: number, updaterUserId: number): Promise<ProductListItemDTO> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(
                `${API_BASE_URL}/${productId}/procedures/${procedureId}?updaterUserId=${updaterUserId}`,
                {
                    method: 'DELETE',
                    headers: this.getAuthHeaders()
                }
            );

            return await response.json();
        } catch (error) {
            console.error('Remove procedure from product error:', error);
            throw error;
        }
    }

    async updateProductProcedureCost(productId: number, procedureId: number, newCost: number): Promise<ProductDetailedViewDTO> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(
                `${API_BASE_URL}/${productId}/procedures/${procedureId}`,
                {
                    method: 'PUT',
                    headers: {
                        ...this.getAuthHeaders(),
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ cost: newCost })
                }
            );

            return await response.json();
        } catch (error) {
            console.error('Update product procedure cost error:', error);
            throw error;
        }
    }

    // =============================================================================
    // ANALYTICS AND REPORTING
    // =============================================================================

    async getProductSalesAnalytics(
        productId: number,
        startDate: string,
        endDate: string,
        includeTrendData?: boolean
    ): Promise<ProductSalesAnalyticsDTO> {
        try {
            const params = new URLSearchParams();
            params.append('startDate', startDate);
            params.append('endDate', endDate);
            if (includeTrendData !== undefined) {
                params.append('includeTrendData', includeTrendData.toString());
            }

            const response = await ApiErrorHandler.enhancedFetch(
                `${API_BASE_URL}/${productId}/analytics?${params.toString()}`,
                {
                    method: 'GET',
                    headers: this.getAuthHeaders()
                }
            );

            return await response.json();
        } catch (error) {
            console.error('Get product sales analytics error:', error);
            throw error;
        }
    }

    async getTopSellingProducts(
        limit: number = 10,
        startDate?: string,
        endDate?: string
    ): Promise<ProductStatsSummaryDTO[]> {
        try {
            const params = new URLSearchParams();
            params.append('limit', limit.toString());
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            const response = await ApiErrorHandler.enhancedFetch(
                `${API_BASE_URL}/stats/top-selling?${params.toString()}`,
                {
                    method: 'GET',
                    headers: this.getAuthHeaders()
                }
            );

            return await response.json();
        } catch (error) {
            console.error('Get top selling products error:', error);
            throw error;
        }
    }

    async getLowStockProducts(): Promise<ProductListItemDTO[]> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(
                `${API_BASE_URL}/stats/low-stock`,
                {
                    method: 'GET',
                    headers: this.getAuthHeaders()
                }
            );

            return await response.json();
        } catch (error) {
            console.error('Get low stock products error:', error);
            throw error;
        }
    }

    // =============================================================================
    // UTILITY METHODS
    // =============================================================================

    async getProductCategories(): Promise<{ id: number; name: string }[]> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(
                `${API_BASE_URL}/categories`,
                {
                    method: 'GET',
                    headers: this.getAuthHeaders()
                }
            );

            return await response.json();
        } catch (error) {
            console.error('Get product categories error:', error);
            throw error;
        }
    }

    async validateProductCode(productCode: string, excludeProductId?: number): Promise<boolean> {
        try {
            const params = new URLSearchParams();
            params.append('productCode', productCode.trim());
            if (excludeProductId !== undefined) {
                params.append('excludeProductId', excludeProductId.toString());
            }

            const response = await ApiErrorHandler.enhancedFetch(
                `${API_BASE_URL}/validate-code?${params.toString()}`,
                {
                    method: 'GET',
                    headers: this.getAuthHeaders()
                }
            );

            const result = await response.json();
            return result.isAvailable;
        } catch (error) {
            console.error('Validate product code error:', error);
            throw error;
        }
    }

    async recalculateProductPricing(productId: number): Promise<ProductDetailedViewDTO> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(
                `${API_BASE_URL}/${productId}/recalculate-pricing`,
                {
                    method: 'POST',
                    headers: this.getAuthHeaders()
                }
            );

            return await response.json();
        } catch (error) {
            console.error('Recalculate product pricing error:', error);
            throw error;
        }
    }
}

// Export a singleton instance
export const productService = new ProductService();