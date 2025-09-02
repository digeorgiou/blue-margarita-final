import React from 'react';
import { Calendar, ShoppingCart, Filter, Users, MapPin, Package, CreditCard } from 'lucide-react';
import { Button, LoadingSpinner } from '../common';
import { CustomSearchDropdown, CustomSelect, CustomDateInput } from '../inputs';
import { SaleFilterPanelProps } from "../../../types/components/filterPanel-types.ts";
import { transformCustomersForDropdown, transformSelectedCustomerForDropdown, transformProductsForDropdown, transformSelectedProductForDropdown } from "../../../utils/searchDropdownTransformations.ts";
import { SaleCard } from "../resultCards";

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
            <div>
                {loading ? (
                    <div className="bg-white flex items-center justify-center p-8">
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
                    <div className="space-y-4">
                        {searchResults.map((sale) => (
                            <SaleCard
                                key={sale.id}
                                sale={sale}
                                onViewDetails={onViewDetails}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                getPaymentMethodDisplayName={getPaymentMethodDisplayName}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SaleFilterPanel;