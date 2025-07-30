import React from 'react';
import { Search, Package, Edit, Trash2, Eye, Filter } from 'lucide-react';
import { Button, LoadingSpinner } from '../index';
import { CustomTextInput, CustomSelect, CustomSearchDropdown, CustomToggleOption, CustomNumberInput } from '../inputs';
import type { ProductListItemDTO } from '../../../types/api/productInterface';
import type { CategoryForDropdownDTO } from '../../../types/api/categoryInterface';
import type { ProcedureForDropdownDTO } from '../../../types/api/procedureInterface';
import type { SearchResult } from '../../../types/components/input-types';

interface ProductSearchBarProps {
    // Basic search
    searchTerm: string;
    onSearchTermChange: (value: string) => void;

    // Category filter
    selectedCategoryId: number | undefined;
    onCategoryIdChange: (value: number | undefined) => void;
    categories: CategoryForDropdownDTO[];

    // Material filter
    materialSearchTerm: string;
    onMaterialSearchTermChange: (value: string) => void;
    materialSearchResults: SearchResult[];
    selectedMaterial: SearchResult | null;
    onMaterialSelect: (material: SearchResult | null) => void;
    loadingMaterials: boolean;

    // Procedure filter
    procedureSearchTerm: string;
    onProcedureSearchTermChange: (value: string) => void;
    procedureSearchResults: SearchResult[];
    selectedProcedure: SearchResult | null;
    onProcedureSelect: (procedure: SearchResult | null) => void;
    loadingProcedures: boolean;
    selectedProcedureId: number | undefined;
    onProcedureIdChange: (value: number | undefined) => void;
    procedures: ProcedureForDropdownDTO[];

    // Stock filters
    lowStockOnly: boolean;
    onLowStockOnlyChange: (value: boolean) => void;
    minStock: number;
    onMinStockChange: (value: number) => void;
    maxStock: number;
    onMaxStockChange: (value: number) => void;

    // Price filters
    minPrice: number;
    onMinPriceChange: (value: number) => void;
    maxPrice: number;
    onMaxPriceChange: (value: number) => void;

    // Results and actions
    searchResults: ProductListItemDTO[];
    loading: boolean;
    onViewDetails: (product: ProductListItemDTO) => void;
    onEdit: (product: ProductListItemDTO) => void;
    onDelete: (product: ProductListItemDTO) => void;
    children?: React.ReactNode;
}

