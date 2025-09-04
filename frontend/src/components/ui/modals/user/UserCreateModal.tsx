import React, { useState } from 'react';
import { BaseFormModal } from '..';
import { CustomTextInput, CustomSelect } from '../../inputs';
import { useFormErrorHandler } from '../../../../hooks/useFormErrorHandler';
import { User, Lock, Shield } from 'lucide-react';
import type { UserInsertDTO } from '../../../../types/api/userInterface';

interface UserCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: UserInsertDTO) => Promise<void>;
}

const UserCreateModal: React.FC<UserCreateModalProps> = ({
                                                             isOpen,
                                                             onClose,
                                                             onSubmit
                                                         }) => {
    const [formData, setFormData] = useState<UserInsertDTO>({
        username: '',
        password: '',
        confirmedPassword: '',
        role: 'USER' as 'USER' | 'ADMIN'
    });

    const [submitting, setSubmitting] = useState(false);
    const {
        fieldErrors,
        generalError,
        handleApiError,
        clearErrors,
    } = useFormErrorHandler();

    const handleClose = () => {
        setFormData({
            username: '',
            password: '',
            confirmedPassword: '',
            role: 'USER'
        });
        clearErrors();
        onClose();
    };
    //
    // const handleInputChange = (field: keyof UserInsertDTO, value: string | number) => {
    //     setFormData(prev => ({ ...prev, [field]: value }));
    //
    //     // Clear field error when user starts typing
    //     if (fieldErrors[field]) {
    //         clearFieldError(field);
    //     }
    //
    //     // Clear general error when user makes changes
    //     if (generalError) {
    //         clearErrors();
    //     }
    // };

    const validateForm = (): boolean => {
        if (!formData.username.trim()) {
            return false;
        }
        if (!formData.password.trim()) {
            return false;
        }
        if (!formData.confirmedPassword.trim()) {
            return false;
        }
        if (formData.password !== formData.confirmedPassword) {
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setSubmitting(true);
        clearErrors();

        try {
            const dataToSubmit: UserInsertDTO = {
                username: formData.username.trim(),
                password: formData.password.trim(),
                confirmedPassword: formData.confirmedPassword.trim(),
                role: formData.role
            };

            await onSubmit(dataToSubmit);
            handleClose(); // Close modal on success
        } catch (error) {
            // The hook will handle displaying the error
            await handleApiError(error);
        } finally {
            setSubmitting(false);
        }
    };



    const passwordsMatch = formData.password === formData.confirmedPassword || !formData.confirmedPassword;

    const roleOptions = [
        { value: 'USER', label: 'Χρήστης' },
        { value: 'ADMIN', label: 'Διαχειριστής' }
    ];

    const isFormValid = formData.username.trim().length > 0 &&
        formData.password.trim().length > 0 &&
        formData.confirmedPassword.trim().length > 0

    return (
        <BaseFormModal
            isOpen={isOpen}
            onClose={handleClose}
            onSubmit={handleSubmit}
            title="Δημιουργία Νέου Χρήστη"
            submitText="Δημιουργία"
            isValid={isFormValid}
        >
            <div className="space-y-4">
                {generalError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-800">
                            {generalError}
                        </p>
                    </div>
                )}

                <CustomTextInput
                    label="Username"
                    value={formData.username}
                    onChange={(value) => setFormData({...formData, username: value})}
                    placeholder="Εισάγετε username..."
                    error={fieldErrors.username}
                    icon={<User className="w-4 h-4" />}
                    required
                    disabled={submitting}
                />

                <CustomTextInput
                    label="Κωδικός"
                    type="password"
                    value={formData.password}
                    onChange={(value) => setFormData({...formData, password: value})}
                    placeholder="Εισάγετε κωδικό..."
                    error={fieldErrors.password}
                    icon={<Lock className="w-4 h-4" />}
                    required
                    disabled={submitting}
                />

                <CustomTextInput
                    label="Επιβεβαίωση Κωδικού"
                    type="password"
                    value={formData.confirmedPassword}
                    onChange={(value) => setFormData({...formData, confirmedPassword: value})}
                    placeholder="Επιβεβαιώστε τον κωδικό..."
                    error={!passwordsMatch ? 'Οι κωδικοί δεν ταιριάζουν' : fieldErrors.confirmedPassword}
                    icon={<Lock className="w-4 h-4" />}
                    required
                    disabled={submitting}
                />

                <CustomSelect
                    label="Ρόλος"
                    value={formData.role}
                    onChange={(value) => setFormData({...formData, role: value as 'USER' | 'ADMIN'})}
                    options={roleOptions}
                    error={fieldErrors.role}
                    icon={<Shield className="w-4 h-4" />}
                    disabled={submitting}
                />
            </div>
        </BaseFormModal>
    );
};

export default UserCreateModal;