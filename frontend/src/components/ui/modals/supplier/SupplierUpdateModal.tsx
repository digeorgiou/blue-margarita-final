import React, { useState, useEffect } from 'react';
import { Building2, Phone, CreditCard, Mail, MapPin } from 'lucide-react';
import { BaseFormModal, Input } from '../../index';
import { SupplierReadOnlyDTO, SupplierUpdateDTO } from '../../../../types/api/supplierInterface';
import { useFormErrorHandler } from '../../../../hooks/useFormErrorHandler';

interface SupplierUpdateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: SupplierUpdateDTO) => Promise<void>;
    supplier: SupplierReadOnlyDTO | null;
}

const SupplierUpdateModal: React.FC<SupplierUpdateModalProps> = ({
                                                                     isOpen,
                                                                     onClose,
                                                                     onSubmit,
                                                                     supplier
                                                                 }) => {
    const [formData, setFormData] = useState<Omit<SupplierUpdateDTO, 'supplierId' | 'updaterUserId'>>({
        name: '',
        address: '',
        tin: '',
        phoneNumber: '',
        email: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Use the reusable error handler hook
    const {
        fieldErrors,
        generalError,
        handleApiError,
        clearErrors,
        clearFieldError
    } = useFormErrorHandler();

    // Initialize form data when supplier changes
    useEffect(() => {
        if (supplier) {
            setFormData({
                name: supplier.name || '',
                address: supplier.address || '',
                tin: supplier.tin || '',
                phoneNumber: supplier.phoneNumber || '',
                email: supplier.email || ''
            });
        }
    }, [supplier]);

    const validateForm = (): boolean => {
        return formData.name.trim().length > 0;
    };

    const handleClose = () => {
        // Reset form data to original supplier values
        if (supplier) {
            setFormData({
                name: supplier.name || '',
                address: supplier.address || '',
                tin: supplier.tin || '',
                phoneNumber: supplier.phoneNumber || '',
                email: supplier.email || ''
            });
        }

        // Clear errors
        clearErrors();

        onClose();
    };

    const handleInputChange = (field: keyof Omit<SupplierUpdateDTO, 'supplierId' | 'updaterUserId'>, value: string) => {
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

    const handleSubmit = async () => {
        if (!validateForm() || !supplier) {
            return;
        }
        setIsSubmitting(true);
        clearErrors();

        try {
            const dataToSubmit : SupplierUpdateDTO = {
                supplierId: supplier.supplierId,
                updaterUserId: 1, // TODO get this from auth context
                name: formData.name.trim(),
                address: formData.address.trim() || '',
                tin: formData.tin.trim(),
                phoneNumber: formData.phoneNumber.trim() || '',
                email: formData.email.trim() || '',
            }

            await onSubmit(dataToSubmit);
            handleClose(); // Close modal on success
        } catch (error) {
            await handleApiError(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormValid = formData.name.trim().length > 0 &&
        formData.tin.trim().length > 0 &&
        !isSubmitting;

    // Check if there are any changes from the original supplier data
    const hasChanges = supplier ? (

        // Always check required fields (firstname, lastname)
        formData.name !== (supplier.name || '') ||

        // For optional fields, only check if the current form value is not empty
        (formData.phoneNumber.trim() !== '' && formData.phoneNumber !== (supplier.phoneNumber || '')) ||
        (formData.address.trim() !== '' && formData.address !== (supplier.address || '')) ||
        (formData.email.trim() !== '' && formData.email !== (supplier.email || '')) ||
        (formData.tin.trim() !== '' && formData.tin !== (supplier.tin || ''))

    ) : false;

    return (
        <BaseFormModal
            isOpen={isOpen}
            onClose={handleClose}
            onSubmit={handleSubmit}
            title="Επεξεργασία Προμηθευτή"
            submitText="Ενημέρωση"
            isValid={isFormValid && hasChanges}
        >
            <div className="space-y-6">
                {/* General Error Display */}
                {generalError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-800">{generalError}</p>
                    </div>
                )}

                {/* Supplier Info Header */}
                {supplier && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-900">
                            Επεξεργασία στοιχείων για: {supplier.name}
                        </h4>
                        <p className="text-sm text-gray-500">ID: {supplier.supplierId}</p>
                    </div>
                )}

                {/* Name - Required */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Building2 className="w-4 h-4" />
                        Όνομα Προμηθευτή *
                    </label>
                    <Input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="π.χ. ΧΡΥΣΟΣ Α.Ε."
                        error={fieldErrors.name}
                        disabled={isSubmitting}
                        required
                    />
                </div>

                {/* Address */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <MapPin className="w-4 h-4" />
                        Διεύθυνση
                    </label>
                    <Input
                        type="text"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="π.χ. Ερμού 123, Αθήνα"
                        disabled={isSubmitting}
                        error={fieldErrors.address}
                    />
                </div>

                {/* TIN */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <CreditCard className="w-4 h-4" />
                        Α.Φ.Μ.
                    </label>
                    <Input
                        type="text"
                        value={formData.tin}
                        onChange={(e) => handleInputChange('tin', e.target.value)}
                        placeholder="π.χ. 123456789"
                        error={fieldErrors.tin}
                        disabled={isSubmitting}
                        maxLength={20}
                    />
                </div>

                {/* Phone Number */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Phone className="w-4 h-4" />
                        Τηλέφωνο
                    </label>
                    <Input
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                        placeholder="π.χ. 210-1234567"
                        error={fieldErrors.phoneNumber}
                        disabled={isSubmitting}
                        maxLength={20}
                    />
                </div>

                {/* Email */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Mail className="w-4 h-4" />
                        Email
                    </label>
                    <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="π.χ. info@chrysos.gr"
                        error={fieldErrors.email}
                        disabled={isSubmitting}
                        maxLength={100}
                    />
                </div>
            </div>
        </BaseFormModal>
    );
};

export default SupplierUpdateModal;