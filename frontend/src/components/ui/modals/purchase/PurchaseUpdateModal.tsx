import React, { useState, useEffect } from 'react';
import { X, Truck, Calendar, Edit } from 'lucide-react';
import { Button, LoadingSpinner } from '../../';
import { CustomSearchDropdown, CustomDateInput } from '../../inputs';
import type { PurchaseReadOnlyDTO, PurchaseUpdateDTO } from '../../../../types/api/purchaseInterface';
import type { SupplierSearchResultDTO } from '../../../../types/api/supplierInterface';
import { useFormErrorHandler } from '../../../../hooks/useFormErrorHandler';
import { supplierService } from '../../../../services/supplierService';
import { authService } from '../../../../services/authService';

interface PurchaseUpdateModalProps {
    isOpen: boolean;
    onClose: () => void;
    purchase: PurchaseReadOnlyDTO;
    onUpdate: (updateData: PurchaseUpdateDTO) => Promise<void>;
}

const PurchaseUpdateModal: React.FC<PurchaseUpdateModalProps> = ({
                                                                     isOpen,
                                                                     onClose,
                                                                     purchase,
                                                                     onUpdate
                                                                 }) => {
    const [loading, setLoading] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<SupplierSearchResultDTO | null>(null);
    const [supplierSearchTerm, setSupplierSearchTerm] = useState('');
    const [supplierSearchResults, setSupplierSearchResults] = useState<SupplierSearchResultDTO[]>([]);
    const [loadingSuppliers, setLoadingSuppliers] = useState(false);
    const [purchaseDate, setPurchaseDate] = useState('');

    const { handleApiError } = useFormErrorHandler();

    // Initialize form with current purchase data
    useEffect(() => {
        if (isOpen && purchase) {
            setPurchaseDate(purchase.purchaseDate);
            setSupplierSearchTerm(purchase.supplierName);
            // You might want to set the selected supplier if you have the supplier ID
            // This would require additional data or API call
        }
    }, [isOpen, purchase]);

    // Search suppliers effect
    useEffect(() => {
        const searchSuppliers = async () => {
            if (supplierSearchTerm.trim().length >= 2) {
                setLoadingSuppliers(true);
                try {
                    const results = await supplierService.searchSuppliersForAutocomplete(supplierSearchTerm.trim());
                    setSupplierSearchResults(results);
                } catch (error) {
                    console.error('Error searching suppliers:', error);
                    setSupplierSearchResults([]);
                } finally {
                    setLoadingSuppliers(false);
                }
            } else {
                setSupplierSearchResults([]);
            }
        };

        const delayDebounceFn = setTimeout(() => {
            searchSuppliers();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [supplierSearchTerm]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedSupplier || !purchaseDate) {
            return;
        }

        const currentUser = authService.getCurrentUser();
        if (!currentUser) {
            await handleApiError(new Error('User not authenticated'));
            return;
        }

        setLoading(true);
        try {
            const updateData: PurchaseUpdateDTO = {
                purchaseId: purchase.id,
                supplierId: selectedSupplier.supplierId,
                purchaseDate: purchaseDate,
                updaterUserId: currentUser.id
            };

            await onUpdate(updateData);
            onClose();
        } catch (error) {
            console.error('Error updating purchase:', error);
            await handleApiError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (loading) return;
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
                    <div className="flex items-center space-x-3">
                        <Edit className="w-6 h-6 text-white" />
                        <h2 className="text-xl font-bold text-white">
                            Επεξεργασία Αγοράς #{purchase.id}
                        </h2>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={loading}
                        className="text-white hover:text-gray-200 transition-colors disabled:opacity-50"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Supplier Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Truck className="w-4 h-4 inline mr-1" />
                            Προμηθευτής *
                        </label>
                        <CustomSearchDropdown
                            searchTerm={supplierSearchTerm}
                            onSearchTermChange={setSupplierSearchTerm}
                            searchResults={supplierSearchResults.map(supplier => ({
                                id: supplier.supplierId,
                                name: supplier.supplierName,
                                subtitle: supplier.email || 'Χωρίς email',
                                additionalInfo: supplier.phoneNumber || 'Χωρίς τηλέφωνο'
                            }))}
                            onSelect={(supplier) => {
                                const selected = supplierSearchResults.find(s => s.supplierId === supplier.id);
                                setSelectedSupplier(selected || null);
                            }}
                            selectedItem={selectedSupplier ? {
                                id: selectedSupplier.supplierId,
                                name: selectedSupplier.supplierName,
                                subtitle: selectedSupplier.email || 'Χωρίς email',
                                additionalInfo: selectedSupplier.phoneNumber || 'Χωρίς τηλέφωνο'
                            } : null}
                            onClearSelection={() => setSelectedSupplier(null)}
                            placeholder="Αναζήτηση προμηθευτή..."
                            entityType="supplier"
                            isLoading={loadingSuppliers}
                            maxResults={10}
                            emptyMessage="Δεν βρέθηκαν προμηθευτές"
                            emptySubMessage="Δοκιμάστε να αλλάξετε τον όρο αναζήτησης"
                            required
                        />
                    </div>

                    {/* Purchase Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Calendar className="w-4 h-4 inline mr-1" />
                            Ημερομηνία Αγοράς *
                        </label>
                        <CustomDateInput
                            value={purchaseDate}
                            onChange={setPurchaseDate}
                            placeholder="Επιλέξτε ημερομηνία..."
                            className="w-full"
                            required
                        />
                    </div>

                    {/* Note about materials */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-700">
                            <strong>Σημείωση:</strong> Αυτή η φόρμα επιτρέπει την ενημέρωση μόνο των βασικών στοιχείων της αγοράς
                            (προμηθευτής και ημερομηνία). Τα υλικά και οι ποσότητες δεν μπορούν να τροποποιηθούν.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            onClick={handleClose}
                            variant="outline"
                            className="flex-1"
                            disabled={loading}
                        >
                            Ακύρωση
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            className="flex-1"
                            disabled={loading || !selectedSupplier || !purchaseDate}
                        >
                            {loading ? (
                                <>
                                    <LoadingSpinner size="sm" className="mr-2" />
                                    Ενημέρωση...
                                </>
                            ) : (
                                'Ενημέρωση'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PurchaseUpdateModal;