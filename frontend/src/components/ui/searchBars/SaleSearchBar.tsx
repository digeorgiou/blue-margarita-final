import React from 'react';
import { Calendar, Eye, Edit, Trash2, ShoppingCart, Filter, Users, MapPin, Package, CreditCard } from 'lucide-react';
import { Button, LoadingSpinner } from '../index';
import { CustomSearchDropdown, CustomSelect, CustomDateInput } from '../inputs';
import type { SaleReadOnlyDTO } from '../../../types/api/saleInterface';
import type { PaymentMethodDTO } from '../../../types/api/recordSaleInterface';
import type { LocationForDropdownDTO } from '../../../types/api/locationInterface';
import type { CategoryForDropdownDTO } from '../../../types/api/categoryInterface';
import type { CustomerSearchResultDTO } from '../../../types/api/customerInterface';
import type { ProductSearchResultDTO } from '../../../types/api/productInterface';
import { FaEuroSign } from "react-icons/fa6";

interface SaleSearchBarProps {
    // Customer filter
    customerSearchTerm: string;
    onCustomerSearchTermChange: (value: string) => void;
    customerSearchResults: CustomerSearchResultDTO[];
    selectedCustomer: CustomerSearchResultDTO | null;
    onCustomerSelect: (customer: CustomerSearchResultDTO | null) => void;
    loadingCustomers: boolean;

    // Product filter
    productSearchTerm: string;
    onProductSearchTermChange: (value: string) => void;
    productSearchResults: ProductSearchResultDTO[];
    selectedProduct: ProductSearchResultDTO | null;
    onProductSelect: (product: ProductSearchResultDTO | null) => void;
    loadingProducts: boolean;

    // Location filter
    selectedLocationId: number | undefined;
    onLocationIdChange: (value: number | undefined) => void;
    locations: LocationForDropdownDTO[];

    // Category filter
    selectedCategoryId: number | undefined;
    onCategoryIdChange: (value: number | undefined) => void;
    categories: CategoryForDropdownDTO[];

    // Payment method filter
    paymentMethodFilter: string;
    onPaymentMethodFilterChange: (value: string) => void;
    paymentMethods: PaymentMethodDTO[];

    // Date filters
    dateFromFilter: string;
    onDateFromFilterChange: (value: string) => void;
    dateToFilter: string;
    onDateToFilterChange: (value: string) => void;

    // Results and actions
    searchResults: SaleReadOnlyDTO[];
    loading: boolean;
    onViewDetails: (sale: SaleReadOnlyDTO) => void;
    onEdit: (sale: SaleReadOnlyDTO) => void;
    onDelete: (sale: SaleReadOnlyDTO) => void;
    children?: React.ReactNode;
}

