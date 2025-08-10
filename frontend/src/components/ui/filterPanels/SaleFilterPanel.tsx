import React from 'react';
import { Calendar, Eye, Edit, Trash2, ShoppingCart, Filter, Users, MapPin, Package, CreditCard } from 'lucide-react';
import { Button, LoadingSpinner } from '../index';
import { CustomSearchDropdown, CustomSelect, CustomDateInput } from '../inputs';
import type { SaleReadOnlyDTO } from '../../../types/api/saleInterface';
import { FaEuroSign } from "react-icons/fa6";
import { SaleFilterPanelProps } from "../../../types/components/filterPanel-types.ts";
import { transformCustomersForDropdown, transformSelectedCustomerForDropdown, transformProductsForDropdown, transformSelectedProductForDropdown } from "../../../utils/searchDropdownTransformations.ts";


const SaleFilterPanel: React.FC<SaleFilterPanelProps> = ({
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
                                                             isWholesaleFilter,
                                                             onIsWholesaleFilterChange,
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

    const clearFilters = () => {
        onCustomerSelect(null);
        onProductSelect(null);
        onLocationIdChange(undefined);
        onCategoryIdChange(undefined);
        onPaymentMethodFilterChange('');
        onIsWholesaleFilterChange(undefined);
        onDateFromFilterChange('');
        onDateToFilterChange('');
    };

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

    const getSaleTypeBadgeClass = (isWholesale: boolean): string => {
        return isWholesale
            ? 'bg-purple-100 text-purple-800'
            : 'bg-green-100 text-green-800';
    };

    const getSaleTypeDisplayName = (isWholesale: boolean): string => {
        return isWholesale ? 'Χονδρικής' : 'Λιανικής';
    };

    const getPaymentMethodDisplayName = (paymentMethodValue: string): string => {
        const paymentMethod = paymentMethods.find(pm => pm.value === paymentMethodValue);
        return paymentMethod ? paymentMethod.displayName : paymentMethodValue;
    };

    const categoryOptions = [
        { value: '', label: 'Όλες οι κατηγορίες' },
        ...categories.map(category => ({ value: category.id, label: category.name }))
    ];

    const locationOptions = [
        { value: '', label: 'Όλες οι τοποθεσίες' },
        ...locations.map(location => ({ value: location.id, label: location.name }))
    ];

    const paymentMethodOptions = [
        { value: '', label: 'Όλοι οι τρόποι πληρωμής' },
        ...paymentMethods.map(pm => ({ value: pm.value, label: pm.displayName }))
    ];

    const wholesaleOptions = [
        { value: '', label: 'Όλες οι πωλήσεις' },
        { value: 'true', label: 'Μόνο χονδρικές' },
        { value: 'false', label: 'Μόνο λιανικές' }
    ];

    // Transform data to match SearchResult interface
    const transformedCustomerResults = transformCustomersForDropdown(customerSearchResults);
    const transformedProductResults = transformProductsForDropdown(productSearchResults);
    const selectedCustomerForDropdown = transformSelectedCustomerForDropdown(selectedCustomer);
    const selectedProductForDropdown = transformSelectedProductForDropdown(selectedProduct)

    const generateSaleTitle = (sale: SaleReadOnlyDTO): string => {
        if (!sale.products || sale.products.length === 0) {
            return `Πώληση #${sale.id}`;
        }

        // If only one product, show product name and quantity
        if (sale.products.length === 1) {
            const product = sale.products[0];
            return `${product.productName} (×${product.quantity})`;
        }

        // If multiple products, show first product and count
        const firstProduct = sale.products[0];
        const remainingCount = sale.products.length - 1;

        if (remainingCount === 1) {
            return `${firstProduct.productName} (×${firstProduct.quantity}) + 1 ακόμα`;
        } else {
            return `${firstProduct.productName} (×${firstProduct.quantity}) + ${remainingCount} ακόμα`;
        }
    };

    return (
        <div className="space-y-6">
            {/* MOBILE-RESPONSIVE FILTER CONTROLS - Exact layout you requested */}
            <div className="space-y-4">

                {/* Row 1: Customer and Product - 2 columns on desktop, stack on mobile */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <CustomSearchDropdown
                        label="Πελάτης"
                        searchTerm={customerSearchTerm}
                        onSearchTermChange={onCustomerSearchTermChange}
                        searchResults={transformedCustomerResults}
                        onSelect={(customer) => onCustomerSelect(
                            customerSearchResults.find(c => c.id === customer.id) || null
                        )}
                        selectedItem={selectedCustomerForDropdown}
                        onClearSelection={() => onCustomerSelect(null)}
                        placeholder="Αναζήτηση πελάτη..."
                        icon={<Users className="w-5 h-5 text-blue-500" />}
                        isLoading={loadingCustomers}
                        entityType="customer"
                    />

                    <CustomSearchDropdown
                        label="Προϊόν"
                        searchTerm={productSearchTerm}
                        onSearchTermChange={onProductSearchTermChange}
                        searchResults={transformedProductResults}
                        onSelect={(product) => onProductSelect(
                            productSearchResults.find(p => p.id === product.id) || null
                        )}
                        selectedItem={selectedProductForDropdown}
                        onClearSelection={() => onProductSelect(null)}
                        placeholder="Αναζήτηση προϊόντος..."
                        icon={<Package className="w-5 h-5 text-green-500" />}
                        isLoading={loadingProducts}
                        entityType="product"
                    />
                </div>

                {/* Row 2: Category, Location, Payment Method, Sale Type - 4 columns on desktop, stack on mobile */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <CustomSelect
                        label="Κατηγορία"
                        value={selectedCategoryId || ''}
                        onChange={(value) => onCategoryIdChange(value === '' ? undefined : Number(value))}
                        options={categoryOptions}
                        icon={<Package className="w-5 h-5 text-purple-500" />}
                        placeholder=""
                    />

                    <CustomSelect
                        label="Τοποθεσία"
                        value={selectedLocationId || ''}
                        onChange={(value) => onLocationIdChange(value === '' ? undefined : Number(value))}
                        options={locationOptions}
                        icon={<MapPin className="w-5 h-5 text-green-500" />}
                        placeholder=""
                    />

                    <CustomSelect
                        label="Τρόπος Πληρωμής"
                        value={paymentMethodFilter}
                        onChange={onPaymentMethodFilterChange}
                        options={paymentMethodOptions}
                        icon={<CreditCard className="w-5 h-5 text-orange-500" />}
                        placeholder=""
                    />

                    <CustomSelect
                        label="Τύπος Πώλησης"
                        value={isWholesaleFilter === undefined ? '' : isWholesaleFilter.toString()}
                        onChange={(value) => {
                            if (value === '') {
                                onIsWholesaleFilterChange(undefined);
                            } else {
                                onIsWholesaleFilterChange(value === 'true');
                            }
                        }}
                        options={wholesaleOptions}
                        icon={<ShoppingCart className="w-5 h-5 text-orange-500" />}
                        placeholder=""
                    />
                </div>

                {/* Row 3: Date Filters and Clear Button - 3 columns on desktop, stack on mobile */}
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
                            className="w-full h-13"
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

            {/* RESULTS SECTION  */}
            <div className="bg-white rounded-lg border border-gray-200">
                {loading ? (
                    <div className="flex items-center justify-center p-8">
                        <LoadingSpinner/>
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
                            <div key={sale.id} className="p-6 hover:bg-blue-100 transition-colors duration-150">
                                {/* Original layout: flex items-center gap-6 on desktop, stack on mobile */}
                                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                                    {/* Left Half */}
                                    <div className="flex-1">
                                        {/* Title and Date - Wrap badges on mobile */}
                                        <div className="flex flex-wrap items-center gap-3 mb-3">
                                            <ShoppingCart className="w-5 h-5 text-blue-500" />
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {generateSaleTitle(sale)}
                                            </h3>
                                            <span className="bg-orange-200 text-black px-2 py-1 rounded-full text-sm">
                                                {formatDate(sale.saleDate)}
                                            </span>
                                            <span className={`px-2 py-1 rounded-full text-sm font-medium ${getSaleTypeBadgeClass(sale.isWholesale)}`}>
                                                {getSaleTypeDisplayName(sale.isWholesale)}
                                            </span>
                                        </div>

                                        {/* Two Columns - Stack on mobile, side-by-side on desktop */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                            {/* First Column: Customer, Payment Method, Location */}
                                            <div className="space-y-2">
                                                <div className="flex items-center">
                                                    <Users className="w-4 h-4 mr-2 text-gray-400" />
                                                    <span>{sale.customerName || 'Περαστικός Πελάτης'}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <CreditCard className="w-4 h-4 mr-2 text-gray-400" />
                                                    <span>{getPaymentMethodDisplayName(sale.paymentMethod)}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                                    <span>{sale.locationName}</span>
                                                </div>
                                            </div>

                                            {/* Second Column: Final Price, Discount, Packaging */}
                                            <div className="space-y-2">
                                                <div className="flex items-center text-green-600">
                                                    <FaEuroSign className="w-4 h-4 mr-1" />
                                                    <span className="font-semibold">Τελική Τιμή: {formatCurrency(sale.finalTotalPrice)}</span>
                                                </div>
                                                {sale.discountPercentage > 0 ? (
                                                    <div className="flex items-center text-orange-600">
                                                        <span className="font-medium">
                                                            Έκπτωση: {sale.discountPercentage}% ({formatCurrency(sale.discountAmount)})
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center text-gray-400">
                                                        <span>Έκπτωση: Καμία</span>
                                                    </div>
                                                )}
                                                {sale.packagingPrice > 0 ? (
                                                    <div className="flex items-center text-blue-600">
                                                        <span className="font-medium">
                                                            Συσκευασία: {formatCurrency(sale.packagingPrice)}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center text-gray-400">
                                                        <span>Συσκευασία: Καμία</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Half: Action Buttons - Stack on mobile */}
                                    <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center justify-center gap-2 lg:min-w-fit">
                                        <Button
                                            onClick={() => onViewDetails(sale)}
                                            variant="info"
                                            size="sm"
                                            className="w-full sm:w-auto"
                                        >
                                            <Eye className="w-4 h-4 mr-1" />
                                            Λεπτομέρειες
                                        </Button>
                                        <Button
                                            onClick={() => onEdit(sale)}
                                            variant="teal"
                                            size="sm"
                                            className="w-full sm:w-auto"
                                        >
                                            <Edit className="w-4 h-4 mr-1" />
                                            Επεξεργασία
                                        </Button>
                                        <Button
                                            onClick={() => onDelete(sale)}
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

export default SaleFilterPanel;