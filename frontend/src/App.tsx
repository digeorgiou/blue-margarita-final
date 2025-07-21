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

    // Check if user is already logged in when app starts
    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                // Check if there's a stored token
                const token = authService.getToken();

                if (token) {
                    // Validate the token with the server
                    const isValid = await authService.validateToken();

                    if (isValid) {
                        // Token is valid, user is logged in
                        setUser('Current User'); // You can get actual user info from token
                        setAppState('dashboard');
                    } else {
                        // Token is invalid, redirect to login
                        await authService.logout(); // Clear invalid token
                        setAppState('login');
                    }
                } else {
                    // No token found, redirect to login
                    setAppState('login');
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                // On error, redirect to login
                setAppState('login');
            }
        };

        checkAuthStatus();
    }, []);

    // Handle successful login
    const handleLoginSuccess = () => {
        setUser('Current User'); // You can get actual user info from the login response
        setAppState('dashboard');
    };

    // Handle logout
    const handleLogout = async () => {
        try {
            await authService.logout();
            setUser(null);
            setAppState('login');
        } catch (error) {
            console.error('Logout failed:', error);
            // Even if logout fails, clear local state
            setUser(null);
            setAppState('login');
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