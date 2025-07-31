// saleService.ts - Following established service patterns with ApiErrorHandler

import { authService } from './authService';
import { ApiErrorHandler } from '../utils/apiErrorHandler';

// Import interfaces from recordSaleInterface.ts
import {
    SaleDetailedViewDTO,
    PaymentMethodDTO,
} from '../types/api/recordSaleInterface';

import { SaleReadOnlyDTO, SaleUpdateDTO, PaginatedFilteredSalesWithSummary, SaleFilters } from '../types/api/saleInterface.ts'


const API_BASE_URL = '/api/sales';

class SaleService {

    private getAuthHeaders(): HeadersInit {
        const headers = authService.getAuthHeaders();
        console.log('Auth headers being sent:', headers);
        return headers;
    }

    // =============================================================================
    // CORE CRUD OPERATIONS - FOR SALE MANAGEMENT PAGE
    // =============================================================================

    async updateSale(saleId: number, saleData: SaleUpdateDTO): Promise<SaleReadOnlyDTO> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/${saleId}`, {
                method: 'PUT',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(saleData)
            });

            return await response.json();
        } catch (error) {
            console.error('Update sale error:', error);
            throw error; // ApiError will be handled by the modal/form
        }
    }

    async deleteSale(saleId: number): Promise<void> {
        try {
            await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/${saleId}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });
        } catch (error) {
            console.error('Delete sale error:', error);
            throw error;
        }
    }

    // =============================================================================
    // SALE VIEWING AND LISTING - FOR SALE MANAGEMENT PAGE
    // =============================================================================

    async getSaleDetailedView(saleId: number): Promise<SaleDetailedViewDTO> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/${saleId}/details`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            return await response.json();
        } catch (error) {
            console.error('Get sale detailed view error:', error);
            throw error;
        }
    }

    async searchSalesWithSummary(filters: SaleFilters): Promise<PaginatedFilteredSalesWithSummary> {
        try {
            const queryParams = new URLSearchParams();

            // Add all filter parameters
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    // Special handling for boolean values
                    if (typeof value === 'boolean') {
                        queryParams.append(key, value.toString());
                    } else {
                        queryParams.append(key, value.toString());
                    }
                }
            });

            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/search?${queryParams}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            return await response.json();
        } catch (error) {
            console.error('Search sales with summary error:', error);
            throw error;
        }
    }

    async getPaymentMethods(): Promise<PaymentMethodDTO[]> {
        try {
            const response = await ApiErrorHandler.enhancedFetch('/api/record-sale/payment-methods', {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            return await response.json();
        } catch (error) {
            console.error('Get payment methods error:', error);
            throw error;
        }
    }

    // =============================================================================
    // FORM HELPER ENDPOINTS
    // =============================================================================

    async getAvailablePaymentMethods(): Promise<PaymentMethodDTO[]> {
        try {
            const response = await ApiErrorHandler.enhancedFetch('/api/record-sale/payment-methods', {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            return await response.json();
        } catch (error) {
            console.error('Get payment methods error:', error);
            throw error;
        }
    }

    // =============================================================================
    // UTILITY METHODS
    // =============================================================================

    /**
     * Helper method to format payment method display names
     * Uses the existing getPaymentMethodLabel function from dashboardInterface
     */
    getPaymentMethodDisplayName(paymentMethod: PaymentMethod): string {
        return getPaymentMethodLabel(paymentMethod);
    }

    /**
     * Helper method to format sale dates consistently
     */
    formatSaleDate(dateString: string): string {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('el-GR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        } catch (error) {
            console.error('Date formatting error:', error);
            return dateString;
        }
    }

    /**
     * Helper method to calculate discount percentage
     */
    calculateDiscountPercentage(suggestedTotal: number, finalTotal: number): number {
        if (suggestedTotal <= 0) return 0;
        return Math.round(((suggestedTotal - finalTotal) / suggestedTotal) * 100 * 100) / 100;
    }
}

// Export a singleton instance
export const saleService = new SaleService();