import { authService } from './authService';
import {
    // CategoryReadOnlyDTO,
    CategoryForDropdownDTO,
    // CategoryDetailedViewDTO,
    // Paginated
} from "../types/api/categoryInterface.ts";

const API_BASE_URL = '/api/categories';

class CategoryService {

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

    async getCategoriesForDropdown() : Promise< CategoryForDropdownDTO[] > {
        try {
            const response = await fetch(`${API_BASE_URL}/dropdown`, {
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
            console.error('Categories dropdown error:', error);
            throw error;
        }
    }
}

// Export a singleton instance
export const categoryService = new CategoryService();