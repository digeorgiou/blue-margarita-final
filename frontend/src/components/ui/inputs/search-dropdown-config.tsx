import { Settings, User, Truck } from 'lucide-react';
import type { EntityConfig, ColorClasses, EntityType, ColorVariant } from '../../../types/components/input-types.ts';
import { GiDiamondRing } from "react-icons/gi";
import { IoHammerOutline } from 'react-icons/io5';

export const entityConfig: Record<EntityType, EntityConfig> = {
    material: {
        color: 'blue',
        defaultIcon: <IoHammerOutline className="w-5 h-5 text-blue-500" />,
        emptyIcon: <IoHammerOutline className="w-6 h-6 text-gray-400" />
    },
    procedure: {
        color: 'purple',
        defaultIcon: <Settings className="w-5 h-5 text-purple-500" />,
        emptyIcon: <Settings className="w-6 h-6 text-gray-400" />
    },
    product: {
        color: 'green',
        defaultIcon: <GiDiamondRing className="w-5 h-5 text-green-500" />,
        emptyIcon: <GiDiamondRing className="w-6 h-6 text-gray-400" />
    },
    customer: {
        color: 'indigo',
        defaultIcon: <User className="w-5 h-5 text-indigo-500" />,
        emptyIcon: <User className="w-6 h-6 text-gray-400" />
    },
    supplier: {
        color: 'orange',
        defaultIcon: <Truck className="w-5 h-5 text-orange-500" />,
        emptyIcon: <Truck className="w-6 h-6 text-gray-400" />
    }
};

export const colorClasses: Record<ColorVariant, ColorClasses> = {
    blue: {
        border: 'border-blue-500',
        ring: 'ring-blue-100',
        bg: 'bg-blue-50',
        highlight: 'bg-blue-50 border-blue-500',
        text: 'text-blue-700',
        dot: 'bg-blue-500'
    },
    purple: {
        border: 'border-purple-500',
        ring: 'ring-purple-100',
        bg: 'bg-purple-50',
        highlight: 'bg-purple-50 border-purple-500',
        text: 'text-purple-700',
        dot: 'bg-purple-500'
    },
    green: {
        border: 'border-green-500',
        ring: 'ring-green-100',
        bg: 'bg-green-50',
        highlight: 'bg-green-50 border-green-500',
        text: 'text-green-700',
        dot: 'bg-green-500'
    },
    indigo: {
        border: 'border-indigo-500',
        ring: 'ring-indigo-100',
        bg: 'bg-indigo-50',
        highlight: 'bg-indigo-50 border-indigo-500',
        text: 'text-indigo-700',
        dot: 'bg-indigo-500'
    },
    orange: {
        border: 'border-orange-500',
        ring: 'ring-orange-100',
        bg: 'bg-orange-50',
        highlight: 'bg-orange-50 border-orange-500',
        text: 'text-orange-700',
        dot: 'bg-orange-500'
    }
};