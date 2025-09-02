import React from 'react';
import { Search, DollarSign, Filter, Package, AlertTriangle } from 'lucide-react';
import { Button, LoadingSpinner } from '../common';
import { CustomTextInput, CustomSelect } from "../inputs";
import { MispricedProductCard } from '../resultCards';
import { MispricedProductFilterPanelProps } from "../../../types/components/filterPanel-types.ts";

const MispricedProductFilterPanel: React.FC<MispricedProductFilterPanelProps> = ({
                                                                                     searchTerm,
                                                                                     onSearchTermChange,
                                                                                     selectedCategoryId,
                                                                                     onCategoryIdChange,
                                                                                     selectedIssueType,
                                                                                     onIssueTypeChange,
                                                                                     thresholdPercentage,
                                                                                     onThresholdPercentageChange,
                                                                                     categories,
                                                                                     searchResults,
                                                                                     loading,
                                                                                     onClearFilters,
                                                                                     onUpdateRetailPrice,
                                                                                     onUpdateWholesalePrice,
                                                                                     updatingRetailPrice,
                                                                                     updatingWholesalePrice,
                                                                                     formatMoney,
                                                                                     getPricingIssueTypeLabel
                                                                                 }) => {
    // Category options
    const categoryOptions = [
        { value: '', label: 'Όλες οι Κατηγορίες' },
        ...categories.map(category => ({
            value: category.id.toString(),
            label: category.name
        }))
    ];

    // Issue type options
    const issueTypeOptions = [
        { value: '', label: 'Όλα τα Προβλήματα' },
        { value: 'BOTH_UNDERPRICED', label: 'Χαμηλή Λιανική & Χονδρική' },
        { value: 'RETAIL_UNDERPRICED', label: 'Χαμηλή Λιανική Τιμή' },
        { value: 'WHOLESALE_UNDERPRICED', label: 'Χαμηλή Χονδρική Τιμή' }
    ];

    // Threshold options
    const thresholdOptions = [
        { value: '15', label: '15%+' },
        { value: '20', label: '20%+' },
        { value: '30', label: '30%+' },
        { value: '50', label: '50%+' }
    ];

    return (
        <div className="space-y-6">
            {/* Filter Controls - Following consistent pattern */}
            <div className="space-y-4">
                {/* Row 1: Search and Category - 2 columns on desktop, stack on mobile */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <CustomTextInput
                        label="Προϊόν"
                        value={searchTerm}
                        onChange={onSearchTermChange}
                        placeholder="Αναζήτηση με όνομα ή κωδικό..."
                        icon={<Search className="w-5 h-5 text-gray-400" />}
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

                {/* Row 2: Issue Type, Threshold, Clear Button - 4 columns on desktop, stack on mobile */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <CustomSelect
                        label="Τύπος Προβλήματος"
                        value={selectedIssueType || ''}
                        onChange={(value) => onIssueTypeChange(value || undefined)}
                        options={issueTypeOptions}
                        icon={<AlertTriangle className="w-5 h-5 text-red-500" />}
                        placeholder=""
                    />

                    <CustomSelect
                        label="Ελάχιστη Διαφορά"
                        value={thresholdPercentage.toString()}
                        onChange={(value) => onThresholdPercentageChange(Number(value))}
                        options={thresholdOptions}
                        icon={<DollarSign className="w-5 h-5 text-orange-500" />}
                        placeholder=""
                    />

                    <div className="flex items-end">
                        <Button
                            onClick={onClearFilters}
                            variant="pink"
                            className="w-full h-14"
                        >
                            <Filter className="w-5 h-5 mr-2" />
                            Καθαρισμός Φίλτρων
                        </Button>
                    </div>
                </div>
            </div>

            {/* Results Section */}
            <div>
                {loading && (
                    <div className="flex items-center justify-center p-8">
                        <LoadingSpinner />
                        <span className="ml-3 text-gray-600">Φόρτωση προϊόντων...</span>
                    </div>
                )}

                {!loading && searchResults.length === 0 && (
                    <div className="text-center py-12">
                        <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Δεν βρέθηκαν προϊόντα με λάθος τιμή
                        </h3>
                        <p className="text-gray-500">
                            Όλες οι τιμές των προϊόντων είναι σωστές ή δοκιμάστε διαφορετικά φίλτρα.
                        </p>
                    </div>
                )}

                {!loading && searchResults.length > 0 && (
                    <div className="space-y-4">
                        {/* Results Summary */}
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                Εμφάνιση {searchResults.length} προϊόντων
                            </p>
                            <p className="text-xs text-gray-500">
                                Κλικ στις τιμές για επεξεργασία
                            </p>
                        </div>

                        {/* Products Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {searchResults.map((product) => (
                                <MispricedProductCard
                                    key={product.productId}
                                    product={product}
                                    onUpdateRetailPrice={onUpdateRetailPrice}
                                    onUpdateWholesalePrice={onUpdateWholesalePrice}
                                    updatingRetailPrice={updatingRetailPrice}
                                    updatingWholesalePrice={updatingWholesalePrice}
                                    formatMoney={formatMoney}
                                    getPricingIssueTypeLabel={getPricingIssueTypeLabel}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MispricedProductFilterPanel;