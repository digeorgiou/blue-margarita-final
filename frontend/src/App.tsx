// App.tsx
import React, { useState, useEffect } from 'react';
import Login from './pages/LoginPage';
import { authService } from './services/authService';
import { LoadingSpinner } from "./components/ui";
import Layout from "./pages/Layout.tsx"
import Dashboard from "./pages/DashboardPage.tsx";
import LowStockProductsPage from './pages/LowStockProductsPage';
import MispricedProductsPage from './pages/MispricedProductsPage';
import AllTasksPage from './pages/AllTasksPage';

type AppState = 'loading' | 'login' | 'dashboard';

const App: React.FC = () => {
    const [appState, setAppState] = useState<AppState>('loading');
    const [user, setUser] = useState<string | null>(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [currentPage, setCurrentPage] = useState('dashboard');

    // Navigation handler
    const handleNavigation = (page: string) => {
        setCurrentPage(page);
        console.log(`Navigating to: ${page}`);
    };

    // Render page content based on currentPage
    const renderPageContent = () => {
        switch (currentPage) {
            case 'dashboard':
                return <Dashboard onNavigate={handleNavigation} />;
            case 'low-stock-products':
                return <LowStockProductsPage onNavigate={handleNavigation} />;

            case 'mispriced-products':
                return <MispricedProductsPage onNavigate={handleNavigation} />;

            case 'all-tasks':
                return <AllTasksPage onNavigate={handleNavigation} />;
            case 'manage-sales':
                return <div className="p-4"><h1 className="text-2xl text-white">Manage Sales - Coming Soon</h1></div>;
            case 'manage-products':
                return <div className="p-4"><h1 className="text-2xl text-white">Manage Products - Coming Soon</h1></div>;
            case 'customers':
                return <div className="p-4"><h1 className="text-2xl text-white">Customers - Coming Soon</h1></div>;
            case 'materials':
                return <div className="p-4"><h1 className="text-2xl text-white">Materials - Coming Soon</h1></div>;
            case 'purchases':
                return <div className="p-4"><h1 className="text-2xl text-white">Purchases - Coming Soon</h1></div>;
            case 'locations':
                return <div className="p-4"><h1 className="text-2xl text-white">Locations - Coming Soon</h1></div>;
            case 'record-sale':
                return <div className="p-4"><h1 className="text-2xl text-white">Record Sale - Coming Soon</h1></div>;
            case 'record-purchase':
                return <div className="p-4"><h1 className="text-2xl text-white">Record Purchase - Coming Soon</h1></div>;
            case 'stock-management':
                return <div className="p-4"><h1 className="text-2xl text-white">Stock Management - Coming Soon</h1></div>;
            default:
                return <Dashboard onNavigate={handleNavigation} />;
        }
    };

    // Check if user is already logged in when app starts
    useEffect(() => {
        if (!isInitialLoad) return;

        const checkAuthStatus = async () => {
            try {
                console.log('Checking initial auth status...');

                const token = authService.getToken();
                console.log('Stored token exists:', !!token);

                if (token) {
                    console.log('Validating token...');
                    const isValid = await authService.validateToken();
                    console.log('Token validation result:', isValid);

                    if (isValid) {
                        setUser('Current User');
                        setAppState('dashboard');
                    } else {
                        console.log('Token invalid, clearing...');
                        await authService.logout();
                        setAppState('login');
                    }
                } else {
                    console.log('No token found, going to login');
                    setAppState('login');
                }
            } catch (error) {
                console.error('Auth check failed:', error);
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
    };

    // Handle logout
    const handleLogout = async () => {
        try {
            await authService.logout();
            setUser(null);
            setAppState('login');
            setIsInitialLoad(true);
        } catch (error) {
            console.error('Logout failed:', error);
            setUser(null);
            setAppState('login');
            setIsInitialLoad(true);
        }
    };

    // Show loading spinner while checking auth status
    if (appState === 'loading') {
        return (
            <div className="bg-gradient-to-r from-[#20043d] via-[#280a48] to-[#ecd4ff] min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <LoadingSpinner />
                    <p className="mt-4 text-white">Please wait while we check your session</p>
                </div>
            </div>
        );
    }

    // Show login page
    if (appState === 'login') {
        return (
            <div className="bg-gradient-to-r from-[#20043d] via-[#280a48] to-[#ecd4ff] min-h-screen">
                <Login onLoginSuccess={handleLoginSuccess} />
            </div>
        );
    }

    // Show dashboard with Layout (THIS IS THE KEY CHANGE!)
    return (
        <div className="bg-gradient-to-r from-blue-900 to-purple-300 min-h-screen">
            <Layout
                currentPage={currentPage}
                onNavigate={handleNavigation}
                user={user}
                onLogout={handleLogout}
            >
                {renderPageContent()}
            </Layout>
        </div>
    );
};

export default App;