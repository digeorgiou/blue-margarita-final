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

    // Use the reusable error handler hook
    const {
        fieldErrors,
        generalError,
        handleApiError,
        clearErrors,
        clearFieldError
    } = useFormErrorHandler({
        businessErrorToFieldMap: {
            'SUPPLIER_TIN_EXISTS': 'tin',
            'SUPPLIER_EMAIL_EXISTS': 'email',
            'SUPPLIER_PHONE_EXISTS': 'phoneNumber'
        }
    });

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

        clearErrors();

        try {
            const updateData: SupplierUpdateDTO = {
                supplierId: supplier.supplierId,
                updaterUserId: 1, // Replace with actual current user ID
                ...formData
            };

            await onSubmit(updateData);
            handleClose(); // Close modal on success
        } catch (error) {
            // The hook will handle displaying the error
            await handleApiError(error);
        }
    };

    return (
        <BaseFormModal
            isOpen={isOpen}
            onClose={handleClose}
            onSubmit={handleSubmit}
            title="Επεξεργασία Προμηθευτή"
            submitText="Ενημέρωση"
            isValid={validateForm()}
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
                        maxLength={100}
                    />
                </div>
            </div>
        </BaseFormModal>
    );
};

export default SupplierUpdateModal;