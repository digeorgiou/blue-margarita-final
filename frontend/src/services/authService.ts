// Authentication service to communicate with Spring Boot API

import { AuthenticationRequest, AuthenticationResponse, UserReadOnly, UserInsert } from '../interfaces/auth';

const API_BASE_URL = '/api'; // Using Vite proxy

class AuthService {
    private getAuthHeaders(token?: string): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        const authToken = token || this.getStoredToken();
        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }

        return headers;
    }

    private getStoredToken(): string | null {
        return localStorage.getItem('authToken');
    }

    private setStoredToken(token: string): void {
        localStorage.setItem('authToken', token);
    }

    private removeStoredToken(): void {
        localStorage.removeItem('authToken');
    }

    // Authenticate user and get JWT token
    async authenticate(credentials: AuthenticationRequest): Promise<AuthenticationResponse> {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/authenticate`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(credentials),
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Invalid username or password');
                }
                throw new Error(`Authentication failed: ${response.status}`);
            }

            const data: AuthenticationResponse = await response.json();
            this.setStoredToken(data.token);
            return data;
        } catch (error) {
            console.error('Authentication error:', error);
            throw error;
        }
    }

    // Register new user
    async register(userData: UserInsert): Promise<UserReadOnly> {
        try {
            const response = await fetch(`${API_BASE_URL}/users/register`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                if (response.status === 409) {
                    throw new Error('Username already exists');
                }
                if (response.status === 400) {
                    throw new Error('Invalid user data');
                }
                throw new Error(`Registration failed: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    // Get user by ID
    async getUserById(id: number): Promise<UserReadOnly> {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${id}`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Unauthorized');
                }
                if (response.status === 403) {
                    throw new Error('Access denied');
                }
                if (response.status === 404) {
                    throw new Error('User not found');
                }
                throw new Error(`Failed to fetch user: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Get user error:', error);
            throw error;
        }
    }

    // Validate current token
    async validateToken(): Promise<boolean> {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/validate`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            return response.ok;
        } catch (error) {
            console.error('Token validation error:', error);
            return false;
        }
    }

    // Logout user
    async logout(): Promise<void> {
        try {
            // Call logout endpoint
            await fetch(`${API_BASE_URL}/auth/logout`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Always remove token from storage
            this.removeStoredToken();
        }
    }

    // Check if user is authenticated
    isAuthenticated(): boolean {
        return !!this.getStoredToken();
    }

    // Get stored token
    getToken(): string | null {
        return this.getStoredToken();
    }
}

export const authService = new AuthService();