const SaleSearchBar: React.FC<SaleSearchBarProps> = ({
                                                         customerSearchTerm,
                                                         onCustomerSearchTermChange,
                                                         customerSearchResults,
                                                         selectedCustomer,
                                                         onCustomerSelect,
                                                         loadingCustomers,
                                                         productSearchTerm,
                                                         onProductSearchTermChange,
                                                         productSearchResults,
                                                         selectedProduct,
                                                         onProductSelect,
                                                         loadingProducts,
                                                         selectedLocationId,
                                                         onLocationIdChange,
                                                         locations,
                                                         selectedCategoryId,
                                                         onCategoryIdChange,
                                                         categories,
                                                         paymentMethodFilter,
                                                         onPaymentMethodFilterChange,
                                                         paymentMethods,
                                                         dateFromFilter,
                                                         onDateFromFilterChange,
                                                         dateToFilter,
                                                         onDateToFilterChange,
                                                         searchResults,
                                                         loading,
                                                         onViewDetails,
                                                         onEdit,
                                                         onDelete,
                                                         children
                                                     }) => {
    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('el-GR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('el-GR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getPaymentMethodDisplayName = (value: string): string => {
        const paymentMethod = paymentMethods.find(pm => pm.value === value);
        return paymentMethod ? paymentMethod.displayName : value;
    };

    const clearFilters = () => {
        onCustomerSelect(null);
        onCustomerSearchTermChange('');
        onProductSelect(null);
        onProductSearchTermChange('');
        onLocationIdChange(undefined);
        onCategoryIdChange(undefined);
        onPaymentMethodFilterChange('');
        onDateFromFilterChange('');
        onDateToFilterChange('');
    };

    // Create options for dropdowns
    const locationOptions = [
        { value: '', label: 'Όλες οι τοποθεσίες' },
        ...locations.map(location => ({ value: location.id, label: location.name }))
    ];

    const categoryOptions = [
        { value: '', label: 'Όλες οι κατηγορίες' },
        ...categories.map(category => ({ value: category.id, label: category.name }))
    ];

    const paymentMethodOptions = [
        { value: '', label: 'Όλοι οι τρόποι πληρωμής' },
        ...paymentMethods.map(pm => ({ value: pm.value, label: pm.displayName }))
    ];

    return (
        <div className="space-y-6">
            {/* Search and Filter Controls */}
            <div className="space-y-4">
                {/* Row 1: Customer and Product Search */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CustomSearchDropdown
                        label="Πελάτης"
                        searchTerm={customerSearchTerm}
                        onSearchTermChange={onCustomerSearchTermChange}
                        searchResults={customerSearchResults}
                        onSelect={onCustomerSelect}
                        selectedItem={selectedCustomer}
                        onClearSelection={() => onCustomerSelect(null)}
                        placeholder="Αναζήτηση πελάτη..."
                        icon={<Users className="w-5 h-5 text-blue-500" />}
                        isLoading={loadingCustomers}
                        entityType="customer"
                        minSearchLength={2}
                        emptyMessage="Δεν βρέθηκαν πελάτες"
                        emptySubMessage="Δοκιμάστε διαφορετικούς όρους αναζήτησης"
                        renderItem={(customer) => (
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-medium">{customer.name}</div>
                                    {customer.email && (
                                        <div className="text-sm text-gray-500">{customer.email}</div>
                                    )}
                                </div>
                                {customer.phoneNumber && (
                                    <div className="text-sm text-gray-400">{customer.phoneNumber}</div>
                                )}
                            </div>
                        )}
                    />

                    <CustomSearchDropdown
                        label="Προϊόν"
                        searchTerm={productSearchTerm}
                        onSearchTermChange={onProductSearchTermChange}
                        searchResults={productSearchResults}
                        onSelect={onProductSelect}
                        selectedItem={selectedProduct}
                        onClearSelection={() => onProductSelect(null)}
                        placeholder="Αναζήτηση προϊόντος..."
                        icon={<Package className="w-5 h-5 text-green-500" />}
                        isLoading={loadingProducts}
                        entityType="product"
                        minSearchLength={2}
                        emptyMessage="Δεν βρέθηκαν προϊόντα"
                        emptySubMessage="Δοκιμάστε διαφορετικούς όρους αναζήτησης"
                        renderItem={(product) => (
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-medium">{product.name}</div>
                                    <div className="text-sm text-gray-500">{product.code}</div>
                                </div>
                                <div className="text-sm text-gray-400">{product.categoryName}</div>
                            </div>
                        )}
                    />
                </div>

                {/* Row 2: Location, Category, Payment Method */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <CustomSelect
                        label="Τοποθεσία"
                        value={selectedLocationId?.toString() || ''}
                        onChange={(value) => onLocationIdChange(value ? Number(value) : undefined)}
                        options={locationOptions}
                        icon={<MapPin className="w-5 h-5 text-purple-500" />}
                        placeholder=""
                    />

                    <CustomSelect
                        label="Κατηγορία"
                        value={selectedCategoryId?.toString() || ''}
                        onChange={(value) => onCategoryIdChange(value ? Number(value) : undefined)}
                        options={categoryOptions}
                        icon={<Package className="w-5 h-5 text-indigo-500" />}
                        placeholder=""
                    />

                    <CustomSelect
                        label="Τρόπος Πληρωμής"
                        value={paymentMethodFilter}
                        onChange={(value) => onPaymentMethodFilterChange(value as string)}
                        options={paymentMethodOptions}
                        icon={<CreditCard className="w-5 h-5 text-green-500" />}
                        placeholder=""
                    />
                </div>

                {/* Row 3: Date Filters and Clear Button */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <CustomDateInput
                        label="Από Ημερομηνία"
                        value={dateFromFilter}
                        onChange={onDateFromFilterChange}
                        icon={<Calendar className="w-5 h-5 text-blue-500" />}
                    />

                    <CustomDateInput
                        label="Έως Ημερομηνία"
                        value={dateToFilter}
                        onChange={onDateToFilterChange}
                        icon={<Calendar className="w-5 h-5 text-blue-500" />}
                    />

                    <div className="flex items-end">
                        <Button
                            onClick={clearFilters}
                            variant="pink"
                            className="w-full"
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
                    <div className="flex items-center justify-center p-8">
                        <LoadingSpinner size="lg" />
                        <span className="ml-3 text-gray-600">Αναζήτηση πωλήσεων...</span>
                    </div>
                ) : searchResults.length === 0 ? (
                    <div className="text-center py-12">
                        <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Δεν βρέθηκαν πωλήσεις</h3>
                        <p className="text-gray-500">Δοκιμάστε να αλλάξετε τα κριτήρια αναζήτησης</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {searchResults.map((sale) => (
                            <div key={sale.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <ShoppingCart className="w-5 h-5 text-blue-500" />
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                Πώληση #{sale.id}
                                            </h3>
                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                                                {formatDate(sale.saleDate)}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                                            <div className="flex items-center">
                                                <Users className="w-4 h-4 mr-2 text-gray-400" />
                                                <span>{sale.customerName || 'Περαστικός Πελάτης'}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                                <span>{sale.locationName}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <CreditCard className="w-4 h-4 mr-2 text-gray-400" />
                                                <span>{getPaymentMethodDisplayName(sale.paymentMethod)}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <Package className="w-4 h-4 mr-2 text-gray-400" />
                                                <span>{sale.productCount} προϊόντα</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 text-sm">
                                            <div className="flex items-center text-green-600">
                                                <FaEuroSign className="w-4 h-4 mr-1" />
                                                <span className="font-semibold">Τελικό: {formatCurrency(sale.finalTotalPrice)}</span>
                                            </div>
                                            {sale.discountPercentage > 0 && (
                                                <div className="flex items-center text-orange-600">
                                                    <span className="font-medium">
                                                        Έκπτωση: {sale.discountPercentage}% ({formatCurrency(sale.discountAmount)})
                                                    </span>
                                                </div>
                                            )}
                                            {sale.packagingPrice > 0 && (
                                                <div className="flex items-center text-blue-600">
                                                    <span className="font-medium">
                                                        Συσκευασία: {formatCurrency(sale.packagingPrice)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 ml-4">
                                        <Button
                                            onClick={() => onViewDetails(sale)}
                                            variant="ghost"
                                            size="sm"
                                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                        >
                                            <Eye className="w-4 h-4 mr-1" />
                                            Προβολή
                                        </Button>
                                        <Button
                                            onClick={() => onEdit(sale)}
                                            variant="ghost"
                                            size="sm"
                                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                        >
                                            <Edit className="w-4 h-4 mr-1" />
                                            Επεξεργασία
                                        </Button>
                                        <Button
                                            onClick={() => onDelete(sale)}
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
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

export default SaleSearchBar;