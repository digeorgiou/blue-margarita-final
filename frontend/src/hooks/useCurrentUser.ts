import { useAuth } from './useAuth';

export const useCurrentUser = () => {
    const { user, isLoading } = useAuth();

    return {
        userId: user?.id || null,
        username: user?.username || null,
        role: user?.role || null,
        user,
        isLoading,
        isAuthenticated: !!user,
    };
};

export const useAuthenticatedUser = () => {
    const { userId, username, user, isLoading, isAuthenticated } = useCurrentUser();

    if (!isAuthenticated && !isLoading) {
        throw new Error('User must be authenticated');
    }

    return {
        userId: userId!,
        username: username!,
        user: user!,
        isLoading,
    };
};