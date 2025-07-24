import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    children: React.ReactNode;
    onClose: () => void;
}

export const Modal: React.FC<ModalProps> = ({ children, onClose }) => {
    return (
        <div className="fixed z-50 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" onClick={onClose}>
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                    <div className="absolute top-0 right-0 pt-4 pr-4">
                        <button
                            onClick={onClose}
                            className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
};