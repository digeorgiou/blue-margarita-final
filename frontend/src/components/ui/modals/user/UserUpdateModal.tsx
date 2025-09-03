import React, { useState, useEffect } from 'react';
import { BaseFormModal } from '..';
import { Button, Alert } from '../../common';
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
    const { fieldErrors, generalError, handleApiError, clearErrors } = useFormErrorHandler();

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) return;

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

            onClose();
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
        clearErrors();
        onClose();
    };

    const passwordsMatch = !formData.password || formData.password === formData.confirmedPassword;

    const roleOptions = [
        { value: 'USER', label: 'Χρήστης' },
        { value: 'ADMIN', label: 'Διαχειριστής' }
    ];

    if (!user) return null;

    return (
        <BaseFormModal isOpen={isOpen} onClose={handleClose} title="Επεξεργασία Χρήστη">
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
                        disabled={submitting || !passwordsMatch || !formData.username}
                    >
                        {submitting ? 'Ενημέρωση...' : 'Ενημέρωση'}
                    </Button>
                </div>
            </form>
        </BaseFormModal>
    );
};

export default UserUpdateModal;