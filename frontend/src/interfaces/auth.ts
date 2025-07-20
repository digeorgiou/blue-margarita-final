// Authentication interfaces matching your Spring Boot DTOs

export interface AuthenticationRequest {
    username: string;
    password: string;
}

export interface AuthenticationResponse {
    username: string;
    token: string;
}

export interface UserReadOnly {
    id: number;
    username: string;
    role: string;
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
    confirmedPassword: string;
}

export interface ApiError {
    message: string;
    status: number;
    timestamp: string;
    path: string;
}

export interface AuthContextType {
    user: UserReadOnly | null;
    token: string | null;
    login: (credentials: AuthenticationRequest) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
    error: string | null;
}