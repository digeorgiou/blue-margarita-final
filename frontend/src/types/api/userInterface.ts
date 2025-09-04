export interface UserReadOnlyDTO {
    id: number;
    username: string;
    role: 'USER' | 'ADMIN';
    isActive: boolean;
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    lastUpdatedBy: string;
}

export interface UserInsertDTO {
    username: string;
    password: string;
    confirmedPassword: string;
    role?: 'USER' | 'ADMIN';
}

export interface UserUpdateDTO {
    userId: number;
    username: string;
    password: string;
    confirmedPassword: string;
    role: 'USER' | 'ADMIN';
}