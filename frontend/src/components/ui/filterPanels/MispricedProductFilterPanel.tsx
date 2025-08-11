import React from 'react';
import { Button, LoadingSpinner } from '../';
import { CustomTextInput, CustomNumberInput, CustomSelect } from '../inputs';
import {
    Search,
    Filter,
    RefreshCw,
    DollarSign,
    ChevronUp,
    ChevronDown
} from 'lucide-react';
import type { MispricedProductAlertDTO } from '../../../types/api/dashboardInterface';
import type { LocationForDropdownDTO } from '../../../types/api/locationInterface';
import type { CategoryForDropdownDTO } from '../../../types/api/categoryInterface';
import { MispricedProductCard } from "../resultCards";

interface MispricedProductFilterPanelProps {
    // Filter values
    thresholdPercentage: number;
    onThresholdPercentageChange: (value: number) => void;
    nameOrCodeFilter: string;
    onNameOrCodeFilterChange: (value: string) => void;
    categoryIdFilter: number | undefined;
    onCategoryIdFilterChange: (value: number | undefined) => void;
    categories: CategoryForDropdownDTO[];
    issueTypeFilter: string;
    onIssueTypeFilterChange: (value: string) => void;
    locationIdFilter: number | undefined;
    onLocationIdFilterChange: (value: number | undefined) => void;
    locations: LocationForDropdownDTO[];

    // Results and actions
    searchResults: MispricedProductAlertDTO[];
    loading: boolean;
    onClearFilters: () => void;
    onRefresh: () => void;
    onSort: (field: string) => void;
    sortBy: string;
    sortDirection: 'ASC' | 'DESC';
    onNavigateToProduct: (productId: number) => void;
}

const MispricedProductFilterPanel: React.FC<MispricedProductFilterPanelProps> = ({
                                                                                     thresholdPercentage,
                                                                                     onThresholdPercentageChange,
                                                                                     nameOrCodeFilter,
                                                                                     onNameOrCodeFilterChange,
                                                                                     categoryIdFilter,
                                                                                     onCategoryIdFilterChange,
                                                                                     categories,
                                                                                     issueTypeFilter,
                                                                                     onIssueTypeFilterChange,
                                                                                     locationIdFilter,
                                                                                     onLocationIdFilterChange,
                                                                                     locations,
                                                                                     searchResults,
                                                                                     loading,
                                                                                     onClearFilters,
                                                                                     onRefresh,
                                                                                     onSort,
                                                                                     sortBy,
                                                                                     sortDirection,
                                                                                     onNavigateToProduct
                                                                                 }) => {


    const getSortIcon = (field: string) => {
        if (sortBy !== field) return null;
        return sortDirection === 'ASC' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
    };

    // Dropdown options
    const categoryOptions = [
        { value: '', label: 'Όλες οι κατηγορίες' },
        ...categories.map(cat => ({ value: cat.id.toString(), label: cat.name }))
    ];

    const locationOptions = [
        { value: '', label: 'Όλες οι τοποθεσίες' },
        ...locations.map(loc => ({ value: loc.id.toString(), label: loc.name }))
    ];

    const issueTypeOptions = [
        { value: '', label: 'Όλοι οι τύποι προβλημάτων' },
        { value: 'RETAIL_UNDERPRICED', label: 'Λιανική Χαμηλή Τιμή' },
        { value: 'WHOLESALE_UNDERPRICED', label: 'Χονδρική Χαμηλή Τιμή' },
        { value: 'BOTH_UNDERPRICED', label: 'Και οι Δύο Χαμηλές' }
    ];

    return (
        <div className="space-y-6">
            {/* Filter Controls */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Name/Code Search */}
                    <CustomTextInput
                        label="Αναζήτηση με όνομα ή κωδικό"
                        value={nameOrCodeFilter}
                        onChange={onNameOrCodeFilterChange}
                        placeholder="Αναζήτηση προϊόντων..."
                        icon={<Search className="w-5 h-5" />}
                        className="w-full"
                    />

                    {/* Threshold Percentage */}
                    <CustomNumberInput
                        label="Όριο Ποσοστού Διαφοράς (%)"
                        value={thresholdPercentage}
                        onChange={onThresholdPercentageChange}
                        min={1}
                        max={100}
                        step={1}
                        icon={<DollarSign className="w-5 h-5 text-green-500" />}
                        placeholder="π.χ. 20"
                    />

                    {/* Issue Type Filter */}
                    <CustomSelect
                        label="Τύπος Προβλήματος"
                        value={issueTypeFilter}
                        onChange={(value) => onIssueTypeFilterChange(value as string)}
                        options={issueTypeOptions}
                        placeholder=""
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Category Filter */}
                    <CustomSelect
                        label="Κατηγορία"
                        value={categoryIdFilter?.toString() || ''}
                        onChange={(value) => onCategoryIdFilterChange(value ? parseInt(value as string) : undefined)}
                        options={categoryOptions}
                        placeholder=""
                    />

                    {/* Location Filter */}
                    <CustomSelect
                        label="Τοποθεσία"
                        value={locationIdFilter?.toString() || ''}
                        onChange={(value) => onLocationIdFilterChange(value ? parseInt(value as string) : undefined)}
                        options={locationOptions}
                        placeholder=""
                    />

                    {/* Action Buttons */}
                    <div className="flex flex-col space-y-2">
                        <Button
                            onClick={onClearFilters}
                            variant="secondary"
                            size="sm"
                            className="w-full"
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            Καθαρισμός Φίλτρων
                        </Button>
                        <Button
                            onClick={onRefresh}
                            variant="purple"
                            size="sm"
                            disabled={loading}
                            className="w-full"
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Ανανέωση
                        </Button>
                    </div>
                </div>
            </div>

            {/* Results Section */}
            <div className="bg-white rounded-lg border border-gray-200">
                {loading ? (
                    <div className="flex items-center justify-center p-8">
                        <LoadingSpinner />
                    </div>
                ) : searchResults.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">✅</div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Δεν βρέθηκαν προϊόντα με λάθος τιμή</h3>
                        <p className="text-gray-600 mb-4">
                            {nameOrCodeFilter || categoryIdFilter || issueTypeFilter || locationIdFilter
                                ? 'Δοκιμάστε να αλλάξετε τα φίλτρα σας για να δείτε περισσότερα προϊόντα.'
                                : 'Όλες οι τιμές είναι σωστές εντός του καθορισμένου ορίου!'}
                        </p>
                        <Button onClick={onClearFilters} variant="secondary">
                            Καθαρισμός Φίλτρων
                        </Button>
                    </div>
                ) : (
                    <div>
                        {/* Products Header */}
                        <div className="bg-gray-50 border-b border-gray-200 p-4">
                            <div className="flex justify-between items-center">
                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        onClick={() => onSort('productName')}
                                        variant="secondary"
                                        size="sm"
                                    >
                                        <span>Όνομα</span>
                                        {getSortIcon('productName')}
                                    </Button>
                                    <Button
                                        onClick={() => onSort('priceDifferencePercentage')}
                                        variant="secondary"
                                        size="sm"
                                    >
                                        <DollarSign className="w-4 h-4" />
                                        <span>Διαφορά %</span>
                                        {getSortIcon('priceDifferencePercentage')}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Products List */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {searchResults.map((product) => (
                                <MispricedProductCard
                                    key={product.productId}
                                    product={product}
                                    onNavigateToProduct={onNavigateToProduct}
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