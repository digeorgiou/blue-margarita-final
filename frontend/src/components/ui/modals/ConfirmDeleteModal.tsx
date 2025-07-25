import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button, LoadingSpinner } from '../index';

interface ConfirmDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    entityName: string;
    entityDisplayName: string;
    warningMessage?: string;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
                                                                   isOpen,
                                                                   onClose,
                                                                   onConfirm,
                                                                   entityName,
                                                                   entityDisplayName,
                                                                   warningMessage
                                                               }) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleConfirm = async () => {
        setIsDeleting(true);
        try {
            await onConfirm();
        } catch (error) {
            console.error('Delete error:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                Διαγραφή {entityName}
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            disabled={isDeleting}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="mb-6">
                        <p className="text-gray-600 mb-3">
                            Είστε σίγουροι ότι θέλετε να διαγράψετε {entityName.toLowerCase()} "{entityDisplayName}";
                        </p>
                        {warningMessage && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                <p className="text-sm text-yellow-800">{warningMessage}</p>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                            disabled={isDeleting}
                        >
                            Ακύρωση
                        </Button>
                        <Button
                            type="button"
                            variant="danger"
                            onClick={handleConfirm}
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <>
                                    <LoadingSpinner />
                                    Διαγραφή...
                                </>
                            ) : (
                                'Διαγραφή'
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDeleteModal;