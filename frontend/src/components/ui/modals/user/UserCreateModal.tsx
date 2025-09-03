import React, { useState } from 'react';
import { BaseFormModal } from '..';
import { Button, Alert } from '../../common';
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
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmedPassword: '',
        role: 'USER' as 'USER' | 'ADMIN'
    });

    const [submitting, setSubmitting] = useState(false);
    const { fieldErrors, generalError, handleApiError, clearErrors } = useFormErrorHandler();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmedPassword) {
            return; // Form validation will handle this
        }

        try {
            setSubmitting(true);
            clearErrors();

            await onSubmit(formData);

            // Reset form and close modal
            setFormData({
                username: '',
                password: '',
                confirmedPassword: '',
                role: 'USER'
            });
            onClose();
        } catch (error) {
            await handleApiError(error);
        } finally {
            setSubmitting(false);
        }
    };

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

    const passwordsMatch = formData.password === formData.confirmedPassword || !formData.confirmedPassword;

    const roleOptions = [
        { value: 'USER', label: 'Χρήστης' },
        { value: 'ADMIN', label: 'Διαχειριστής' }
    ];

    return (
        <BaseFormModal isOpen={isOpen} onClose={handleClose} title="Δημιουργία Νέου Χρήστη">
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

                <div className="flex justify-end space-x-3 pt-4">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleClose}
                        disabled={submitting}
                    >
                        Ακύρωση
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={submitting || !passwordsMatch || !formData.username || !formData.password}
                    >
                        {submitting ? 'Δημιουργία...' : 'Δημιουργία'}
                    </Button>
                </div>
            </form>
        </BaseFormModal>
    );
};

export default UserCreateModal;