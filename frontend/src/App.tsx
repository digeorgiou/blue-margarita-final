// App.tsx
import React, { useState, useEffect } from 'react';
import Login from './pages/LoginPage';
import { authService } from './services/authService';
import { LoadingSpinner } from "./components/ui";
import Layout from "./components/ui/common/Layout.tsx"
import Dashboard from "./pages/DashboardPage.tsx";
import LowStockProductsPage from './pages/LowStockProductsPage';
import MispricedProductsPage from './pages/MispricedProductsPage';
import AllTasksPage from './pages/AllTasksPage';
import RecordSalePage from "./pages/RecordSalePage.tsx";
import RecordPurchasePage from "./pages/RecordPurchasePage.tsx";
import CategoryManagementPage   from "./pages/CategoryManagementPage.tsx";
import LocationManagementPage from "./pages/LocationManagementPage.tsx";
import CustomerManagementPage from "./pages/CustomerManagementPage.tsx";
import SupplierManagementPage from "./pages/SupplierManagementPage.tsx";
import ProcedureManagementPage from "./pages/ProcedureManagementPage.tsx";
import MaterialManagementPage from "./pages/MaterialManagementPage.tsx";
import ExpenseManagementPage from "./pages/ExpenseManagementPage.tsx";
import ProductManagementPage from "./pages/ProductManagementPage.tsx";
import CreateProductPage from "./pages/CreateProductPage";
import ProductUpdatePage from "./pages/ProductUpdatePage.tsx";
import SaleManagementPage from "./pages/SaleManagementPage.tsx";
import ProductSalesAnalyticsPage from "./pages/ProductSalesAnalyticsPage.tsx";
import StockManagementPage from "./pages/StockManagementPage.tsx";
import PurchaseManagementPage from "./pages/PurchaseManagementPage.tsx";


import './styles/global-logo-background.css';

interface NavigationState {
    page: string;
    productId?: string;
}

type AppState = 'loading' | 'login' | 'dashboard';

const App: React.FC = () => {
    const [appState, setAppState] = useState<AppState>('loading');
    const [user, setUser] = useState<string | null>(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const [navigationState, setNavigationState] = useState<NavigationState>({
        page: 'dashboard'
    });

    // Navigation handler
    const handleNavigation = (page: string, productId?: string) => {
        setNavigationState({ page, productId });
    };

    // Render page content based on currentPage
    const renderPageContent = () => {
        switch (navigationState.page) {
            case 'dashboard':
                return <Dashboard onNavigate={handleNavigation} />;
            case 'low-stock-products':
                return <LowStockProductsPage onNavigate={handleNavigation} />;
            case 'mispriced-products':
                return <MispricedProductsPage onNavigate={handleNavigation} />;
            case 'all-tasks':
                return <AllTasksPage onNavigate={handleNavigation} />;
            case 'manage-sales':
                return <SaleManagementPage onNavigate={handleNavigation}/>;
            case 'manage-products':
                return <ProductManagementPage onNavigate={handleNavigation} />;
            case 'product-sales-analytics':
                return <ProductSalesAnalyticsPage
                    onNavigate={handleNavigation}
                    productId={navigationState.productId!}
                />;
            case 'customers':
                return <CustomerManagementPage/>;
            case 'materials':
                return <MaterialManagementPage/>;
            case 'purchases':
                return <PurchaseManagementPage onNavigate={handleNavigation} />;
            case 'categories':
                return <CategoryManagementPage/>;
            case 'locations':
                return <LocationManagementPage/>;
            case 'suppliers':
                return <SupplierManagementPage/>;
            case 'procedures':
                return <ProcedureManagementPage/>
            case 'record-sale':
                return <RecordSalePage onNavigate={handleNavigation} />;
            case 'record-purchase':
                return <RecordPurchasePage onNavigate={handleNavigation} />;
            case 'stock-management':
                return <StockManagementPage/>;
            case 'expenses' :
                return <ExpenseManagementPage/>;
            case 'create-product' :
                return <CreateProductPage onNavigate={handleNavigation} />;
            case 'update-product' :
                return <ProductUpdatePage
                    productId={Number(navigationState.productId)}
                    onNavigate={handleNavigation} />;
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

    return (
        <div className="bg-gradient-to-r from-blue-900 to-purple-300 min-h-screen global-logo-background">
            <div className="relative z-10">
                <Layout
                    currentPage={navigationState.page}
                    onNavigate={handleNavigation}
                    user={user}
                    onLogout={handleLogout}
                >
                    {renderPageContent()}
                </Layout>
            </div>
        </div>
    );
};

export default App;