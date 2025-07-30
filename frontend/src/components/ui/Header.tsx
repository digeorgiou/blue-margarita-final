import React from 'react';
import LogoImage from './LogoImage';
import logo from '../../assets/white.png'
import Button from './Button'; // Import our custom Button component
import {
    LogOut,
    Home,
    ShoppingCart,
    Package,
    Users,
    Layers,
    ShoppingBag,
    MapPin,
    CheckSquare,
    AlertTriangle,
    DollarSign,
    Gem, Wrench
} from 'lucide-react';
import {HeaderProps} from "../../types/components/header.ts";

const Header: React.FC<HeaderProps> = ({
                                           onLogout,
                                           currentPage
                                       }) => {
    const getPageInfo = () => {
        const pageInfo: Record<string, { title: string; icon: React.ReactNode; description: string }> = {
            'dashboard': {
                title: 'Αρχική Σελίδα',
                icon: <Home className="w-9 h-9" />,
                description: 'Βασικά στοιχεία για την απόδοση της επιχείρησης'
            },
            'record-sale' : {
                title: 'Καταγραφή Πώλησης',
                icon: <ShoppingCart className="w-9 h-9" />,
                description: 'Καταγράψτε όλες τις λεπτομέρειες κάθε σας πώλησης'
            },
            'record-purchase' : {
                title: 'Καταγραφή Αγοράς',
                icon: <ShoppingCart className="w-9 h-9" />,
                description: 'Καταγράψτε όλες τις λεπτομέρειες κάθε σας αγοράς'
            },
            'manage-sales': {
                title: 'Sales Management',
                icon: <ShoppingCart className="w-9 h-9" />,
                description: 'Track and manage all your sales'
            },
            'manage-products': {
                title: 'Product Management',
                icon: <Package className="w-9 h-9" />,
                description: 'Manage your product catalog'
            },
            'customers': {
                title: 'Πελάτες',
                icon: <Users className="w-9 h-9" />,
                description: 'Διαχειριστείτε τους πελάτες σας και παρακολουθήστε τα στατιστικά ανα πελάτη'
            },
            'materials': {
                title: 'Υλικό',
                icon: <Layers className="w-9 h-9" />,
                description: 'Διαχειριστείτε τα υλικά που χρησιμοποιείτε στην παραγωγή και δείτε στατιστικά ανα υλικό'
            },
            'categories': {
                title:'Κατηγορίες',
                icon: <Gem className="w-9 h-9" />,
                description: 'Διαχειριστείτε τις κατηγορίες των προϊόντων σας και παρακολουθήστε τα στατιστικά ανα κατηγορία'
            },
            'purchases': {
                title: 'Purchases',
                icon: <ShoppingBag className="w-9 h-9" />,
                description: 'Purchase orders and supplier management'
            },
            'locations': {
                title: 'Τοποθεσίες',
                icon: <MapPin className="w-9 h-9" />,
                description: 'Διαχειριστείτε τις τοποθεσίες πώλησης σας και παρακολουθήστε τα στατιστικά ανα τοποθεσία'
            },
            'all-tasks': {
                title: 'Tasks',
                icon: <CheckSquare className="w-9 h-9" />,
                description: 'Προβολή και διαχείριση όλων σας των tasks'
            },
            'low-stock-products': {
                title: 'Low Stock Products',
                icon: <AlertTriangle className="w-9 h-9" />,
                description: 'Products that need restocking'
            },
            'mispriced-products': {
                title: 'Mispriced Products',
                icon: <DollarSign className="w-9 h-9" />,
                description: 'Products with pricing issues'
            },
            'procedures' : {
                title: 'Διαδικασίες',
                icon: <Wrench className="w-9 h-9"/>,
                description: "Διαχειριστείτε τις διαδικασίες και τα πάγια έξοδα παραγωγής των προϊόντων σας"
            }
        };
        return pageInfo[currentPage || 'dashboard'] || {
            title: 'Blue Margarita',
            icon: <Home className="w-9 h-9" />,
            description: 'Welcome to your business dashboard'
        };
    };

    const pageInfo = getPageInfo();

    return (
        <header className="relative bg-white/10 backdrop-blur-md border-b border-white/20 px-4 py-3 lg:px-6">
            <div className="flex items-center justify-between">

                {/* Left Section - Logo */}
                <div className="flex items-center">
                    <div className="relative">
                        <LogoImage
                            src={logo}
                            alt="Blue Margarita Logo"
                            size="md"
                            className="drop-shadow-lg"
                        />
                    </div>
                </div>

                {/* Center Section - Page Info */}
                <div className="flex items-center space-x-3">
                    <div className="text-white/80">
                        {pageInfo.icon}
                    </div>
                    <div className="text-center ml-4">
                        <h1 className="text-xl font-bold text-white">
                            {pageInfo.title}
                        </h1>
                        <p className="text-sm text-white/70 mt-1">
                            {pageInfo.description}
                        </p>
                    </div>
                </div>

                {/* Right Section - Logout Button */}
                <div className="flex items-center">
                    <Button
                        onClick={onLogout}
                        variant="ghost-secondary"
                        size="md"
                    >
                        <LogOut className="w-4 h-4" />
                        'Εξοδος
                    </Button>
                </div>
            </div>
        </header>
    );
};

export default Header;