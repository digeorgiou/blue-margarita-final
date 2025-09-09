import { authService } from './authService';
import {
    CartItemDTO, PriceCalculationRequestDTO, PriceCalculationResponseDTO,
    ProductSearchResultDTO,
    RecordPageDataDTO,
    RecordSaleRequestDTO
} from "../types/api/recordSaleInterface.ts";
import { SaleDetailedViewDTO } from "../types/api/saleInterface.ts";
import {CustomerSearchResultDTO} from "../types/api/customerInterface.ts";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL + '/record-sale';

class RecordSaleService {

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

    // =============================================================================
    // PAGE INITIALIZATION
    // =============================================================================

    async getRecordSalePageData() : Promise< RecordPageDataDTO > {
        try {
            const response = await fetch(`${API_BASE_URL}/init`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                if (response.status === 400) {
                    throw new Error('Invalid task data');
                }
                if (response.status === 401) {
                    this.handleAuthError(response);
                    throw new Error('Authentication failed - please log in again');
                }
                throw new Error(`Failed to get categories dropdown : ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Loading record page data error', error);
            throw error;
        }
    }

    // =============================================================================
    // CUSTOMER SEARCH
    // =============================================================================

    async searchCustomers(searchTerm: string): Promise<CustomerSearchResultDTO[]> {
        try {
            const queryParams = new URLSearchParams();
            queryParams.append('searchTerm', searchTerm);

            const response = await fetch(`${API_BASE_URL}/customers/search?${queryParams}`, {
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
                throw new Error(`Failed to search customers: : ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Customer search error', error);
            throw error;
        }
    }

    // =============================================================================
    // PRODUCT SEARCH AND CART MANAGEMENT
    // =============================================================================

    async searchProducts(searchTerm: string): Promise<ProductSearchResultDTO[]> {
        try {
            const queryParams = new URLSearchParams();
            queryParams.append('searchTerm', searchTerm);

            const response = await fetch(`${API_BASE_URL}/products/search?${queryParams}`, {
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
                throw new Error(`Failed to search products: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Product search error', error);
            throw error;
        }
    }

    async getProductForCart(
        productId: number,
        quantity: number,
        isWholesale: boolean
    ): Promise<CartItemDTO> {
        try {
            const queryParams = new URLSearchParams();
            queryParams.append('quantity', quantity.toString());
            queryParams.append('isWholesale', isWholesale.toString());

            const response = await fetch(`${API_BASE_URL}/products/${productId}/cart-item?${queryParams}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                if (response.status === 400) {
                    throw new Error('Invalid product or quantity data');
                }
                if (response.status === 401) {
                    this.handleAuthError(response);
                    throw new Error('Authentication failed - please log in again');
                }
                if (response.status === 404) {
                    throw new Error('Product not found');
                }
                throw new Error(`Failed to get product for cart: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Get product for cart error', error);
            throw error;
        }
    }

    // =============================================================================
    // PRICING CALCULATIONS
    // =============================================================================

    async calculateCartPricing(request: PriceCalculationRequestDTO): Promise<PriceCalculationResponseDTO> {
        try {
            const response = await fetch(`${API_BASE_URL}/calculate-pricing`, {
                method: 'POST',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(request)
            });

            if (!response.ok) {
                if (response.status === 400) {
                    throw new Error('Invalid pricing calculation request');
                }
                if (response.status === 401) {
                    this.handleAuthError(response);
                    throw new Error('Authentication failed - please log in again');
                }
                if (response.status === 404) {
                    throw new Error('One or more products not found');
                }
                throw new Error(`Failed to calculate pricing: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Calculate cart pricing error', error);
            throw error;
        }
    }

    // =============================================================================
    // SALE RECORDING
    // =============================================================================

    async recordSale(request: RecordSaleRequestDTO): Promise<SaleDetailedViewDTO> {
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
                    throw new Error('Invalid sale data or validation errors');
                }
                if (response.status === 401) {
                    this.handleAuthError(response);
                    throw new Error('Authentication failed - please log in again');
                }
                if (response.status === 404) {
                    throw new Error('Customer, location, user, or product not found');
                }
                throw new Error(`Failed to record sale: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Record sale error', error);
            throw error;
        }
    }


}

export const recordSaleService = new RecordSaleService();