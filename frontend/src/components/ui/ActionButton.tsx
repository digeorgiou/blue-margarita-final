import React from 'react';
import {ActionButtonProps} from "../../types/components/button.ts";

const ActionButton: React.FC<ActionButtonProps> = ({
                                                       title,
                                                       description,
                                                       icon,
                                                       color,
                                                       onClick
                                                   }) => {
    const colorClasses = {
        green: 'from-green-400 to-green-600 hover:from-green-500 hover:to-green-700',
        blue: 'from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700',
        purple: 'from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700',
        orange: 'from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700'
    };

    return (
        <button
            onClick={onClick}
            className={`
                group relative p-6 rounded-xl bg-gradient-to-br ${colorClasses[color]}
                text-white shadow-lg hover:shadow-xl transition-all duration-300
                transform hover:-translate-y-1 active:translate-y-0
                overflow-hidden
            `}
        >
            {/* Background decoration */}
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Content */}
            <div className="relative z-10 text-left">
                <div className="flex items-center justify-between mb-2">
                    <div className="text-3xl">{icon}</div>
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <span className="text-sm">→</span>
                    </div>
                </div>

                <h3 className="text-lg font-bold mb-1">{title}</h3>
                <p className="text-white/80 text-sm">{description}</p>
            </div>

            {/* Hover effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        </button>
    );
};

export default ActionButton;