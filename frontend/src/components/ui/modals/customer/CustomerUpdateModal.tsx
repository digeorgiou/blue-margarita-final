import React, { useState, useEffect } from 'react';
import { User, Phone } from 'lucide-react';
import { BaseFormModal, Input } from '../../index';
import { GenderType, GenderTypeLabels, CustomerListItemDTO, CustomerUpdateDTO } from '../../../../types/api/customerInterface';
import { useFormErrorHandler } from '../../../../hooks/useFormErrorHandler';

interface CustomerUpdateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CustomerUpdateDTO) => Promise<void>;
    customer: CustomerListItemDTO | null;
}

const CustomerUpdateModal: React.FC<CustomerUpdateModalProps> = ({
                                                                     isOpen,
                                                                     onClose,
                                                                     onSubmit,
                                                                     customer
                                                                 }) => {
    const [formData, setFormData] = useState<Omit<CustomerUpdateDTO, 'customerId' | 'updaterUserId'>>({
        firstname: '',
        lastname: '',
        gender: customer?.gender,
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

    // Initialize form data when customer changes
    useEffect(() => {
        if (customer) {
            setFormData({
                firstname: customer.firstname || '',
                lastname: customer.lastname || '',
                gender: customer.gender, // Default since gender is not in CustomerListItemDTO
                phoneNumber: customer.phoneNumber || '',
                address: customer.address || '',
                email: customer.email || '',
                tin: customer.tin || ''
            });
        }
    }, [customer]);

    const validateForm = (): boolean => {
        return formData.firstname.trim().length > 0 && formData.lastname.trim().length > 0;
    };

    const handleClose = () => {
        // Reset form data to original customer values
        if (customer) {
            setFormData({
                firstname: customer.firstname || '',
                lastname: customer.lastname || '',
                gender: customer.gender,
                phoneNumber: customer.phoneNumber || '',
                address: customer.address || '',
                email: customer.email || '',
                tin: customer.tin || ''
            });
        }

        // Reset submission state
        setIsSubmitting(false);

        // Clear errors
        clearErrors();

        onClose();
    };

    const handleInputChange = (field: keyof Omit<CustomerUpdateDTO, 'customerId' | 'updaterUserId'>, value: string | GenderType) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        if (fieldErrors[field]) {
            clearFieldError(field);
        }

        if (generalError) {
            clearErrors();
        }
    };

    const handleSubmit = async () => {
        if (!validateForm() || !customer) return;

        setIsSubmitting(true);
        clearErrors();

        try {
            const dataToSubmit: CustomerUpdateDTO = {
                customerId: customer.customerId,
                updaterUserId: 1, // TODO get this from auth context
                firstname: formData.firstname.trim(),
                lastname: formData.lastname.trim(),
                gender: formData.gender,
                phoneNumber: formData.phoneNumber.trim(),
                address: formData.address.trim(),
                email: formData.email.trim(),
                tin: formData.tin.trim()
            };

            await onSubmit(dataToSubmit);
            handleClose();
        } catch (error) {
            await handleApiError(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormValid = formData.firstname.trim().length > 0 &&
        formData.lastname.trim().length > 0 &&
        !isSubmitting;

    // Check if there are any changes from the original customer data
    const hasChanges = customer ? (

        // Always check required fields (firstname, lastname)
        formData.firstname !== (customer.firstname || '') ||
        formData.lastname !== (customer.lastname || '') ||


        // For optional fields, only check if the current form value is not empty
        (formData.phoneNumber.trim() !== '' && formData.phoneNumber !== (customer.phoneNumber || '')) ||
        (formData.address.trim() !== '' && formData.address !== (customer.address || '')) ||
        (formData.email.trim() !== '' && formData.email !== (customer.email || '')) ||
        (formData.tin.trim() !== '' && formData.tin !== (customer.tin || '')) ||
        (formData.gender !== customer.gender)

    ) : false;

    if (!customer) return null;

    return (
        <BaseFormModal
            isOpen={isOpen}
            onClose={handleClose}
            title="Επεξεργασία Πελάτη"
            onSubmit={handleSubmit}
            submitText={isSubmitting ? "Ενημέρωση..." : "Ενημέρωση Πελάτη"}
            cancelText="Ακύρωση"
            isValid={isFormValid && hasChanges}
        >
            <div className="space-y-6">
                {/* General Error Display */}
                {generalError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-800">{generalError}</p>
                    </div>
                )}

                {/* Customer Info Header */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900">
                        Επεξεργασία στοιχείων για: {customer.firstname} {customer.lastname}
                    </h4>
                    <p className="text-sm text-gray-500">ID: {customer.customerId}</p>
                </div>

                {/* Personal Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                        <User className="w-5 h-5 mr-2 text-blue-600" />
                        Προσωπικά Στοιχεία
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Όνομα *"
                            value={formData.firstname}
                            onChange={(e) => handleInputChange('firstname', e.target.value)}
                            placeholder="π.χ. Γιάννης"
                            error={fieldErrors.firstname}
                            disabled={isSubmitting}
                        />

                        <Input
                            label="Επώνυμο *"
                            value={formData.lastname}
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
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            disabled={isSubmitting}
                        >
                            {Object.entries(GenderTypeLabels).map(([key, label]) => (
                                <option key={key} value={key}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <Input
                        label="ΑΦΜ"
                        value={formData.tin}
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
                        value={formData.phoneNumber}
                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                        placeholder="π.χ. 6901234567"
                        error={fieldErrors.phoneNumber}
                        disabled={isSubmitting}
                    />

                    <Input
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="π.χ. customer@example.com"
                        error={fieldErrors.email}
                        disabled={isSubmitting}
                    />

                    <Input
                        label="Διεύθυνση"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="π.χ. Πατησίων 123, Αθήνα"
                        error={fieldErrors.address}
                        disabled={isSubmitting}
                    />
                </div>

                {/* Change Status */}
                {!hasChanges && isFormValid && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-800">
                            ℹ️ Δεν έχουν γίνει αλλαγές στα στοιχεία του πελάτη.
                        </p>
                    </div>
                )}

                {hasChanges && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800">
                            ✏️ Έχουν γίνει αλλαγές που θα αποθηκευτούν.
                        </p>
                    </div>
                )}
            </div>
        </BaseFormModal>
    );
};

export default CustomerUpdateModal;