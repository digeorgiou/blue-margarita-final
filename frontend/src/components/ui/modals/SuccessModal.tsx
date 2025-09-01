import React from 'react';
import { CheckCircle, X } from 'lucide-react';
import { Button } from '../index';

interface SuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    actionText?: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
                                                       isOpen,
                                                       onClose,
                                                       title,
                                                       message,
                                                       actionText = "Συνέχεια"
                                                   }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="mb-6">
                        <p className="text-gray-600">{message}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end">
                        <Button
                            type="button"
                            variant="primary"
                            onClick={onClose}
                        >
                            {actionText}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuccessModal;