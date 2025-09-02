import React, { useState } from 'react';
import { User, Phone } from 'lucide-react';
import { BaseFormModal } from '..';
import { Input } from '../../common';
import { CustomerInsertDTO, GenderType, GenderTypeLabels } from '../../../../types/api/customerInterface';
import { useFormErrorHandler } from '../../../../hooks/useFormErrorHandler';
import { CustomerCreateModalProps } from "../../../../types/components/modal-types.ts";

const CustomerCreateModal: React.FC<CustomerCreateModalProps> = ({
                                                                     isOpen,
                                                                     onClose,
                                                                     onSubmit
                                                                 }) => {
    const [formData, setFormData] = useState<CustomerInsertDTO>({
        firstname: '',
        lastname: '',
        gender: GenderType.FEMALE,
        phoneNumber: '',
        address: '',
        email: '',
        tin: ''
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

    // Minimal client-side validation - let backend handle all the real validation
    const validateForm = (): boolean => {
        // Only check if required fields are present (basic UX check)
        if (!formData.firstname.trim()) {
            return false;
        }

        if (!formData.lastname.trim()) {
            return false;
        }

        return true;
    };

    const handleClose = () => {
        setFormData({
            firstname: '',
            lastname: '',
            gender: GenderType.FEMALE,
            phoneNumber: '',
            address: '',
            email: '',
            tin: ''
        });
        clearErrors();
        onClose();
    };

    const handleInputChange = (field: keyof CustomerInsertDTO, value: string | GenderType | number) => {
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
        if (!validateForm()) return;

        setIsSubmitting(true);
        clearErrors();

        try {
            // Send data to backend - let backend validation handle everything
            const dataToSubmit: CustomerInsertDTO = {
                firstname: formData.firstname.trim(),
                lastname: formData.lastname.trim(),
                gender: formData.gender,
                phoneNumber: formData.phoneNumber?.trim() || '',
                address: formData.address?.trim() || '',
                email: formData.email?.trim() || '',
                tin: formData.tin?.trim() || ''
            };

            await onSubmit(dataToSubmit);
            handleClose();
        } catch (error) {
            // Use the reusable error handler (hook handles type conversion)
            await handleApiError(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Let backend validation handle form validity - only check basic required fields
    const isFormValid = formData.firstname.trim().length > 0 &&
        formData.lastname.trim().length > 0 &&
        !isSubmitting;

    return (
        <BaseFormModal
            isOpen={isOpen}
            onClose={handleClose}
            title="Δημιουργία Νέου Πελάτη"
            onSubmit={handleSubmit}
            submitText={isSubmitting ? "Δημιουργία..." : "Δημιουργία Πελάτη"}
            cancelText="Ακύρωση"
            isValid={isFormValid}
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

                {/* Personal Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                        <User className="w-5 h-5 mr-2 text-blue-600" />
                        Προσωπικά Στοιχεία
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Όνομα *"
                            value={formData.firstname || ''}
                            onChange={(e) => handleInputChange('firstname', e.target.value)}
                            placeholder="π.χ. Γιάννης"
                            error={fieldErrors.firstname}
                            disabled={isSubmitting}
                        />

                        <Input
                            label="Επώνυμο *"
                            value={formData.lastname || ''}
                            onChange={(e) => handleInputChange('lastname', e.target.value)}
                            placeholder="π.χ. Παπαδόπουλος"
                            error={fieldErrors.lastname}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Φύλο
                        </label>
                        <select
                            value={formData.gender}
                            onChange={(e) => handleInputChange('gender', e.target.value as GenderType)}
                            disabled={isSubmitting}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                            {Object.values(GenderType).map(gender => (
                                <option key={gender} value={gender}>
                                    {GenderTypeLabels[gender]}
                                </option>
                            ))}
                        </select>
                        {fieldErrors.gender && (
                            <p className="mt-1 text-sm text-red-600">{fieldErrors.gender}</p>
                        )}
                    </div>

                    <Input
                        label="ΑΦΜ (Για πελάτες χονδρικής)"
                        value={formData.tin || ''}
                        onChange={(e) => handleInputChange('tin', e.target.value)}
                        placeholder="π.χ. 123456789"
                        error={fieldErrors.tin}
                        disabled={isSubmitting}
                    />

                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                        <Phone className="w-5 h-5 mr-2 text-green-600" />
                        Στοιχεία Επικοινωνίας
                    </h3>

                    <Input
                        label="Τηλέφωνο"
                        value={formData.phoneNumber || ''}
                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                        placeholder="π.χ. 6901234567"
                        error={fieldErrors.phoneNumber}
                        disabled={isSubmitting}
                    />

                    <Input
                        label="Email"
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="π.χ. customer@example.com"
                        error={fieldErrors.email}
                        disabled={isSubmitting}
                    />

                    <Input
                        label="Διεύθυνση"
                        value={formData.address || ''}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="π.χ. Πατησίων 123, Αθήνα"
                        error={fieldErrors.address}
                        disabled={isSubmitting}
                    />
                </div>
            </div>
        </BaseFormModal>
    );
};

export default CustomerCreateModal;