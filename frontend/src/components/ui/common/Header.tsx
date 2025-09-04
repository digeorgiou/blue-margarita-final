import React from 'react';
import { Button } from './';
import {
    LogOut,
    Home,
    ShoppingCart,
    Package,
    Users,
    ShoppingBag,
    MapPin,
    CheckSquare,
    AlertTriangle,
    ClipboardPenLine,
    Gem,
    Truck, Edit,
    Settings, TrendingUp,
    CircleUserRound
} from 'lucide-react';
import { GiDiamondRing, GiPayMoney } from 'react-icons/gi';
import { FaEuroSign } from "react-icons/fa6";
import { IoHammerOutline } from "react-icons/io5";
import {HeaderProps} from "../../../types/components/common-types.ts";

const Header: React.FC<HeaderProps> = ({
                                           onLogout,
                                           currentPage
                                       }) => {
    const getPageInfo = () => {
        const pageInfo: Record<string, { title: string; icon: React.ReactNode; }> = {
            'dashboard': {
                title: 'Αρχική Σελίδα',
                icon: <Home className="w-9 h-9" />
            },
            'record-sale' : {
                title: 'Καταγραφή Πώλησης',
                icon: <ShoppingCart className="w-9 h-9" />
            },
            'record-purchase' : {
                title: 'Καταγραφή Αγοράς',
                icon: <ShoppingCart className="w-9 h-9" />
            },
            'manage-sales': {
                title: 'Διαχείριση Πωλήσεων',
                icon: <ShoppingCart className="w-9 h-9" />
            },
            'manage-products': {
                title: 'Διαχείριση Προϊόντων',
                icon: <GiDiamondRing className="w-9 h-9" />
            },
            'create-product': {
                title: 'Δημιουργία Προϊόντος',
                icon: <Package className="w-9 h-9" />
            },
            'update-product': {
                title: 'Επεξεργασία Προϊόντος',
                icon: <Edit className="w-9 h-9" />
            },
            'customers': {
                title: 'Διαχείριση Πελατών',
                icon: <Users className="w-9 h-9" />
            },
            'materials': {
                title: 'Διαχείριση Υλικών',
                icon: <IoHammerOutline className="w-9 h-9" />
            },
            'categories': {
                title:'Διαχείριση Κατηγοριών',
                icon: <Gem className="w-9 h-9" />
            },
            'purchases': {
                title: 'Διαχείριση Αγορών',
                icon: <ShoppingBag className="w-9 h-9" />
            },
            'locations': {
                title: 'Διαχείριση Τοποθεσιών',
                icon: <MapPin className="w-9 h-9" />
            },
            'all-tasks': {
                title: 'Διαχείριση To Do List',
                icon: <CheckSquare className="w-9 h-9" />
            },
            'low-stock-products': {
                title: 'Low Stock Products',
                icon: <AlertTriangle className="w-9 h-9" />
            },
            'mispriced-products': {
                title: 'Προϊόντα με Λάθος Τιμή',
                icon: <GiPayMoney className="w-9 h-9" />
            },
            'procedures' : {
                title: 'Διαχείριση Διαδικασιών',
                icon: <Settings className="w-9 h-9"/>
            },
            'suppliers' : {
                title: 'Διαχείριση Προμηθευτών',
                icon: <Truck className="w-9 h-9" />
            },
            'expenses' : {
                title: "Διαχείριση Εξόδων",
                icon: < FaEuroSign className="w-9 h-9" />
            },
            'stock-management' : {
                title: "Διαχείριση Αποθέματος Προϊόντων",
                icon: <ClipboardPenLine className="w-9 h-9" />
            },
            'profit-losses' : {
                title: "Προβολή Κερδών/Ζημιών",
                icon: <TrendingUp className="w-9 h-9" />
            },
            'user-management' : {
            title: "Διαχείριση Χρηστών",
                icon: <CircleUserRound className="w-9 h-9" />
        }
        };
        return pageInfo[currentPage || 'dashboard'] || {
            title: 'Αρχική Σελίδα',
            icon: <Home className="w-9 h-9" />,
            description: 'Welcome to your business dashboard'
        };
    };

    const pageInfo = getPageInfo();

    return (
        <header className="relative bg-white/10 backdrop-blur-md border-b border-white/20 px-4 py-3 lg:px-6">
            <div className="flex items-center justify-between">

                {/* Left Section - Icon */}
                <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white px-1 py-1">
                        {pageInfo.icon}
                    </div>
                </div>

                {/* Center Section - Page Info */}
                <div className="flex items-center space-x-3">
                    <div className="text-center ml-4">
                        <h1 className="text-xl font-bold text-white">
                            {pageInfo.title}
                        </h1>
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