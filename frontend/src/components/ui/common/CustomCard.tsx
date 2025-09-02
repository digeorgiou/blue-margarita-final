import React from 'react';
import {CustomCardProps} from "../../../types/components/common-types.ts";
import { heightClassesCustomCard } from "./config.tsx";

const CustomCard: React.FC<CustomCardProps> = ({
                                                         title,
                                                         icon,
                                                         children,
                                                         footer,
                                                         headerRight,
                                                         className = '',
                                                         contentClassName = '',
                                                         height
                                                     }) => {
    return (
        <div className={`bg-gradient-to-br from-purple-200 to-blue-200 border border-blue-100/30 rounded-xl p-6 ${height ? heightClassesCustomCard[height] : ''} flex flex-col ${className}`}>
            {/* Header */}
            {title && icon && (
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                    <div className="flex items-center">
                        <span className="text-2xl mr-3">{icon}</span>
                        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                    </div>
                    {headerRight && (
                        <div className="flex-shrink-0">
                            {headerRight}
                        </div>
                    )}
                </div>
            )}

            {/* Content - Scrollable */}
            <div className={`flex-1 overflow-y-auto ${contentClassName}`}>
                {children}
            </div>

            {/* Footer */}
            {footer && (
                <div className="border-t border-gray-200 pt-4 mt-4 flex-shrink-0">
                    {footer}
                </div>
            )}
        </div>
    );
};

export default CustomCard;