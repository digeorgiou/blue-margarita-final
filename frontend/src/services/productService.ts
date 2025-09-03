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
    PriceRecalculationResultDTO
} from "../types/api/productInterface.ts";
import {MispricedProductAlertDTO, Paginated} from "../types/api/dashboardInterface.ts";

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

    async restoreProduct(productId: number): Promise<ProductListItemDTO> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/${productId}/restore`, {
                method: 'PUT',
                headers: this.getAuthHeaders()
            });

            return await response.json();
        } catch (error) {
            console.error('Restore product error:', error);
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
        minStock?: number,
        maxStock?: number,
        isActive?: boolean,
        lowStock?: boolean,
        sortBy?: string,
        sortDirection?: string,
        page: number = 0,
        pageSize: number = 12
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
            if (isActive !== undefined) params.append('isActive', isActive.toString());

            if (minStock !== undefined && minStock > 0) params.append('minStock', minStock.toString());
            if (maxStock !== undefined && maxStock > 0) params.append('maxStock', maxStock.toString());
            if (lowStock !== undefined) params.append('lowStock', lowStock.toString());

            // Add sorting
            if (sortBy?.trim()) params.append('sortBy', sortBy.trim());
            if (sortDirection?.trim()) params.append('sortDirection', sortDirection.trim());

            // Add pagination
            params.append('page', page.toString());
            params.append('pageSize', pageSize.toString());

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

    async addMaterialToProduct(productId: number, materialId: number, quantity: number): Promise<ProductListItemDTO> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(
                `${API_BASE_URL}/${productId}/materials/${materialId}?quantity=${quantity}`,
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

    async removeMaterialFromProduct(productId: number, materialId: number): Promise<ProductListItemDTO> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(
                `${API_BASE_URL}/${productId}/materials/${materialId}`,
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

    async addProcedureToProduct(productId: number, procedureId: number, cost: number): Promise<ProductListItemDTO> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(
                `${API_BASE_URL}/${productId}/procedures/${procedureId}?cost=${cost}`,
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

    async removeProcedureFromProduct(productId: number, procedureId: number): Promise<ProductListItemDTO> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(
                `${API_BASE_URL}/${productId}/procedures/${procedureId}`,
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
        endDate: string
    ): Promise<ProductSalesAnalyticsDTO> {
        try {
            const params = new URLSearchParams();
            params.append('startDate', startDate);
            params.append('endDate', endDate);

            const response = await ApiErrorHandler.enhancedFetch(
                `${API_BASE_URL}/${productId}/sales-analytics?${params.toString()}`,  // ← Fixed endpoint
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

    async getAllMispricedProducts(params: {
        thresholdPercentage?: number;
        nameOrCode?: string;
        categoryId?: number;
        issueType?: string;
        page?: number;
        pageSize?: number;
        sortBy?: string;
        sortDirection?: string;
    } = {}): Promise<Paginated<MispricedProductAlertDTO>> {
        try {
            const queryParams = new URLSearchParams();

            // Set default threshold if not provided
            if (!params.thresholdPercentage) {
                params.thresholdPercentage = 20;
            }

            // Add all parameters to query string if they exist
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, value.toString());
                }
            });

            const response = await fetch(`${API_BASE_URL}/mispriced-products/all?${queryParams}`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch all mispriced products: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('All mispriced products error:', error);
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

    // =============================================================================
    // BULK OPERATIONS - PRICE RECALCULATION
    // =============================================================================

    async recalculateAllProductPrices(): Promise<PriceRecalculationResultDTO> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/recalculate-all-prices`, {
                method: 'POST',
                headers: this.getAuthHeaders()
            });

            return await response.json();
        } catch (error) {
            console.error('Recalculate all product prices error:', error);
            throw error;
        }
    }

    async updateFinalRetailPrice(productId: number, newPrice: number): Promise<ProductListItemDTO> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(
                `${API_BASE_URL}/${productId}/final-retail-price?newPrice=${newPrice}`,
                {
                    method: 'PUT',
                    headers: this.getAuthHeaders()
                }
            );

            return await response.json();
        } catch (error) {
            console.error('Update final retail price error:', error);
            throw error;
        }
    }

    async updateFinalWholesalePrice(productId: number, newPrice: number): Promise<ProductListItemDTO> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(
                `${API_BASE_URL}/${productId}/final-wholesale-price?newPrice=${newPrice}`,
                {
                    method: 'PUT',
                    headers: this.getAuthHeaders()
                }
            );

            return await response.json();
        } catch (error) {
            console.error('Update final wholesale price error:', error);
            throw error;
        }
    }
}



// Export a singleton instance
export const productService = new ProductService();