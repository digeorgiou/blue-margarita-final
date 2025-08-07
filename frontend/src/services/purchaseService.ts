import { authService } from './authService';
import { ApiErrorHandler } from '../utils/apiErrorHandler';
import {
    PurchaseDetailedViewDTO,
    PurchaseReadOnlyDTO,
    PurchaseUpdateDTO,
    PaginatedFilteredPurchasesWithSummary,
    PurchaseFilters
} from "../types/api/purchaseInterface.ts";


const API_BASE_URL = '/api/purchases';

class PurchaseService {

    private getAuthHeaders(): HeadersInit {
        const headers = authService.getAuthHeaders();
        console.log('Auth headers being sent:', headers);
        return headers;
    }

    async updatePurchase (purchaseId: number, purchaseData: PurchaseUpdateDTO): Promise<PurchaseReadOnlyDTO> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/${purchaseId}`, {
                method: 'PUT',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(purchaseData)
            });

            return await response.json();
        } catch (error) {
            console.error('Update purchase error:', error);
            throw error;
        }
    }

    async deletePurchase(purchaseId: number): Promise<void> {
        try {
            await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/${purchaseId}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });
        } catch (error) {
            console.error('Delete purchase error:', error);
            throw error;
        }
    }

    async getPurchaseDetailedView(purchaseId: number): Promise<PurchaseDetailedViewDTO> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/${purchaseId}/details`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            return await response.json();
        } catch (error) {
            console.error('Get purchase detailed view error:', error);
            throw error;
        }
    }

    async searchPurchasesWithSummary(filters: PurchaseFilters): Promise<PaginatedFilteredPurchasesWithSummary> {
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
            console.error('Search purchases with summary error:', error);
            throw error;
        }
    }
}

export const purchaseService = new PurchaseService();