import React from 'react';
import { Search, Edit, Trash2, Eye, Filter, BarChart3 } from 'lucide-react';
import { Button, LoadingSpinner } from '../index';
import { CustomTextInput, CustomSelect, CustomSearchDropdown, CustomToggleOption, CustomNumberInput } from '../inputs';
import type { ProductListItemDTO } from '../../../types/api/productInterface';
import type { SearchResult } from '../../../types/components/input-types';
import { ProductFilterPanelProps } from "../../../types/components/filterPanel-types.ts";
import { GiDiamondRing } from 'react-icons/gi';

const ProductFilterPanel: React.FC<ProductFilterPanelProps> = ({
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
                                                                   onAnalytics,
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

    // Transform data for SearchDropdown components
    const transformedMaterialResults = materialSearchResults.map(material => ({
        id: material.materialId,
        name: material.materialName,
        subtitle: `${material.currentUnitCost}€/${material.unitOfMeasure}`,
        additionalInfo: material.unitOfMeasure
    }));

    const transformedProcedureResults = procedureSearchResults.map(procedure => ({
        id: procedure.id,
        name: procedure.name,
        subtitle: 'Διαδικασία',
        additionalInfo: undefined
    }));

    // Transform selected items for display in CustomSearchDropdown
    const selectedMaterialForDropdown = selectedMaterial ? {
        id: selectedMaterial.materialId,
        name: selectedMaterial.materialName,
        subtitle: `${selectedMaterial.currentUnitCost}€/${selectedMaterial.unitOfMeasure}`,
        additionalInfo: selectedMaterial.unitOfMeasure
    } : null;

    const selectedProcedureForDropdown = selectedProcedure ? {
        id: selectedProcedure.id,
        name: selectedProcedure.name,
        subtitle: 'Διαδικασία',
        additionalInfo: undefined
    } : null;

    // Handle selection events
    const handleMaterialSelect = (item: SearchResult | null) => {
        if (item) {
            const material = materialSearchResults.find(m => m.materialId === item.id);
            onMaterialSelect(material || null);
        } else {
            onMaterialSelect(null);
        }
    };

    const handleProcedureSelect = (item: SearchResult | null) => {
        if (item) {
            const procedure = procedureSearchResults.find(p => p.id === item.id);
            onProcedureSelect(procedure || null);
        } else {
            onProcedureSelect(null);
        }
    };

    // Generate category options
    const categoryOptions = [
        { value: '', label: 'Όλες οι Κατηγορίες' },
        ...categories.map(category => ({
            value: category.id.toString(),
            label: category.name
        }))
    ];

    return (
        <div className="space-y-6">
            {/* Filter Controls */}
            <div className="space-y-4">
                {/* Row 1: Product Search and Category - 2 columns on desktop, stack on mobile */}
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
                        placeholder=""
                    />
                </div>

                {/* Row 2: Min Price, Max Price, Min Stock, Max Stock, Low Stock Toggle - 5 columns on desktop, stack on mobile */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <CustomNumberInput
                        label="Ελάχιστη Τιμή (€)"
                        value={minPrice}
                        onChange={onMinPriceChange}
                        placeholder="0.00"
                        min={0}
                        step={0.01}
                    />

                    <CustomNumberInput
                        label="Μέγιστη Τιμή (€)"
                        value={maxPrice}
                        onChange={onMaxPriceChange}
                        placeholder="0.00"
                        min={0}
                        step={0.01}
                    />

                    <CustomNumberInput
                        label="Ελάχιστο Απόθεμα"
                        value={minStock}
                        onChange={onMinStockChange}
                        placeholder="0"
                        min={0}
                    />

                    <CustomNumberInput
                        label="Μέγιστο Απόθεμα"
                        value={maxStock}
                        onChange={onMaxStockChange}
                        placeholder="0"
                        min={0}
                    />

                    <div className="flex items-center justify-center">
                        <CustomToggleOption
                            optionLabel="Με Χαμηλό Απόθεμα"
                            value={lowStockOnly}
                            onChange={onLowStockOnlyChange}
                        />
                    </div>
                </div>

                {/* Row 3: Material, Procedure, Clear Filters - 3 columns on desktop, stack on mobile */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <CustomSearchDropdown
                        label="Υλικό"
                        searchTerm={materialSearchTerm}
                        onSearchTermChange={onMaterialSearchTermChange}
                        searchResults={transformedMaterialResults}
                        onSelect={handleMaterialSelect}
                        selectedItem={selectedMaterialForDropdown}
                        onClearSelection={() => onMaterialSelect(null)}
                        placeholder="Αναζήτηση υλικού..."
                        entityType="material"
                        isLoading={loadingMaterials}
                        emptyMessage="Δεν βρέθηκαν υλικά"
                        emptySubMessage="Δοκιμάστε διαφορετικό όρο αναζήτησης"
                    />

                    <CustomSearchDropdown
                        label="Διαδικασία"
                        searchTerm={procedureSearchTerm}
                        onSearchTermChange={onProcedureSearchTermChange}
                        searchResults={transformedProcedureResults}
                        onSelect={handleProcedureSelect}
                        selectedItem={selectedProcedureForDropdown}
                        onClearSelection={() => onProcedureSelect(null)}
                        placeholder="Αναζήτηση διαδικασίας..."
                        entityType="procedure"
                        isLoading={loadingProcedures}
                        emptyMessage="Δεν βρέθηκαν διαδικασίες"
                        emptySubMessage="Δοκιμάστε διαφορετικό όρο αναζήτησης"
                    />

                    <div className="flex items-end">
                        <Button
                            onClick={clearFilters}
                            variant="pink"
                            className="w-full h-12"
                        >
                            <Filter className="w-5 h-5 mr-2" />
                            Καθαρισμός Φίλτρων
                        </Button>
                    </div>
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
                        <GiDiamondRing className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Δεν βρέθηκαν προϊόντα</h3>
                        <p className="text-gray-600">
                            {searchTerm.trim() ? 'Δεν βρέθηκαν προϊόντα που να ταιριάζουν με τα κριτήρια αναζήτησης. Δοκιμάστε να αλλάξετε φίλτρα.'
                                : 'Δεν υπάρχουν αποθηκευμένα προϊόντα.'}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {searchResults.map((product) => (
                            <div key={product.id} className="p-6 hover:bg-gray-50 transition-colors duration-150">
                                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-3 mb-3">
                                            <GiDiamondRing className="w-6 h-6 text-purple-500 mr-3" />
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                                                <p className="text-sm text-gray-600">
                                                    Κωδικός: {product.code} | Κατηγορία: {product.categoryName}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                            <div className="space-y-2">
                                                <span className="text-gray-600">Τιμή Λιανικής:</span>
                                                <div className="font-semibold text-green-600">
                                                    {formatCurrency(product.finalRetailPrice)}
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Απόθεμα:</span>
                                                <div className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStockStatusColor(product)}`}>
                                                    {product.currentStock} τεμάχια
                                                    {product.isLowStock && ' (Χαμηλό)'}
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Χρόνος Παραγωγής:</span>
                                                <div className="font-semibold">{product.minutesToMake} λεπτά</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center justify-center gap-2 lg:min-w-fit">
                                        <Button
                                            onClick={() => onViewDetails(product)}
                                            variant="info"
                                            size="sm"
                                            className="w-full sm:w-auto"
                                        >
                                            <Eye className="w-4 h-4 mr-1" />
                                            Λεπτομέρειες
                                        </Button>
                                        <Button
                                            onClick={() => onAnalytics(product)}
                                            variant="purple"
                                            size="sm"
                                            className="w-full sm:w-auto"
                                        >
                                            <BarChart3 className="w-4 h-4 mr-1" />
                                            Στατιστικά
                                        </Button>
                                        <Button
                                            onClick={() => onEdit(product)}
                                            variant="teal"
                                            size="sm"
                                            className="w-full sm:w-auto"
                                        >
                                            <Edit className="w-4 h-4 mr-1" />
                                            Επεξεργασία
                                        </Button>
                                        <Button
                                            onClick={() => onDelete(product)}
                                            variant="danger"
                                            size="sm"
                                            className="w-full sm:w-auto"
                                        >
                                            <Trash2 className="w-4 h-4 mr-1" />
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

export default ProductFilterPanel;