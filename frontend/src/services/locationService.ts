import { authService } from './authService';
import { ApiErrorHandler } from '../utils/apiErrorHandler';
import {
    LocationReadOnlyDTO,
    LocationInsertDTO,
    LocationUpdateDTO,
    LocationForDropdownDTO,
    LocationDetailedViewDTO,
} from "../types/api/locationInterface.ts";
import { Paginated } from "../types/api/dashboardInterface.ts";

const API_BASE_URL = '/api/locations';

class LocationService {

    private getAuthHeaders(): HeadersInit {
        const headers = authService.getAuthHeaders();
        console.log('Auth headers being sent:', headers);
        return headers;
    }

    // =============================================================================
    // CORE CRUD OPERATIONS - FOR LOCATION MANAGEMENT PAGE
    // =============================================================================

    async createLocation(locationData: LocationInsertDTO): Promise<LocationReadOnlyDTO> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}`, {
                method: 'POST',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(locationData)
            });

            return await response.json();
        } catch (error) {
            console.error('Create location error:', error);
            throw error;
        }
    }

    async updateLocation(locationId: number, locationData: LocationUpdateDTO): Promise<LocationReadOnlyDTO> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/${locationId}`, {
                method: 'PUT',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(locationData)
            });

            return await response.json();
        } catch (error) {
            console.error('Update location error:', error);
            throw error;
        }
    }

    async deleteLocation(locationId: number): Promise<void> {
        try {
            await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/${locationId}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });
        } catch (error) {
            console.error('Delete location error:', error);
            throw error;
        }
    }

    async restoreLocation(locationId: number): Promise<LocationReadOnlyDTO> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/${locationId}/restore`, {
                method: 'PUT',
                headers: this.getAuthHeaders()
            });

            return await response.json();
        } catch (error) {
            console.error('Restore location error:', error);
            throw error;
        }
    }

    async getLocationById(locationId: number): Promise<LocationReadOnlyDTO> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/${locationId}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            return await response.json();
        } catch (error) {
            console.error('Get location by ID error:', error);
            throw error;
        }
    }

    // =============================================================================
    // LOCATION VIEWING AND LISTING - FOR LOCATION MANAGEMENT PAGE
    // =============================================================================

    async getLocationsFilteredPaginated(filters: {
        name?: string;
        isActive?: boolean;
        page?: number;
        pageSize?: number;
        sortBy?: string;
        sortDirection?: string;
    } = {}): Promise<Paginated<LocationReadOnlyDTO>> {
        try {
            const params = new URLSearchParams();

            if (filters.name) params.append('name', filters.name);
            if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
            if (filters.page !== undefined) params.append('page', filters.page.toString());
            if (filters.pageSize !== undefined) params.append('pageSize', filters.pageSize.toString());
            if (filters.sortBy) params.append('sortBy', filters.sortBy);
            if (filters.sortDirection) params.append('sortDirection', filters.sortDirection);

            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/filtered-paginated?${params}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            return await response.json();
        } catch (error) {
            console.error('Get locations filtered paginated error:', error);
            throw error;
        }
    }

    async getLocationDetailedView(locationId: number): Promise<LocationDetailedViewDTO> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/${locationId}/details`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            return await response.json();
        } catch (error) {
            console.error('Get location detailed view error:', error);
            throw error;
        }
    }

    // =============================================================================
    // DROPDOWN SERVICES - FOR FORMS AND SELECT LISTS
    // =============================================================================

    async getActiveLocationsForDropdown(): Promise<LocationForDropdownDTO[]> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/dropdown`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            return await response.json();
        } catch (error) {
            console.error('Get active locations for dropdown error:', error);
            throw error;
        }
    }

    async getInactiveLocations(): Promise<LocationForDropdownDTO[]> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/inactive-locations`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            return await response.json();
        } catch (error) {
            console.error('Get inactive locations for dropdown error:', error);
            throw error;
        }
    }
}

// Export a singleton instance
export const locationService = new LocationService();