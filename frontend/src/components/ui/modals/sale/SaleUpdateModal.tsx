import React, { useState, useEffect } from 'react';
import { ShoppingCart, MapPin, CreditCard, Calendar, Lock, Package } from 'lucide-react';
import { BaseFormModal } from '../../index';
import { useFormErrorHandler } from '../../../../hooks/useFormErrorHandler';
import { CustomSelect, CustomDateInput, CustomNumberInput, CustomSearchDropdown } from '../../inputs';
import { customerService } from '../../../../services/customerService';
import type { SaleReadOnlyDTO, SaleUpdateDTO } from '../../../../types/api/saleInterface';
import type { PaymentMethodDTO } from '../../../../types/api/recordSaleInterface';
import type { LocationForDropdownDTO } from '../../../../types/api/locationInterface';
import type { CustomerSearchResultDTO } from '../../../../types/api/customerInterface';
import { FaEuroSign } from "react-icons/fa6";

interface SaleUpdateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (saleData: SaleUpdateDTO) => Promise<void>;
    sale: SaleReadOnlyDTO;
    locations: LocationForDropdownDTO[];
    paymentMethods: PaymentMethodDTO[];
}

const SaleUpdateModal: React.FC<SaleUpdateModalProps> = ({
                                                             isOpen,
                                                             onClose,
                                                             onUpdate,
                                                             sale,
                                                             locations,
                                                             paymentMethods
                                                         }) => {
    // Form state
    const [formData, setFormData] = useState<Omit<SaleUpdateDTO, 'saleId' | 'updaterUserId'>>({
        customerId: 0,
        locationId: 0,
        saleDate: '',
        finalTotalPrice: 0,
        packagingPrice: 0,
        paymentMethod: ''
    });

    // Customer search state
    const [customerSearchTerm, setCustomerSearchTerm] = useState('');
    const [customerSearchResults, setCustomerSearchResults] = useState<CustomerSearchResultDTO[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerSearchResultDTO | null>(null);
    const [loadingCustomers, setLoadingCustomers] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Transform customer data to match SearchResult interface (like other components do)
    const transformedCustomerResults = customerSearchResults.map(customer => ({
        id: customer.id,
        name: customer.fullName,
        subtitle: customer.email || 'No email',
        additionalInfo: undefined
    }));

// Transform selected customer for display
    const selectedCustomerForDropdown = selectedCustomer ? {
        id: selectedCustomer.id,
        name: selectedCustomer.fullName,
        subtitle: selectedCustomer.email || 'No email',
        additionalInfo: undefined
    } : null;

    // Error handling
    const { fieldErrors, generalError, handleApiError, clearErrors, clearFieldError } = useFormErrorHandler();

    // Initialize form data when sale changes
    useEffect(() => {
        if (sale && isOpen) {
            // Find the customer if exists
            const customerName = sale.customerName;
            if (customerName && customerName !== 'Περαστικός Πελάτης') {
                setCustomerSearchTerm(customerName);
                searchCustomers(customerName);
            } else {
                setSelectedCustomer(null);
                setCustomerSearchTerm('');
            }

            // Find location ID
            const location = locations.find(loc => loc.name === sale.locationName);

            setFormData({
                customerId: 0, // Will be set when customer is found
                locationId: location?.id || 0,
                saleDate: sale.saleDate.split('T')[0], // Extract date part
                finalTotalPrice: sale.finalTotalPrice,
                packagingPrice: sale.packagingPrice,
                paymentMethod: sale.paymentMethod
            });
        }
    }, [sale, isOpen, locations]);

    // Customer search functionality
    useEffect(() => {
        if (customerSearchTerm.trim().length >= 2) {
            const timeoutId = setTimeout(() => {
                searchCustomers(customerSearchTerm);
            }, 300);
            return () => clearTimeout(timeoutId);
        } else {
            setCustomerSearchResults([]);
        }
    }, [customerSearchTerm]);

    const searchCustomers = async (term: string) => {
        try {
            setLoadingCustomers(true);
            const results = await customerService.searchCustomersForAutocomplete(term);
            setCustomerSearchResults(results);
        } catch (error) {
            console.error('Error searching customers:', error);
            setCustomerSearchResults([]);
        } finally {
            setLoadingCustomers(false);
        }
    };

    const validateForm = (): boolean => {
        return (
            formData.locationId > 0 &&
            formData.saleDate.length > 0 &&
            formData.finalTotalPrice > 0 &&
            formData.packagingPrice >= 0 &&
            formData.paymentMethod.length > 0
        );
    };

    const handleClose = () => {
        clearErrors();
        setSelectedCustomer(null);
        setCustomerSearchTerm('');
        setCustomerSearchResults([]);
        onClose();
    };

    const handleInputChange = (field: keyof Omit<SaleUpdateDTO, 'saleId' | 'updaterUserId'>, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Clear field error when user starts typing
        if (fieldErrors[field]) {
            clearFieldError(field);
        }

        // Clear general error when user makes changes
        if (generalError) {
            clearErrors();
        }
    };

    const handleCustomerSelect = (customer: CustomerSearchResultDTO | null) => {
        setSelectedCustomer(customer);
        setFormData(prev => ({
            ...prev,
            customerId: customer?.id || 0
        }));
        if (customer) {
            setCustomerSearchTerm('');
            setCustomerSearchResults([]);
        }
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        clearErrors();

        try {
            const dataToSubmit: SaleUpdateDTO = {
                saleId: sale.id,
                updaterUserId: 1, // You'd get this from auth context
                customerId: formData.customerId,
                locationId: formData.locationId,
                saleDate: formData.saleDate,
                finalTotalPrice: formData.finalTotalPrice,
                packagingPrice: formData.packagingPrice,
                paymentMethod: formData.paymentMethod
            };

            await onUpdate(dataToSubmit);
            handleClose();
        } catch (error) {
            await handleApiError(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormValid = validateForm() && !isSubmitting;

    // Check if there are any changes from the original sale data
    const hasChanges = sale ? (
        formData.locationId !== locations.find(loc => loc.name === sale.locationName)?.id ||
        formData.saleDate !== sale.saleDate.split('T')[0] ||
        formData.finalTotalPrice !== sale.finalTotalPrice ||
        formData.packagingPrice !== sale.packagingPrice ||
        formData.paymentMethod !== sale.paymentMethod ||
        (selectedCustomer?.id || 0) !== (sale.customerName !== 'Περαστικός Πελάτης' ? 1 : 0) // Simplified check
    ) : false;

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('el-GR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    // Create options for dropdowns
    const locationOptions = locations.map(location => ({
        value: location.id,
        label: location.name
    }));

    const paymentMethodOptions = paymentMethods.map(pm => ({
        value: pm.value,
        label: pm.displayName
    }));

    if (!sale) return null;

    return (
        <BaseFormModal
            isOpen={isOpen}
            onClose={handleClose}
            title={`Επεξεργασία Πώλησης #${sale.id}`}
            onSubmit={handleSubmit}
            submitText={isSubmitting ? "Ενημέρωση..." : "Ενημέρωση"}
            cancelText="Ακύρωση"
            isValid={isFormValid && hasChanges}
        >
            <div className="space-y-6">
                {/* General Error Display */}
                {generalError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-800">
                            {generalError}
                        </p>
                    </div>
                )}

                {/* Sale Info Header */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <ShoppingCart className="w-5 h-5 text-blue-600" />
                        <h4 className="text-sm font-medium text-blue-900">
                            Επεξεργασία Πώλησης #{sale.id}
                        </h4>
                    </div>
                    <div className="text-xs text-blue-700 space-y-1">
                        <p><strong>Αρχική Ημερομηνία:</strong> {new Date(sale.saleDate).toLocaleDateString('el-GR')}</p>
                        <p><strong>Αρχικό Σύνολο:</strong> {formatCurrency(sale.finalTotalPrice)}</p>
                        <p><strong>Προϊόντα:</strong> {sale.productCount} τεμάχια</p>
                    </div>
                </div>

                {/* Important Notice */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                        <Lock className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div className="text-sm text-yellow-800">
                            <p className="font-medium mb-1">Σημαντική Σημείωση:</p>
                            <p>
                                Μπορείτε να επεξεργαστείτε μόνο τα βασικά στοιχεία της πώλησης.
                                Τα προϊόντα και οι ποσότητες δεν μπορούν να τροποποιηθούν.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                        {/* Customer Search */}
                        <CustomSearchDropdown
                            label="Πελάτης (Προαιρετικό)"
                            searchTerm={customerSearchTerm}
                            onSearchTermChange={setCustomerSearchTerm}
                            searchResults={transformedCustomerResults}  // ← Use transformed data
                            onSelect={(item: { id: number; name: string; subtitle?: string; additionalInfo?: string }) => {
                                // Transform back to original type when selecting
                                const originalCustomer = customerSearchResults.find(c => c.id === item.id);
                                handleCustomerSelect(originalCustomer || null);
                            }}
                            selectedItem={selectedCustomerForDropdown}  // ← Use transformed selected item
                            onClearSelection={() => handleCustomerSelect(null)}
                            placeholder="Αναζήτηση πελάτη ή αφήστε κενό για περαστικό..."
                            icon={<ShoppingCart className="w-5 h-5 text-blue-500" />}
                            isLoading={loadingCustomers}
                            entityType="customer"
                            minSearchLength={2}
                            emptyMessage="Δεν βρέθηκαν πελάτες"
                            emptySubMessage="Δοκιμάστε διαφορετικούς όρους αναζήτησης"
                            className={fieldErrors.customerId ? 'border-red-500' : ''}
                        />
                        {fieldErrors.customerId && (
                            <p className="text-red-600 text-sm mt-1">{fieldErrors.customerId}</p>
                        )}

                        {/* Location */}
                        <CustomSelect
                            label="Τοποθεσία *"
                            value={formData.locationId}
                            onChange={(value) => handleInputChange('locationId', Number(value))}
                            options={locationOptions}
                            icon={<MapPin className="w-5 h-5 text-purple-500" />}
                            placeholder="Επιλέξτε τοποθεσία"
                            className={fieldErrors.locationId ? 'border-red-500' : ''}
                            required
                        />
                        {fieldErrors.locationId && (
                            <p className="text-red-600 text-sm mt-1">{fieldErrors.locationId}</p>
                        )}

                        {/* Sale Date */}
                        <CustomDateInput
                            label="Ημερομηνία Πώλησης *"
                            value={formData.saleDate}
                            onChange={(value) => handleInputChange('saleDate', value)}
                            icon={<Calendar className="w-5 h-5 text-blue-500" />}
                            className={fieldErrors.saleDate ? 'border-red-500' : ''}
                            required
                        />
                        {fieldErrors.saleDate && (
                            <p className="text-red-600 text-sm mt-1">{fieldErrors.saleDate}</p>
                        )}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                        {/* Payment Method */}
                        <CustomSelect
                            label="Τρόπος Πληρωμής *"
                            value={formData.paymentMethod}
                            onChange={(value) => handleInputChange('paymentMethod', String(value))}
                            options={paymentMethodOptions}
                            icon={<CreditCard className="w-5 h-5 text-green-500" />}
                            placeholder="Επιλέξτε τρόπο πληρωμής"
                            className={fieldErrors.paymentMethod ? 'border-red-500' : ''}
                            required
                        />
                        {fieldErrors.paymentMethod && (
                            <p className="text-red-600 text-sm mt-1">{fieldErrors.paymentMethod}</p>
                        )}

                        {/* Final Total Price */}
                        <CustomNumberInput
                            label="Τελικό Σύνολο (€) *"
                            value={formData.finalTotalPrice}
                            onChange={(value) => handleInputChange('finalTotalPrice', value)}
                            placeholder="0.00"
                            icon={<FaEuroSign className="w-5 h-5 text-green-500" />}
                            min={0.01}
                            step={0.01}
                            className={fieldErrors.finalTotalPrice ? 'border-red-500' : ''}
                            required
                        />
                        {fieldErrors.finalTotalPrice && (
                            <p className="text-red-600 text-sm mt-1">{fieldErrors.finalTotalPrice}</p>
                        )}

                        {/* Packaging Price */}
                        <CustomNumberInput
                            label="Κόστος Συσκευασίας (€)"
                            value={formData.packagingPrice}
                            onChange={(value) => handleInputChange('packagingPrice', value)}
                            placeholder="0.00"
                            icon={<Package className="w-5 h-5 text-orange-500" />}
                            min={0}
                            step={0.01}
                            className={fieldErrors.packagingPrice ? 'border-red-500' : ''}
                        />
                        {fieldErrors.packagingPrice && (
                            <p className="text-red-600 text-sm mt-1">{fieldErrors.packagingPrice}</p>
                        )}
                    </div>
                </div>

                {/* Calculation Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Περίληψη Αλλαγών</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-600">Τελικό Σύνολο:</span>
                            <span className="ml-2 font-semibold text-green-600">
                                {formatCurrency(formData.finalTotalPrice)}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-600">Συσκευασία:</span>
                            <span className="ml-2 font-semibold text-orange-600">
                                {formatCurrency(formData.packagingPrice)}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-600">Κόστος Προϊόντων:</span>
                            <span className="ml-2 font-medium text-gray-800">
                                {formatCurrency(formData.finalTotalPrice - formData.packagingPrice)}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-600">Διαφορά από αρχικό:</span>
                            <span className={`ml-2 font-semibold ${
                                formData.finalTotalPrice > sale.finalTotalPrice
                                    ? 'text-green-600'
                                    : formData.finalTotalPrice < sale.finalTotalPrice
                                        ? 'text-red-600'
                                        : 'text-gray-600'
                            }`}>
                                {formData.finalTotalPrice > sale.finalTotalPrice ? '+' : ''}
                                {formatCurrency(formData.finalTotalPrice - sale.finalTotalPrice)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Change Status */}
                {!hasChanges && isFormValid && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-800">
                            ℹ️ Δεν έχουν γίνει αλλαγές στα στοιχεία της πώλησης.
                        </p>
                    </div>
                )}

                {/* Validation Errors Summary */}
                {!isFormValid && Object.keys(fieldErrors).length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-800 font-medium mb-2">
                            Παρακαλώ διορθώστε τα παρακάτω σφάλματα:
                        </p>
                        <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                            {Object.entries(fieldErrors).map(([field, error]) => (
                                <li key={field}>{error}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </BaseFormModal>
    );
};

export default SaleUpdateModal;