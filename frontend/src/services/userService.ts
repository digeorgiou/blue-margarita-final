import { authService } from './authService';
import { ApiErrorHandler } from '../utils/apiErrorHandler';
import {
    UserReadOnlyDTO,
    UserInsertDTO,
    UserUpdateDTO,
} from "../types/api/userInterface.ts";
import { Paginated } from "../types/api/dashboardInterface.ts";

const API_BASE_URL = '/api/users';

class UserService {

    private getAuthHeaders(): HeadersInit {
        const headers = authService.getAuthHeaders();
        console.log('Auth headers being sent:', headers);
        return headers;
    }

    // =============================================================================
    // CORE CRUD OPERATIONS - FOR USER MANAGEMENT PAGE
    // =============================================================================

    async createUser(userData: UserInsertDTO): Promise<UserReadOnlyDTO> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}`, {
                method: 'POST',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            return await response.json();
        } catch (error) {
            console.error('Create user error:', error);
            throw error;
        }
    }

    async updateUser(userData: UserUpdateDTO): Promise<UserReadOnlyDTO> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/${userData.userId}`, {
                method: 'PUT',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            return await response.json();
        } catch (error) {
            console.error('Update user error:', error);
            throw error;
        }
    }

    async deleteUser(userId: number): Promise<void> {
        try {
            await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/${userId}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });
        } catch (error) {
            console.error('Delete user error:', error);
            throw error;
        }
    }

    async restoreUser(userId: number): Promise<UserReadOnlyDTO> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/${userId}/restore`, {
                method: 'PUT',
                headers: this.getAuthHeaders()
            });

            return await response.json();
        } catch (error) {
            console.error('Restore user error:', error);
            throw error;
        }
    }

    async getUserById(userId: number): Promise<UserReadOnlyDTO> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/${userId}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            return await response.json();
        } catch (error) {
            console.error('Get user by ID error:', error);
            throw error;
        }
    }

    // =============================================================================
    // USER VIEWING AND LISTING - FOR USER MANAGEMENT PAGE
    // =============================================================================

    async getUsersFilteredPaginated(filters: {
        username?: string;
        isActive?: boolean;
        page?: number;
        pageSize?: number;
        sortBy?: string;
        sortDirection?: string;
    }): Promise<Paginated<UserReadOnlyDTO>> {
        try {
            const queryParams = new URLSearchParams();

            // Add all filter parameters
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, value.toString());
                }
            });

            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}?${queryParams}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            return await response.json();
        } catch (error) {
            console.error('Get users filtered paginated error:', error);
            throw error;
        }
    }
}

export const userService = new UserService();