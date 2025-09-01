import React from 'react';
import {DashboardCardProps} from "../../../types/components/dashboardCard.ts";

const FlexibleHeightCard: React.FC<DashboardCardProps> = ({
                                                              title,
                                                              icon,
                                                              children,
                                                              footer,
                                                              headerRight,
                                                              className = '',
                                                              contentClassName = ''
                                                          }) => {
    return (
        <div className={`bg-gradient-to-br from-purple-200 to-blue-200 border border-blue-100/30 rounded-xl p-6 flex flex-col min-h-0 ${className}`}>
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

            {/* Content - No fixed height or forced scrolling */}
            <div className={`flex-1 min-h-0 ${contentClassName}`}>
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

export default FlexibleHeightCard;