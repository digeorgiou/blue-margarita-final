import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { AuthContextType, AuthenticationRequest, UserReadOnly } from '../types/api/auth.ts'
import { authService } from '../services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<UserReadOnly | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const extractUserFromToken = (token: string): UserReadOnly | null => {
        const decoded = decodeJwt(token);
        if (!decoded) return null;

        return {
            id: decoded.userId || decoded.sub, // Check both userId and sub (subject) claims
            username: decoded.username || decoded.sub,
            role: decoded.role || 'USER',
            isActive: true,
            deletedAt: null,
            createdAt: new Date(decoded.iat * 1000).toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: decoded.username || decoded.sub,
            lastUpdatedBy: decoded.username || decoded.sub,
        };
    };

    // Initialize auth state on app start
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const storedToken = authService.getToken();
                if (storedToken) {
                    const isValid = await authService.validateToken();
                    if (isValid) {
                        setToken(storedToken);
                        const userInfo = extractUserFromToken(storedToken);
                        setUser(userInfo);
                    } else {
                        // Token is invalid, clear it
                        await authService.logout();
                    }
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                setError('Failed to initialize authentication');
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const login = async (credentials: AuthenticationRequest): Promise<void> => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await authService.authenticate(credentials);
            setToken(response.token);

            const userInfo = extractUserFromToken(response.token);
            setUser(userInfo);

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Login failed';
            setError(errorMessage);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async (): Promise<void> => {
        try {
            setIsLoading(true);
            await authService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setToken(null);
            setError(null);
            setIsLoading(false);
        }
    };

    const value: AuthContextType = {
        user,
        token,
        login,
        logout,
        isLoading,
        error,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export {AuthContext};
export default AuthProvider;