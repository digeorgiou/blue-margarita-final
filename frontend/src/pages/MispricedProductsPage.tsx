import React from 'react';
import MispricedProductsList from "../components/ui/Lists/MispricedProductsList.tsx";

interface MispricedProductsPageProps {
    onNavigate: (page: string) => void;
}

const MispricedProductsPage: React.FC<MispricedProductsPageProps> = ({ onNavigate }) => {
    return <MispricedProductsList onNavigate={onNavigate} />;
};

export default MispricedProductsPage;