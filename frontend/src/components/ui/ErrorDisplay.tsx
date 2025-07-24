import React from 'react';
import { Button } from './';

interface ErrorDisplayProps {
    error: string;
    onRetry: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry }) => (
    <div className="min-h-screen p-4">
        <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <div className="text-6xl mb-4">😵</div>
                <h2 className="text-2xl font-bold text-red-600 mb-4">Oops! Κάτι πήγε λάθος!</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <Button onClick={onRetry} variant="primary">
                    Προσπαθήστε ξανά
                </Button>
            </div>
        </div>
    </div>
);

export default ErrorDisplay;