import React from "react";
import type { LoadingSpinnerProps } from "../../../types/components/common-types.ts";

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
                                                           size = 'lg',
                                                           message = 'Φόρτωση...'
                                                       }) => {
    // Size configurations
    const sizeConfig = {
        sm: {
            spinner: 'h-6 w-6',
            container: 'min-h-[200px]',
            text: 'text-sm'
        },
        md: {
            spinner: 'h-8 w-8',
            container: 'min-h-[300px]',
            text: 'text-base'
        },
        lg: {
            spinner: 'h-12 w-12',
            container: 'min-h-[400px]',
            text: 'text-lg'
        }
    };

    const config = sizeConfig[size];

    return (
        <div className={`flex flex-col items-center justify-center ${config.container}`}>
            <div className={`animate-spin rounded-full ${config.spinner} border-b-2 border-blue-600 mb-4`}></div>
            <p className={`text-gray-600 ${config.text}`}>{message}</p>
        </div>
    );
};

export default LoadingSpinner;