import React from 'react';
import LowStockProductsList from "../components/ui/Lists/LowStockProductsList.tsx";

interface LowStockProductsPageProps {
    onNavigate: (page: string) => void;
}

const LowStockProductsPage: React.FC<LowStockProductsPageProps> = ({ onNavigate }) => {
    return <LowStockProductsList onNavigate={onNavigate} />;
};

export default LowStockProductsPage;