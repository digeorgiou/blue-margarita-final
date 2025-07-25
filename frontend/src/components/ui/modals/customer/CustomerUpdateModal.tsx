import React, { useState, useEffect } from 'react';
import { User, Phone, CreditCard } from 'lucide-react';
import { BaseFormModal, Input } from '../../index';
import { GenderType, GenderTypeLabels, CustomerListItemDTO } from '../../../../types/api/customerInterface';

interface CustomerUpdateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CustomerFormData) => Promise<void>;
    customer: CustomerListItemDTO;
}

interface CustomerFormData {
    firstname: string;
    lastname: string;
    gender: GenderType;
    phoneNumber: string;
    address: string;
    email: string;
    tin: string;
}

const CustomerUpdateModal: React.FC<CustomerUpdateModalProps> = ({
                                                                     isOpen,
                                                                     onClose,
                                                                     onSubmit,
                                                                     customer
                                                                 }) => {
    const [formData, setFormData] = useState<CustomerFormData>({
        firstname: '',
        lastname: '',
        gender: GenderType.OTHER,
        phoneNumber: '',
        address: '',
        email: '',
        tin: ''
    });
    const [errors, setErrors] = useState<Partial<CustomerFormData>>({});

    // Initialize form data when customer changes
    useEffect(() => {
        if (customer) {
            setFormData({
                firstname: customer.firstname || '',
                lastname: customer.lastname || '',
                gender: GenderType.OTHER, // Default since it's not in CustomerListItemDTO
                phoneNumber: customer.phoneNumber || '',
                address: customer.address || '',
                email: customer.email || '',
                tin: customer.tin || ''
            });
        }
    }, [customer]);

    const validateForm = (): boolean => {
        const newErrors: Partial<CustomerFormData> = {};

        if (!formData.firstname.trim()) {
            newErrors.firstname = 'Το όνομα είναι υποχρεωτικό';
        }

        if (!formData.lastname.trim()) {
            newErrors.lastname = 'Το επώνυμο είναι υποχρεωτικό';
        }

        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = 'Το τηλέφωνο είναι υποχρεωτικό';
        } else if (!/^\d{10}$/.test(formData.phoneNumber.replace(/[\s-]/g, ''))) {
            newErrors.phoneNumber = 'Το τηλέφωνο πρέπει να έχει 10 ψηφία';
        }

        if (!formData.address.trim()) {
            newErrors.address = 'Η διεύθυνση είναι υποχρεωτική';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Το email είναι υποχρεωτικό';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Μη έγκυρο email';
        }

        if (formData.tin && !/^\d{9}$/.test(formData.tin)) {
            newErrors.tin = 'Το ΑΦΜ πρέπει να έχει 9 ψηφία';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        await onSubmit(formData);
        handleClose();
    };

    const handleClose = () => {
        setErrors({});
        onClose();
    };

    const handleInputChange = (field: keyof CustomerFormData, value: string | GenderType) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const isValid = !!(
        formData.firstname.trim() &&
        formData.lastname.trim() &&
        formData.phoneNumber.trim() &&
        formData.address.trim() &&
        formData.email.trim() &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
        /^\d{10}$/.test(formData.phoneNumber.replace(/[\s-]/g, '')) &&
        (!formData.tin || /^\d{9}$/.test(formData.tin))
    );

    const hasChanges = customer ? (
        formData.firstname.trim() !== customer.firstname ||
        formData.lastname.trim() !== customer.lastname ||
        formData.phoneNumber.trim() !== customer.phoneNumber ||
        formData.address.trim() !== customer.address ||
        formData.email.trim() !== customer.email ||
        formData.tin.trim() !== (customer.tin || '')
    ) : true;

    return (
        <BaseFormModal
            isOpen={isOpen}
            onClose={handleClose}
            title="Επεξεργασία Πελάτη"
            onSubmit={handleSubmit}
            submitText="Ενημέρωση"
            cancelText="Ακύρωση"
            isValid={isValid && hasChanges}
        >
            <div className="space-y-6">
                {/* Customer Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Στοιχεία Πελάτη</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>ID:</strong> {customer?.customerId}</p>
                        <p><strong>Τρέχον Email:</strong> {customer?.email}</p>
                        <p><strong>Τρέχον Τηλέφωνο:</strong> {customer?.phoneNumber}</p>
                    </div>
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
                            error={errors.firstname}
                            placeholder="π.χ. Γιάννης"
                        />

                        <Input
                            label="Επώνυμο *"
                            value={formData.lastname}
                            onChange={(e) => handleInputChange('lastname', e.target.value)}
                            error={errors.lastname}
                            placeholder="π.χ. Παπαδόπουλος"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Φύλο
                        </label>
                        <select
                            value={formData.gender}
                            onChange={(e) => handleInputChange('gender', e.target.value as GenderType)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            {Object.values(GenderType).map(gender => (
                                <option key={gender} value={gender}>
                                    {GenderTypeLabels[gender]}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                        <Phone className="w-5 h-5 mr-2 text-green-600" />
                        Στοιχεία Επικοινωνίας
                    </h3>

                    <Input
                        label="Τηλέφωνο *"
                        value={formData.phoneNumber}
                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                        error={errors.phoneNumber}
                        placeholder="π.χ. 6901234567"
                    />

                    <Input
                        label="Email *"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        error={errors.email}
                        placeholder="π.χ. customer@example.com"
                    />

                    <Input
                        label="Διεύθυνση *"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        error={errors.address}
                        placeholder="π.χ. Πατησίων 123, Αθήνα"
                    />
                </div>

                {/* Business Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                        <CreditCard className="w-5 h-5 mr-2 text-purple-600" />
                        Επιχειρηματικά Στοιχεία
                    </h3>

                    <Input
                        label="ΑΦΜ (Προαιρετικό)"
                        value={formData.tin}
                        onChange={(e) => handleInputChange('tin', e.target.value)}
                        error={errors.tin}
                        placeholder="π.χ. 123456789"
                    />
                    <p className="text-sm text-gray-500">
                        Το ΑΦΜ είναι υποχρεωτικό για χονδρικούς πελάτες
                    </p>
                </div>

                {/* Change indicator */}
                {!hasChanges && isValid && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-800">
                            ℹ️ Δεν έχουν γίνει αλλαγές στα στοιχεία του πελάτη.
                        </p>
                    </div>
                )}
            </div>
        </BaseFormModal>
    );
};

export default CustomerUpdateModal;