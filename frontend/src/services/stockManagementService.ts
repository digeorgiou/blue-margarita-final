import { authService } from './authService';
import {
    StockUpdateDTO,
    StockUpdateResultDTO
} from "../types/api/stockManagementInterface.ts";

const API_BASE_URL = '/api/stock-management';

class StockManagementService {

    private getAuthHeaders(): HeadersInit {
        const headers = authService.getAuthHeaders();
        console.log('Auth headers being sent:', headers); // Add debug logging
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

    async updateProductStock(stockData : StockUpdateDTO) : Promise< StockUpdateResultDTO > {
        try {
            const response = await fetch(`${API_BASE_URL}/update-stock`, {
                method: 'PATCH',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(stockData),
            });

            if (!response.ok) {
                if (response.status === 400) {
                    throw new Error('Invalid task data');
                }
                if (response.status === 401) {
                    this.handleAuthError(response);
                    throw new Error('Authentication failed - please log in again');
                }
                throw new Error(`Failed to update stock: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Create task error:', error);
            throw error;
        }
    }
}

// Export a singleton instance
export const stockManagementService = new StockManagementService();
