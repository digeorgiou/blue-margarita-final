import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Button, LoadingSpinner } from '../common';
import { CustomTextInput, CustomSelect, CustomSearchDropdown, CustomToggleOption, CustomNumberInput } from '../inputs';
import type { SearchResult } from '../../../types/components/input-types';
import { ProductFilterPanelProps } from "../../../types/components/filterPanel-types.ts";
import { GiDiamondRing } from 'react-icons/gi';
import { transformProceduresForDropdown, transformSelectedProcedureForDropdown, transformMaterialsForDropdown, transformSelectedMaterialForDropdown } from "../../../utils/searchDropdownTransformations.ts";
import { ProductCard } from '../resultCards'

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

    // Transform data for SearchDropdown components
    const transformedMaterialResults = transformMaterialsForDropdown(materialSearchResults);

    const transformedProcedureResults = transformProceduresForDropdown(procedureSearchResults);

    // Transform selected items for display in CustomSearchDropdown
    const selectedMaterialForDropdown = transformSelectedMaterialForDropdown(selectedMaterial);

    const selectedProcedureForDropdown = transformSelectedProcedureForDropdown(selectedProcedure);

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
            <div>
                {loading ? (
                    <div className="bg-white rounded-lg border border-gray-200 flex items-center justify-center p-8">
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
                    <div className="space-y-4">
                        {searchResults.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onViewDetails={onViewDetails}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onAnalytics={onAnalytics}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductFilterPanel;