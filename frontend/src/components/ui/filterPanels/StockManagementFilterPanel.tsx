import React from 'react';
import { Search, Package, Filter, RefreshCw } from 'lucide-react';
import { Button, LoadingSpinner } from '../';
import CustomTextInput from '../inputs/CustomTextInput.tsx';
import CustomSelect from '../inputs/CustomSelect.tsx';
import type {
    StockManagementDTO,
    StockStatus
} from '../../../types/api/stockManagementInterface';
import type { CategoryForDropdownDTO } from '../../../types/api/categoryInterface';
import { StockProductCard } from './'

interface StockManagementFilterPanelProps {
    // Filter states
    searchTerm: string;
    onSearchTermChange: (value: string) => void;
    selectedCategoryId: number | undefined;
    onCategoryIdChange: (value: number | undefined) => void;
    selectedStatus: StockStatus | undefined;
    onStatusChange: (value: StockStatus | undefined) => void;
    minStock: number;
    onMinStockChange: (value: number) => void;
    maxStock: number;
    onMaxStockChange: (value: number) => void;

    // Data
    categories: CategoryForDropdownDTO[];
    searchResults: StockManagementDTO[];
    loading: boolean;

    // Actions
    onClearFilters: () => void;
    onRefresh: () => void;
    onUpdateStock: (product: StockManagementDTO, newStock: number) => Promise<void>;
    updatingStock: boolean;
}

const StockManagementFilterPanel: React.FC<StockManagementFilterPanelProps> = ({
                                                                                   searchTerm,
                                                                                   onSearchTermChange,
                                                                                   selectedCategoryId,
                                                                                   onCategoryIdChange,
                                                                                   selectedStatus,
                                                                                   onStatusChange,
                                                                                   minStock,
                                                                                   onMinStockChange,
                                                                                   maxStock,
                                                                                   onMaxStockChange,
                                                                                   categories,
                                                                                   searchResults,
                                                                                   loading,
                                                                                   onClearFilters,
                                                                                   onRefresh,
                                                                                   onUpdateStock,
                                                                                   updatingStock
                                                                               }) => {

    // Category options
    const categoryOptions = [
        { value: '', label: 'Όλες οι Κατηγορίες' },
        ...categories.map(category => ({
            value: category.id,
            label: category.name
        }))
    ];

    // Status options
    const statusOptions = [
        { value: '', label: 'Όλες οι Καταστάσεις' },
        { value: 'NORMAL', label: 'Κανονικό Απόθεμα' },
        { value: 'LOW', label: 'Χαμηλό Απόθεμα' },
        { value: 'NEGATIVE', label: 'Αρνητικό Απόθεμα' },
        { value: 'NO_ALERT', label: 'Χωρίς Ειδοποίηση' }
    ];

    // Get stock status color
    const getStockStatusColor = (status: StockStatus): string => {
        switch (status) {
            case 'NORMAL': return 'text-green-600 bg-green-100';
            case 'LOW': return 'text-yellow-600 bg-yellow-100';
            case 'NEGATIVE': return 'text-red-600 bg-red-100';
            case 'NO_ALERT': return 'text-blue-600 bg-blue-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    return (
        <div className="space-y-6">
            {/* Filter Controls */}
            <div className="space-y-4">
                {/* Row 1: Search and Category - 2 columns on desktop, stack on mobile */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <CustomTextInput
                        label="Αναζήτηση Προϊόντων"
                        value={searchTerm}
                        onChange={onSearchTermChange}
                        placeholder="Αναζήτηση με όνομα ή κωδικό..."
                        icon={<Search className="w-5 h-5" />}
                    />

                    <CustomSelect
                        label="Κατηγορία"
                        value={selectedCategoryId || ''}
                        onChange={(value) => onCategoryIdChange(value === '' ? undefined : Number(value))}
                        options={categoryOptions}
                        icon={<Package className="w-5 h-5 text-purple-500" />}
                        placeholder=""
                    />
                </div>

                {/* Row 2: Status and Stock Range - 3 columns on desktop, stack on mobile */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <CustomSelect
                        label="Κατάσταση Αποθέματος"
                        value={selectedStatus || ''}
                        onChange={(value) => onStatusChange(value === '' ? undefined : value as StockStatus)}
                        options={statusOptions}
                        icon={<Package className="w-5 h-5 text-blue-500" />}
                        placeholder=""
                    />

                    <CustomTextInput
                        label="Ελάχιστο Απόθεμα"
                        type="number"
                        value={minStock > 0 ? minStock.toString() : ''}
                        onChange={(value) => onMinStockChange(Number(value) || 0)}
                        placeholder="0"
                        min="0"
                    />

                    <CustomTextInput
                        label="Μέγιστο Απόθεμα"
                        type="number"
                        value={maxStock > 0 ? maxStock.toString() : ''}
                        onChange={(value) => onMaxStockChange(Number(value) || 0)}
                        placeholder="1000"
                        min="0"
                    />
                </div>

                {/* Row 3: Actions and Selection - flexible layout */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center space-x-3">
                        <Button
                            onClick={onClearFilters}
                            variant="pink"
                            className="flex items-center"
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            Καθαρισμός Φίλτρων
                        </Button>
                        <Button
                            onClick={onRefresh}
                            variant="secondary"
                            disabled={loading}
                            className="flex items-center"
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Ανανέωση
                        </Button>
                    </div>
                </div>
            </div>

            {/* RESULTS SECTION */}
            <div className="bg-white rounded-lg border border-gray-200">
                {loading ? (
                    <div className="flex items-center justify-center p-8">
                        <LoadingSpinner/>
                        <span className="ml-3 text-gray-600">Φόρτωση προϊόντων...</span>
                    </div>
                ) : searchResults && searchResults.length > 0 ? (
                    <div className="p-6">
                        {/* Results Summary */}
                        <div className="mb-4 flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                Εμφάνιση {searchResults.length} προϊόντων
                            </p>
                        </div>

                        {/* Products Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {searchResults.map((product) => (
                                <StockProductCard
                                    key={product.productId}
                                    product={product}
                                    isSelected={selectedProducts.has(product.productId)}
                                    onToggleSelect={() => onToggleProductSelection(product.productId)}
                                    onUpdateStock={onUpdateStock}
                                    updating={updatingStock}
                                    getStatusColor={getStockStatusColor}
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Δεν βρέθηκαν προϊόντα
                        </h3>
                        <p className="text-gray-500 mb-4">
                            Δοκιμάστε διαφορετικούς όρους αναζήτησης ή αλλάξτε τα φίλτρα.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StockManagementFilterPanel;