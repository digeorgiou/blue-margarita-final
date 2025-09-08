import { AuthenticationRequest, AuthenticationResponse } from '../types/api/auth';

const decodeJwt = (token: string): any => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error decoding JWT:', error);
        return null;
    }
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
console.log('Environment variable VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
console.log('Final API_BASE_URL being used:', API_BASE_URL);

class AuthService {
    private getStoredToken(): string | null {
        const token = localStorage.getItem('authToken');
        console.log('Getting stored token:', token ? 'exists' : 'null');
        return token;
    }

    private setStoredToken(token: string): void {
        console.log('Setting token in localStorage');
        localStorage.setItem('authToken', token);
    }

    private removeStoredToken(): void {
        console.log('Removing token from localStorage');
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
            console.log('Auth headers with token:', { ...headers, Authorization: 'Bearer [TOKEN]' });
        } else {
            console.log('Auth headers without token:', headers);
        }

        return headers;
    }

    getCurrentUser(): { id: number; username: string } | null {
        const token = this.getStoredToken();
        if (!token) return null;

        const decoded = decodeJwt(token);
        if (!decoded) return null;

        return {
            id: decoded.userId || decoded.sub,
            username: decoded.username || decoded.sub
        };
    }

    getCurrentUserRole(): string | null {
        const token = this.getStoredToken();
        if (!token) return null;

        const decoded = decodeJwt(token);
        if (!decoded) return null;

        // For Spring Security, check authorities array first
        if (decoded.authorities && Array.isArray(decoded.authorities)) {
            // Find the role authority (starts with "ROLE_")
            const roleAuthority = decoded.authorities.find((auth: string) =>
                auth.startsWith('ROLE_')
            );

            if (roleAuthority) {
                // Extract just the role name without "ROLE_" prefix
                const role = roleAuthority.replace('ROLE_', '');
                console.log('User role from authorities:', role);
                return role;
            }
        }

        // Fallback: check for other possible claim names
        const role = decoded.role ||
            decoded.scope;

        console.log('User role from token:', role);
        return role || null;
    }

    // Authenticate user and get JWT token
    async authenticate(credentials: AuthenticationRequest): Promise<AuthenticationResponse> {
        try {
            console.log('Attempting authentication for user:', credentials.username);

            const response = await fetch(`${API_BASE_URL}/auth/authenticate`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(credentials),
            });

            console.log('Authentication response status:', response.status);

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Invalid username or password');
                }
                throw new Error(`Authentication failed: ${response.status}`);
            }

            const data: AuthenticationResponse = await response.json();
            console.log('Authentication successful, received token for user:', data.username);

            this.setStoredToken(data.token);
            console.log('Token stored successfully');

            return data;
        } catch (error) {
            console.error('Authentication error:', error);
            throw error;
        }
    }

    // Validate current token
    async validateToken(): Promise<boolean> {
        try {
            const token = this.getStoredToken();
            if (!token) {
                console.log('No token to validate');
                return false;
            }

            console.log('Validating token with backend...');

            const response = await fetch(`${API_BASE_URL}/auth/validate`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            console.log('Token validation response status:', response.status);

            const isValid = response.ok;
            console.log('Token validation result:', isValid);

            if (!isValid) {
                console.log('Token validation failed, clearing token');
                this.removeStoredToken();
            }

            return isValid;
        } catch (error) {
            console.error('Token validation error:', error);
            return false;
        }
    }

    // Logout user
    async logout(): Promise<void> {
        try {
            console.log('Initiating logout...');

            // Call logout endpoint
            await fetch(`${API_BASE_URL}/auth/logout`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
            });

            console.log('Logout endpoint called successfully');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Always remove token from storage
            this.removeStoredToken();
            console.log('Logout completed, token removed');
        }
    }

    // Check if user is authenticated
    isAuthenticated(): boolean {
        const hasToken = this.getStoredToken() !== null;
        console.log('Is authenticated check:', hasToken);
        return hasToken;
    }
}

// Export singleton instance
export const authService = new AuthService();