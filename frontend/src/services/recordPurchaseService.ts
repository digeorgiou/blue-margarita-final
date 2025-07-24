import { authService } from './authService';
import {
    RecordPurchaseRequestDTO,
} from "../types/api/recordPurchaseInterface";
import {
    SupplierSearchResultDTO
} from "../types/api/supplierInterface.ts";
import {
    MaterialSearchResultDTO
} from "../types/api/materialInterface.ts";
import {
    PurchaseDetailedViewDTO
} from "../types/api/purchaseInterface.ts";

const API_BASE_URL = "/api/record-purchase";

class RecordPurchaseService {

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
    // SUPPLIER SEARCH
    // =============================================================================

    async searchSuppliers(searchTerm: string): Promise<SupplierSearchResultDTO[]> {
        try {
            const queryParams = new URLSearchParams();
            queryParams.append('searchTerm', searchTerm);

            const response = await fetch(`${API_BASE_URL}/suppliers/search?${queryParams}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                if (response.status === 400) {
                    throw new Error('Invalid search parameters');
                }
                if (response.status === 401) {
                    this.handleAuthError(response);
                    throw new Error('Authentication failed - please log in again');
                }
                throw new Error(`Failed to search suppliers: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Supplier search error', error);
            throw error;
        }
    }

    // =============================================================================
    // MATERIAL SEARCH
    // =============================================================================

    async searchMaterials(searchTerm: string): Promise<MaterialSearchResultDTO[]> {
        try {
            const queryParams = new URLSearchParams();
            queryParams.append('searchTerm', searchTerm);

            const response = await fetch(`${API_BASE_URL}/materials/search?${queryParams}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                if (response.status === 400) {
                    throw new Error('Invalid search parameters');
                }
                if (response.status === 401) {
                    this.handleAuthError(response);
                    throw new Error('Authentication failed - please log in again');
                }
                throw new Error(`Failed to search materials: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Material search error', error);
            throw error;
        }
    }

    // =============================================================================
    // PURCHASE RECORDING
    // =============================================================================

    async recordPurchase(request: RecordPurchaseRequestDTO): Promise<PurchaseDetailedViewDTO> {
        try {
            const response = await fetch(`${API_BASE_URL}/record`, {
                method: 'POST',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(request)
            });

            if (!response.ok) {
                if (response.status === 400) {
                    throw new Error('Invalid purchase data or validation errors');
                }
                if (response.status === 401) {
                    this.handleAuthError(response);
                    throw new Error('Authentication failed - please log in again');
                }
                if (response.status === 404) {
                    throw new Error('Supplier, user, or material not found');
                }
                throw new Error(`Failed to record purchase: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Record purchase error', error);
            throw error;
        }
    }
}

export const recordPurchaseService = new RecordPurchaseService();