import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button, LoadingSpinner } from '../index';

interface BaseFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    onSubmit: () => Promise<void>;
    children: React.ReactNode;
    submitText?: string;
    cancelText?: string;
    isValid?: boolean;
}

const BaseFormModal: React.FC<BaseFormModalProps> = ({
                                                         isOpen,
                                                         onClose,
                                                         title,
                                                         onSubmit,
                                                         children,
                                                         submitText = "Αποθήκευση",
                                                         cancelText = "Ακύρωση",
                                                         isValid = true
                                                     }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await onSubmit();
        } catch (error) {
            console.error('Form submission error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                        <button
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {children}

                        {/* Actions */}
                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={onClose}
                                disabled={isSubmitting}
                            >
                                {cancelText}
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={!isValid || isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <LoadingSpinner />
                                        Αποθήκευση...
                                    </>
                                ) : (
                                    submitText
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BaseFormModal;