const ProductSearchBar: React.FC<ProductSearchBarProps> = ({
                                                               searchTerm,
                                                               onSearchTermChange,
                                                               selectedCategoryId,
                                                               onCategoryIdChange,
                                                               categories,
                                                               materialSearchTerm,
                                                               onMaterialSearchTermChange,
                                                               materialSearchResults,
                                                               selectedMaterial,
                                                               onMaterialSelect,
                                                               loadingMaterials,
                                                               procedureSearchTerm,
                                                               onProcedureSearchTermChange,
                                                               procedureSearchResults,
                                                               selectedProcedure,
                                                               onProcedureSelect,
                                                               loadingProcedures,
                                                               lowStockOnly,
                                                               onLowStockOnlyChange,
                                                               minStock,
                                                               onMinStockChange,
                                                               maxStock,
                                                               onMaxStockChange,
                                                               minPrice,
                                                               onMinPriceChange,
                                                               maxPrice,
                                                               onMaxPriceChange,
                                                               searchResults,
                                                               loading,
                                                               onViewDetails,
                                                               onEdit,
                                                               onDelete,
                                                               children
                                                           }) => {

    const clearFilters = () => {
        onSearchTermChange('');
        onCategoryIdChange(undefined);
        onMaterialSearchTermChange('');
        onMaterialSelect(null);
        onProcedureSearchTermChange('');
        onProcedureSelect(null);
        onLowStockOnlyChange(false);
        onMinStockChange(0);
        onMaxStockChange(0);
        onMinPriceChange(0);
        onMaxPriceChange(0);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('el-GR', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    };

    const getStockStatusColor = (product: ProductListItemDTO) => {
        if (product.isLowStock) return 'text-red-600 bg-red-50';
        if (product.currentStock === 0) return 'text-gray-600 bg-gray-50';
        return 'text-green-600 bg-green-50';
    };

    const getPriceDifferenceColor = (percentage: number) => {
        if (percentage < -10) return 'text-red-600';
        if (percentage < 0) return 'text-yellow-600';
        return 'text-green-600';
    };

    return (
        <div className="space-y-6">
            {/* Search and Filter Controls */}
            <div className="space-y-6">
                {/* Basic Search */}
                <div className="flex-1">
                    <CustomTextInput
                        label="Αναζήτηση κατά όνομα ή κωδικό"
                        value={searchTerm}
                        onChange={onSearchTermChange}
                        placeholder="Αναζήτηση προϊόντων..."
                        icon={<Search className="w-5 h-5" />}
                        className="w-full"
                    />
                </div>

                {/* Filters Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {/* Category Filter */}
                    <CustomSelect
                        label="Κατηγορία"
                        value={selectedCategoryId || ''}
                        onChange={(value) => onCategoryIdChange(value ? Number(value) : undefined)}
                        options={[
                            { value: '', label: 'Όλες οι κατηγορίες' },
                            ...categories.map(cat => ({ value: cat.id, label: cat.name }))
                        ]}
                        placeholder=""
                    />

                    {/* Min Stock */}
                    <CustomNumberInput
                        label="Ελάχιστο Απόθεμα"
                        value={minStock}
                        onChange={onMinStockChange}
                        placeholder="0"
                        min={0}
                    />

                    {/* Max Stock */}
                    <CustomNumberInput
                        label="Μέγιστο Απόθεμα"
                        value={maxStock}
                        onChange={onMaxStockChange}
                        placeholder="∞"
                        min={0}
                    />

                    {/* Min Price */}
                    <CustomNumberInput
                        label="Ελάχιστη Τιμή (€)"
                        value={minPrice}
                        onChange={onMinPriceChange}
                        placeholder="0.00"
                        min={0}
                        step={0.01}
                    />

                    {/* Max Price */}
                    <CustomNumberInput
                        label="Μέγιστη Τιμή (€)"
                        value={maxPrice}
                        onChange={onMaxPriceChange}
                        placeholder="∞"
                        min={0}
                        step={0.01}
                    />
                </div>

                {/* Material and Procedure Search Dropdowns */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <CustomSearchDropdown
                        label="Υλικό"
                        searchTerm={materialSearchTerm}
                        onSearchTermChange={onMaterialSearchTermChange}
                        searchResults={materialSearchResults}
                        onSelect={(material) => onMaterialSelect(material)}
                        placeholder="Αναζήτηση υλικού..."
                        entityType="material"
                        isLoading={loadingMaterials}
                        selectedItem={selectedMaterial}
                        onClearSelection={() => onMaterialSelect(null)}
                    />

                    <CustomSearchDropdown
                        label="Διαδικασία"
                        searchTerm={procedureSearchTerm}
                        onSearchTermChange={onProcedureSearchTermChange}
                        searchResults={procedureSearchResults}
                        onSelect={(procedure) => onProcedureSelect(procedure)}
                        placeholder="Αναζήτηση διαδικασίας..."
                        entityType="procedure"
                        isLoading={loadingProcedures}
                        selectedItem={selectedProcedure}
                        onClearSelection={() => onProcedureSelect(null)}
                    />

                    {/* Low Stock Toggle */}
                    <div className="flex items-end">
                        <CustomToggleOption
                            label="Χαμηλό Απόθεμα"
                            value={lowStockOnly}
                            onChange={onLowStockOnlyChange}
                            optionLabel="Μόνο προϊόντα με χαμηλό απόθεμα"
                        />
                    </div>
                </div>

                {/* Clear Filters Button */}
                <div className="flex justify-end">
                    <Button
                        onClick={clearFilters}
                        variant="pink"
                        className="flex items-center gap-2"
                    >
                        <Filter className="w-5 h-5 mr-2" />
                        Καθαρισμός Φίλτρων
                    </Button>
                </div>
            </div>

            {/* Children section - Summary Card will be rendered here */}
            {children && (
                <div>
                    {children}
                </div>
            )}

            {/* Results Section */}
            <div className="bg-white rounded-lg border border-gray-200">
                {loading ? (
                    <div className="p-8 text-center">
                        <LoadingSpinner />
                        <span className="mt-4 text-gray-600">Φόρτωση προϊόντων...</span>
                    </div>
                ) : searchResults.length === 0 ? (
                    <div className="text-center py-12">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Δεν βρέθηκαν προϊόντα</h3>
                        <p className="text-gray-600">
                            {searchTerm.trim() ? 'Δεν βρέθηκαν προϊόντα που να ταιριάζουν με τα κριτήρια αναζήτησης. Δοκιμάστε να αλλάξετε φίλτρα.'
                                : 'Δεν υπάρχουν αποθηκευμένα προϊόντα.'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {searchResults.map((product) => (
                            <div key={product.id}
                                 className="p-6 hover:bg-blue-50 transition-colors duration-150">
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="flex-shrink-0">
                                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                    <Package className="w-5 h-5 text-blue-600" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                    {product.name}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    Κωδικός: {product.code} • {product.categoryName}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <div className="font-medium">Τιμή Λιανικής:</div>
                                                <div className="font-semibold text-green-600">
                                                    {formatCurrency(product.finalRetailPrice)}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 text-gray-600">
                                                <div className="font-medium">Κόστος:</div>
                                                <div className="font-semibold">
                                                    {formatCurrency(product.totalCost)}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 text-gray-600">
                                                <div className="font-medium">Διαφορά Τιμής:</div>
                                                <div className={`font-semibold ${getPriceDifferenceColor(product.percentageDifference)}`}>
                                                    {product.percentageDifference.toFixed(1)}%
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <div className="font-medium text-gray-600">Απόθεμα:</div>
                                                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStockStatusColor(product)}`}>
                                                    {product.currentStock} τεμ.
                                                    {product.isLowStock && ' (Χαμηλό)'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 lg:flex-col lg:gap-2">
                                        <Button
                                            onClick={() => onViewDetails(product)}
                                            variant="info"
                                            size="sm"
                                            className="flex items-center gap-1"
                                        >
                                            <Eye className="w-4 h-4" />
                                            Προβολή
                                        </Button>
                                        <Button
                                            onClick={() => onEdit(product)}
                                            variant="teal"
                                            size="sm"
                                            className="flex items-center gap-1"
                                        >
                                            <Edit className="w-4 h-4" />
                                            Επεξεργασία
                                        </Button>
                                        <Button
                                            onClick={() => onDelete(product)}
                                            variant="danger"
                                            size="sm"
                                            className="flex items-center gap-1"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Διαγραφή
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductSearchBar;