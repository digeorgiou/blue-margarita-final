import React from 'react';
import { Button, LoadingSpinner } from '../';
import { CustomTextInput, CustomNumberInput, CustomSelect } from '../inputs';
import {
    Search,
    Filter,
    RefreshCw,
    DollarSign,
    TrendingDown,
    AlertTriangle,
    ChevronUp,
    ChevronDown,
    ExternalLink
} from 'lucide-react';
import type { MispricedProductAlertDTO } from '../../../types/api/dashboardInterface';
import type { LocationForDropdownDTO } from '../../../types/api/locationInterface';
import type { CategoryForDropdownDTO } from '../../../types/api/categoryInterface';

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
    // Helper functions
    const formatMoney = (amount: number): string => {
        return `€${amount.toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const getPricingIssueTypeLabel = (issueType: string): string => {
        switch (issueType) {
            case 'RETAIL_UNDERPRICED':
                return 'Λιανική Χαμηλή Τιμή';
            case 'WHOLESALE_UNDERPRICED':
                return 'Χονδρική Χαμηλή Τιμή';
            case 'BOTH_UNDERPRICED':
                return 'Και οι Δύο Χαμηλές';
            default:
                return issueType;
        }
    };

    const getIssueIcon = (issueType: string) => {
        switch (issueType) {
            case 'RETAIL_UNDERPRICED':
                return <TrendingDown className="w-4 h-4 text-orange-500" />;
            case 'WHOLESALE_UNDERPRICED':
                return <TrendingDown className="w-4 h-4 text-red-500" />;
            case 'BOTH_UNDERPRICED':
                return <AlertTriangle className="w-4 h-4 text-red-600" />;
            default:
                return <TrendingDown className="w-4 h-4 text-gray-500" />;
        }
    };

    const getIssueColor = (issueType: string) => {
        switch (issueType) {
            case 'RETAIL_UNDERPRICED':
                return 'bg-orange-100 text-orange-800';
            case 'WHOLESALE_UNDERPRICED':
                return 'bg-red-100 text-red-800';
            case 'BOTH_UNDERPRICED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };

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
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Προϊόντα με Λάθος Τιμή ({searchResults.length})
                                </h3>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        onClick={() => onSort('productName')}
                                        variant="secondary"
                                        size="sm"
                                        className="flex items-center space-x-1"
                                    >
                                        <span>Όνομα</span>
                                        {getSortIcon('productName')}
                                    </Button>
                                    <Button
                                        onClick={() => onSort('priceDifferencePercentage')}
                                        variant="secondary"
                                        size="sm"
                                        className="flex items-center space-x-1"
                                    >
                                        <DollarSign className="w-4 h-4" />
                                        <span>Διαφορά %</span>
                                        {getSortIcon('priceDifferencePercentage')}
                                    </Button>
                                    <Button
                                        onClick={() => onSort('categoryName')}
                                        variant="secondary"
                                        size="sm"
                                        className="flex items-center space-x-1"
                                    >
                                        <span>Κατηγορία</span>
                                        {getSortIcon('categoryName')}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Products List */}
                        <div className="divide-y divide-gray-200">
                            {searchResults.map((product) => (
                                <div
                                    key={product.productId}
                                    className="p-4 hover:bg-gray-50 transition-colors duration-200"
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
                                        {/* Product Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start space-x-3">
                                                {getIssueIcon(product.issueType)}
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2">
                                                        <h4 className="text-sm font-medium text-gray-900 truncate">
                                                            {product.productName}
                                                        </h4>
                                                        <span className="text-xs text-gray-500 font-mono">
                                                            {product.productCode}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                                        <span className="text-sm text-gray-600">
                                                            {product.categoryName}
                                                        </span>
                                                        <span
                                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getIssueColor(product.issueType)}`}
                                                        >
                                                            {getPricingIssueTypeLabel(product.issueType)}
                                                        </span>
                                                        <span className="text-sm font-semibold text-red-600">
                                                            -{product.priceDifferencePercentage.toFixed(1)}%
                                                        </span>
                                                    </div>

                                                    {/* Price Details */}
                                                    <div className="mt-2 text-xs text-gray-600 space-y-1">
                                                        {(product.issueType === 'RETAIL_UNDERPRICED' || product.issueType === 'BOTH_UNDERPRICED') && (
                                                            <div className="flex items-center space-x-2">
                                                                <span>Λιανική:</span>
                                                                <span className="text-green-600">{formatMoney(product.suggestedRetailPrice)}</span>
                                                                <span>→</span>
                                                                <span className="text-red-600">{formatMoney(product.finalRetailPrice)}</span>
                                                            </div>
                                                        )}
                                                        {(product.issueType === 'WHOLESALE_UNDERPRICED' || product.issueType === 'BOTH_UNDERPRICED') && (
                                                            <div className="flex items-center space-x-2">
                                                                <span>Χονδρική:</span>
                                                                <span className="text-green-600">{formatMoney(product.suggestedWholesalePrice)}</span>
                                                                <span>→</span>
                                                                <span className="text-red-600">{formatMoney(product.finalWholesalePrice)}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-2 lg:ml-4">
                                            <Button
                                                size="sm"
                                                variant="primary"
                                                onClick={() => onNavigateToProduct(product.productId)}
                                                className="flex items-center space-x-1"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                                <span className="hidden sm:inline">Προβολή Προϊόντος</span>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MispricedProductFilterPanel;