import React from 'react';
import { Search, DollarSign, Filter, Package } from 'lucide-react';
import { Button, LoadingSpinner } from '../';
import CustomTextInput from '../inputs/CustomTextInput.tsx';
import CustomSelect from '../inputs/CustomSelect.tsx';
import type { MispricedProductAlertDTO } from '../../../types/api/dashboardInterface';
import type { CategoryForDropdownDTO } from '../../../types/api/categoryInterface';
import MispricedProductCard from '../resultCards/MispricedProductCard';

interface MispricedProductFilterPanelProps {
    // Filter states
    searchTerm: string;
    onSearchTermChange: (value: string) => void;
    selectedCategoryId: number | undefined;
    onCategoryIdChange: (value: number | undefined) => void;
    selectedIssueType: string | undefined;
    onIssueTypeChange: (value: string | undefined) => void;
    thresholdPercentage: number;
    onThresholdPercentageChange: (value: number) => void;

    // Data
    categories: CategoryForDropdownDTO[];
    searchResults: MispricedProductAlertDTO[];
    loading: boolean;

    // Actions
    onClearFilters: () => void;
    onUpdateRetailPrice: (product: MispricedProductAlertDTO, newPrice: number) => Promise<void>;
    onUpdateWholesalePrice: (product: MispricedProductAlertDTO, newPrice: number) => Promise<void>;
    updatingRetailPrice: boolean;
    updatingWholesalePrice: boolean;

    // Utility functions
    formatMoney: (amount: number) => string;
    getPricingIssueTypeLabel: (issueType: string) => string;
}

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
        { value: '', label: 'Όλες οι κατηγορίες' },
        ...categories.map(cat => ({
            value: cat.id.toString(),
            label: cat.name
        }))
    ];

    // Issue type options
    const issueTypeOptions = [
        { value: '', label: 'Όλοι οι τύποι προβλημάτων' },
        { value: 'BOTH_UNDERPRICED', label: 'Χαμηλή Λιανική & Χονδρική' },
        { value: 'RETAIL_UNDERPRICED', label: 'Χαμηλή Λιανική Τιμή' },
        { value: 'WHOLESALE_UNDERPRICED', label: 'Χαμηλή Χονδρική Τιμή' }
    ];

    // Threshold options
    const thresholdOptions = [
        { value: '10', label: '10%+' },
        { value: '20', label: '20%+' },
        { value: '30', label: '30%+' },
        { value: '50', label: '50%+' }
    ];

    return (
        <div className="space-y-6">
            {/* FILTERS SECTION */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <DollarSign className="w-6 h-6 text-red-500" />
                    <h2 className="text-xl font-semibold text-gray-800">Φίλτρα Αναζήτησης</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <CustomTextInput
                        label="Αναζήτηση"
                        value={searchTerm}
                        onChange={onSearchTermChange}
                        placeholder="Όνομα ή κωδικός προϊόντος..."
                        icon={<Search className="w-5 h-5 text-gray-400" />}
                    />

                    <CustomSelect
                        label="Κατηγορία"
                        value={selectedCategoryId?.toString() || ''}
                        onChange={(value) => onCategoryIdChange(value ? parseInt(value) : undefined)}
                        options={categoryOptions}
                        icon={<Package className="w-5 h-5 text-blue-500" />}
                    />

                    <CustomSelect
                        label="Τύπος Προβλήματος"
                        value={selectedIssueType || ''}
                        onChange={(value) => onIssueTypeChange(value || undefined)}
                        options={issueTypeOptions}
                        icon={<DollarSign className="w-5 h-5 text-red-500" />}
                    />

                    <CustomSelect
                        label="Ελάχιστη Διαφορά"
                        value={thresholdPercentage.toString()}
                        onChange={(value) => onThresholdPercentageChange(Number(value))}
                        options={thresholdOptions}
                        icon={<DollarSign className="w-5 h-5 text-orange-500" />}
                    />

                    <div className="flex items-end">
                        <Button
                            onClick={onClearFilters}
                            variant="pink"
                            className="w-full h-13"
                        >
                            <Filter className="w-5 h-5 mr-2" />
                            Καθαρισμός Φίλτρων
                        </Button>
                    </div>
                </div>
            </div>

            {/* RESULTS SECTION */}
            <div className="bg-white rounded-lg border border-gray-200">
                {loading ? (
                    <div className="flex items-center justify-center p-8">
                        <LoadingSpinner />
                        <span className="ml-3 text-gray-600">Φόρτωση προϊόντων...</span>
                    </div>
                ) : searchResults && searchResults.length > 0 ? (
                    <div className="p-6">
                        {/* Results Summary */}
                        <div className="mb-4 flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                Εμφάνιση {searchResults.length} προϊόντων με λάθος τιμή
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
                ) : (
                    <div className="text-center py-12">
                        <DollarSign className="w-12 h-12 mx-auto text-green-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Δεν βρέθηκαν προϊόντα με λάθος τιμή
                        </h3>
                        <p className="text-gray-500 mb-4">
                            Όλες οι τιμές των προϊόντων είναι σωστές ή δοκιμάστε διαφορετικά φίλτρα.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MispricedProductFilterPanel;