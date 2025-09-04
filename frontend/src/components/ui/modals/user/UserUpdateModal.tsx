import React, { useState, useEffect } from 'react';
import { BaseFormModal } from '..';
import { Alert } from '../../common';
import { CustomTextInput, CustomSelect } from '../../inputs';
import { useFormErrorHandler } from '../../../../hooks/useFormErrorHandler';
import { User, Lock, Shield } from 'lucide-react';
import type { UserReadOnlyDTO, UserUpdateDTO } from '../../../../types/api/userInterface';

interface UserUpdateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: UserUpdateDTO) => Promise<void>;
    user: UserReadOnlyDTO | null;
}

const UserUpdateModal: React.FC<UserUpdateModalProps> = ({
                                                             isOpen,
                                                             onClose,
                                                             onSubmit,
                                                             user
                                                         }) => {
    const [formData, setFormData] = useState({
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
        clearErrors
    } = useFormErrorHandler();

    // Populate form when user changes
    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username,
                password: '',
                confirmedPassword: '',
                role: user.role
            });
        }
    }, [user]);

    const validateForm = (): boolean => {
        return formData.username.trim().length > 0
    };

    const handleSubmit = async () => {
        if (!validateForm() || !user) {
            return;
        }

        if (formData.password && formData.password !== formData.confirmedPassword) {
            return; // Form validation will handle this
        }

        try {
            setSubmitting(true);
            clearErrors();

            await onSubmit({
                userId: user.id,
                ...formData
            });
            handleClose()
        } catch (error) {
            await handleApiError(error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        if (user) {
            setFormData({
                username: user.username,
                password: '',
                confirmedPassword: '',
                role: user.role
            });
        }
        setSubmitting(false);
        clearErrors();
        onClose();
    };

    const passwordsMatch = !formData.password || formData.password === formData.confirmedPassword;

    const roleOptions = [
        { value: 'USER', label: 'Χρήστης' },
        { value: 'ADMIN', label: 'Διαχειριστής' }
    ];

    const isFormValid = formData.username.trim().length > 0 &&
        formData.role.trim().length > 0 &&
        passwordsMatch;

    if (!user) return null;

    return (
        <BaseFormModal
            isOpen={isOpen}
            onClose={handleClose}
            onSubmit={handleSubmit}
            title="Επεξεργασία Χρήστη"
            submitText="Ενημέρωση"
            isValid={isFormValid}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {generalError && (
                    <Alert variant="error">
                        {generalError}
                    </Alert>
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
                    label="Νέος Κωδικός (προαιρετικό)"
                    type="password"
                    value={formData.password}
                    onChange={(value) => setFormData({...formData, password: value})}
                    placeholder="Αφήστε κενό για να μην αλλάξει..."
                    error={fieldErrors.password}
                    icon={<Lock className="w-4 h-4" />}
                    disabled={submitting}
                />

                <CustomTextInput
                    label="Επιβεβαίωση Νέου Κωδικού"
                    type="password"
                    value={formData.confirmedPassword}
                    onChange={(value) => setFormData({...formData, confirmedPassword: value})}
                    placeholder="Επιβεβαιώστε τον νέο κωδικό..."
                    error={!passwordsMatch ? 'Οι κωδικοί δεν ταιριάζουν' : fieldErrors.confirmedPassword}
                    icon={<Lock className="w-4 h-4" />}
                    disabled={submitting || !formData.password}
                />

                <CustomSelect
                    label="Ρόλος"
                    value={formData.role}
                    onChange={(value) => setFormData({...formData, role: value as 'USER' | 'ADMIN'})}
                    options={roleOptions}
                    icon={<Shield className="w-4 h-4" />}
                    disabled={submitting}
                />
            </form>
        </BaseFormModal>
    );
};

export default UserUpdateModal;