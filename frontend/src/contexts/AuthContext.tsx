// Authentication context for managing global auth state

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { AuthContextType, AuthenticationRequest, UserReadOnly } from '../types/api/auth.ts'
import { authService } from '../services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<UserReadOnly | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Initialize auth state on app start
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const storedToken = authService.getToken();
                if (storedToken) {
                    const isValid = await authService.validateToken();
                    if (isValid) {
                        setToken(storedToken);
                        // Note: You might want to decode the JWT to get user info
                        // or make an API call to get current user details
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

            // Create a basic user object from the response
            // In a real app, you might want to fetch full user details
            const basicUser: UserReadOnly = {
                id: 0, // You'll need to get this from the JWT or another API call
                username: response.username,
                role: 'USER', // Default role, should be extracted from JWT
                isActive: true,
                deletedAt: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                createdBy: response.username,
                lastUpdatedBy: response.username,
            };

            setUser(basicUser);
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