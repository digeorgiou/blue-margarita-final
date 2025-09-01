import React, { useState } from 'react';
import { Building2, Phone, CreditCard, Mail, MapPin } from 'lucide-react';
import { BaseFormModal, Input } from '../../index';
import { SupplierInsertDTO } from '../../../../types/api/supplierInterface';
import { useFormErrorHandler } from '../../../../hooks/useFormErrorHandler';

interface SupplierCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: SupplierInsertDTO) => Promise<void>;
    currentUserId: number;
}

const SupplierCreateModal: React.FC<SupplierCreateModalProps> = ({
                                                                     isOpen,
                                                                     onClose,
                                                                     onSubmit,
                                                                     currentUserId
                                                                 }) => {
    const [formData, setFormData] = useState<SupplierInsertDTO>({
        name: '',
        address: '',
        tin: '',
        phoneNumber: '',
        email: '',
        creatorUserId: currentUserId
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        fieldErrors,
        generalError,
        handleApiError,
        clearErrors,
        clearFieldError
    } = useFormErrorHandler();

    // Minimal client-side validation - let backend handle all the real validation
    const validateForm = (): boolean => {
        // Only check if required fields are present (basic UX check)
        if (!formData.name.trim()) {
            return false;
        }
        return true;
    };

    const handleClose = () => {
        setFormData({
            name: '',
            address: '',
            tin: '',
            phoneNumber: '',
            email: '',
            creatorUserId: currentUserId
        });
        clearErrors();
        onClose();
    };

    const handleInputChange = (field: keyof SupplierInsertDTO, value: string | number) => {
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
        if (!validateForm()) {
            return;
        }
        setIsSubmitting(true);
        clearErrors();
        try {
            const dataToSubmit: SupplierInsertDTO = {
                name: formData.name.trim(),
                address: formData.address.trim() || '',
                tin: formData.tin.trim(),
                phoneNumber: formData.phoneNumber.trim(),
                email: formData.email.trim(),
                creatorUserId: currentUserId
            };

            await onSubmit(dataToSubmit);
            handleClose();
        }
        catch (error) {
            // The hook will handle displaying the error
            await handleApiError(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormValid = formData.name.trim().length > 0 &&
        formData.tin.trim().length > 0 &&
        !isSubmitting;

    return (
        <BaseFormModal
            isOpen={isOpen}
            onClose={handleClose}
            onSubmit={handleSubmit}
            title="Δημιουργία Νέου Προμηθευτή"
            submitText={isSubmitting ? "Δημιουργία..." : "Δημιουργία Προμηθευτή"}
            isValid={isFormValid}
        >
            <div className="space-y-6">
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
                        error={fieldErrors.address}
                        disabled={isSubmitting}
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

export default SupplierCreateModal;