// App.tsx
import React, { useState, useEffect } from 'react';
import Login from './pages/LoginPage';
import { authService } from './services/authService';
import LoadingSpinner from "./components/ui/LoadingSpinner.tsx";
import Dashboard from "./pages/DashboardPage.tsx";

type AppState = 'loading' | 'login' | 'dashboard';

const App: React.FC = () => {
    const [appState, setAppState] = useState<AppState>('loading');
    const [user, setUser] = useState<string | null>(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // Check if user is already logged in when app starts
    useEffect(() => {
        // Only run this check on initial app load, not after login
        if (!isInitialLoad) return;

        const checkAuthStatus = async () => {
            try {
                console.log('Checking initial auth status...');

                // Check if there's a stored token
                const token = authService.getToken();
                console.log('Stored token exists:', !!token);

                if (token) {
                    // Validate the token with the server
                    console.log('Validating token...');
                    const isValid = await authService.validateToken();
                    console.log('Token validation result:', isValid);

                    if (isValid) {
                        // Token is valid, user is logged in
                        setUser('Current User');
                        setAppState('dashboard');
                    } else {
                        // Token is invalid, redirect to login
                        console.log('Token invalid, clearing...');
                        await authService.logout();
                        setAppState('login');
                    }
                } else {
                    // No token found, redirect to login
                    console.log('No token found, going to login');
                    setAppState('login');
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                // On error, redirect to login
                setAppState('login');
            } finally {
                setIsInitialLoad(false);
            }
        };

        checkAuthStatus();
    }, [isInitialLoad]);

    // Handle successful login
    const handleLoginSuccess = () => {
        console.log('Login successful, setting dashboard state');
        setUser('Current User');
        setAppState('dashboard');
        // Don't trigger auth check again since we just logged in successfully
    };

    // Handle logout
    const handleLogout = async () => {
        try {
            await authService.logout();
            setUser(null);
            setAppState('login');
            setIsInitialLoad(true); // Reset for next login
        } catch (error) {
            console.error('Logout failed:', error);
            // Even if logout fails, clear local state
            setUser(null);
            setAppState('login');
            setIsInitialLoad(true);
        }
    };

    // Show loading spinner while checking auth status
    if (appState === 'loading') {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <LoadingSpinner />
                    <p className="mt-4 text-gray-600">Please wait while we check your session</p>
                </div>
            </div>
        );
    }

    // Show login page
    if (appState === 'login') {
        return <Login onLoginSuccess={handleLoginSuccess} />;
    }

    // Show dashboard (with logout capability)
    return (
        <div className="min-h-screen">
            {/* Simple header with logout */}
            <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center">
                        <h1 className="text-xl font-semibold text-gray-900">Blue Margarita</h1>
                        {user && (
                            <span className="ml-4 text-sm text-gray-600">Welcome, {user}</span>
                        )}
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        Sign Out
                    </button>
                </div>
            </header>

            {/* Dashboard content */}
            <main>
                <Dashboard />
            </main>
        </div>
    );
};

export default App;