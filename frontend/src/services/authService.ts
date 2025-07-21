// services/authService.ts
import { AuthenticationRequest, AuthenticationResponse } from '../types/api/auth';

const API_BASE_URL = '/api';

class AuthService {
    private getStoredToken(): string | null {
        return localStorage.getItem('authToken');
    }

    private setStoredToken(token: string): void {
        localStorage.setItem('authToken', token);
    }

    private removeStoredToken(): void {
        localStorage.removeItem('authToken');
    }

    // Public method to get token (needed by App.tsx)
    getToken(): string | null {
        return this.getStoredToken();
    }

    getAuthHeaders(token?: string): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        const authToken = token || this.getStoredToken();
        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }

        return headers;
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
        return this.getStoredToken() !== null;
    }
}

// Export singleton instance
export const authService = new AuthService();