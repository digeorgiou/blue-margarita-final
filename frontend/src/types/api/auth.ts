// types/api/auth.ts

export interface AuthenticationRequest {
    username: string;
    password: string;
}

export interface AuthenticationResponse {
    token: string;
    username: string;
    expiresIn?: number;
}

export interface UserReadOnly {
    id: number;
    username: string;
    role: UserRole;
    isActive: boolean;
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    lastUpdatedBy: string;
}

export interface UserInsert {
    username: string;
    password: string;
    role?: UserRole;
}

export interface UserUpdate {
    id: number;
    username?: string;
    password?: string;
    role?: UserRole;
    isActive?: boolean;
}

export type UserRole = 'USER' | 'ADMIN';

export interface AuthContextType {
    user: UserReadOnly | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;
    login: (credentials: AuthenticationRequest) => Promise<void>;
    logout: () => Promise<void>;
}