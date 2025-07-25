import { authService } from './authService';
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
    // CORE CRUD OPERATIONS - FOR LOCATION MANAGEMENT PAGE
    // =============================================================================

    async createLocation(locationData: LocationInsertDTO): Promise<LocationReadOnlyDTO> {
        try {
            const response = await fetch(`${API_BASE_URL}`, {
                method: 'POST',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(locationData)
            });

            if (!response.ok) {
                if (response.status === 400) {
                    throw new Error('Validation errors');
                }
                if (response.status === 401) {
                    this.handleAuthError(response);
                    throw new Error('Authentication failed - please log in again');
                }
                if (response.status === 409) {
                    throw new Error('Location with name already exists');
                }
                throw new Error(`Failed to create location: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Create location error:', error);
            throw error;
        }
    }

    async updateLocation(locationId: number, locationData: LocationUpdateDTO): Promise<LocationReadOnlyDTO> {
        try {
            const response = await fetch(`${API_BASE_URL}/${locationId}`, {
                method: 'PUT',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(locationData)
            });

            if (!response.ok) {
                if (response.status === 400) {
                    throw new Error('Validation errors');
                }
                if (response.status === 401) {
                    this.handleAuthError(response);
                    throw new Error('Authentication failed - please log in again');
                }
                if (response.status === 404) {
                    throw new Error('Location not found');
                }
                if (response.status === 409) {
                    throw new Error('Location with name already exists');
                }
                throw new Error(`Failed to update location: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Update location error:', error);
            throw error;
        }
    }

    async deleteLocation(locationId: number): Promise<void> {
        try {
            const response = await fetch(`${API_BASE_URL}/${locationId}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                if (response.status === 401) {
                    this.handleAuthError(response);
                    throw new Error('Authentication failed - please log in again');
                }
                if (response.status === 403) {
                    throw new Error('Access denied - requires ADMIN role');
                }
                if (response.status === 404) {
                    throw new Error('Location not found');
                }
                throw new Error(`Failed to delete location: ${response.status}`);
            }
        } catch (error) {
            console.error('Delete location error:', error);
            throw error;
        }
    }

    async getLocationById(locationId: number): Promise<LocationReadOnlyDTO> {
        try {
            const response = await fetch(`${API_BASE_URL}/${locationId}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                if (response.status === 401) {
                    this.handleAuthError(response);
                    throw new Error('Authentication failed - please log in again');
                }
                if (response.status === 404) {
                    throw new Error('Location not found');
                }
                throw new Error(`Failed to get location: ${response.status}`);
            }

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
    }): Promise<Paginated<LocationReadOnlyDTO>> {
        try {
            const queryParams = new URLSearchParams();

            if (filters.name) queryParams.append('name', filters.name);
            if (filters.isActive !== undefined) queryParams.append('isActive', filters.isActive.toString());
            if (filters.page !== undefined) queryParams.append('page', filters.page.toString());
            if (filters.pageSize !== undefined) queryParams.append('pageSize', filters.pageSize.toString());
            if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
            if (filters.sortDirection) queryParams.append('sortDirection', filters.sortDirection);

            const response = await fetch(`${API_BASE_URL}?${queryParams}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                if (response.status === 401) {
                    this.handleAuthError(response);
                    throw new Error('Authentication failed - please log in again');
                }
                throw new Error(`Failed to get locations: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Get locations filtered paginated error:', error);
            throw error;
        }
    }

    async getLocationDetailedView(locationId: number): Promise<LocationDetailedViewDTO> {
        try {
            const response = await fetch(`${API_BASE_URL}/${locationId}/details`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                if (response.status === 401) {
                    this.handleAuthError(response);
                    throw new Error('Authentication failed - please log in again');
                }
                if (response.status === 404) {
                    throw new Error('Location not found');
                }
                throw new Error(`Failed to get location detailed view: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Get location detailed view error:', error);
            throw error;
        }
    }

    // =============================================================================
    // DROPDOWN AND SELECTION ENDPOINTS - FOR SALES AND OTHER FORMS
    // =============================================================================

    async getActiveLocationsForDropdown(): Promise<LocationForDropdownDTO[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/dropdown`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                if (response.status === 401) {
                    this.handleAuthError(response);
                    throw new Error('Authentication failed - please log in again');
                }
                throw new Error(`Failed to get locations dropdown: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Locations dropdown error:', error);
            throw error;
        }
    }
}

// Export a singleton instance
export const locationService = new LocationService();