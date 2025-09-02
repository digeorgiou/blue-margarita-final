// Alert

export const variantClassesAlert = {
    success: {
        container: "bg-green-50 border-green-200 text-green-800",
        icon: "✅",
        iconColor: "text-green-500"
    },
    error: {
        container: "bg-red-50 border-red-200 text-red-800",
        icon: "❌",
        iconColor: "text-red-500"
    },
    warning: {
        container: "bg-yellow-50 border-yellow-200 text-yellow-800",
        icon: "⚠️",
        iconColor: "text-yellow-500"
    },
    info: {
        container: "bg-blue-50 border-blue-200 text-blue-800",
        icon: "ℹ️",
        iconColor: "text-blue-500"
    }
};

// Button

export const baseClassesButton = "relative font-semibold rounded-xl transition-all duration-300 ease-out " +
    "focus:outline-none focus:ring-4 focus:ring-offset-2 " +
    "transform active:scale-95 disabled:transform-none " +
    "overflow-hidden group";

export const variantClassesButton = {
    // Primary Blues
    primary: "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 " +
        "text-white shadow-lg hover:shadow-xl focus:ring-blue-300 " +
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent " +
        "before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700",

    // Secondary Grays
    secondary: "bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 " +
        "text-white shadow-lg hover:shadow-xl focus:ring-gray-300 " +
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent " +
        "before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700",

    // Create Button
    create: "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 " +
        "text-white shadow-lg hover:shadow-xl focus:ring-purple-300 " +
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent " +
        "before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700",

    // Success Greens
    success: "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 " +
        "text-white shadow-lg hover:shadow-xl focus:ring-green-300 " +
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent " +
        "before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700",

    // Danger Reds
    danger: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 " +
        "text-white shadow-lg hover:shadow-xl focus:ring-red-300 " +
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent " +
        "before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700",

    // Warning Yellows/Oranges
    warning: "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 " +
        "text-white shadow-lg hover:shadow-xl focus:ring-amber-300 " +
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent " +
        "before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700",

    // Info Cyans
    info: "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 " +
        "text-white shadow-lg hover:shadow-xl focus:ring-cyan-300 " +
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent " +
        "before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700",

    // Purple/Violet
    purple: "bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 " +
        "text-white shadow-lg hover:shadow-xl focus:ring-purple-300 " +
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent " +
        "before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700",

    // Pink/Rose
    pink: "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 " +
        "text-white shadow-lg hover:shadow-xl focus:ring-pink-300 " +
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent " +
        "before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700",

    // Indigo
    indigo: "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 " +
        "text-white shadow-lg hover:shadow-xl focus:ring-indigo-300 " +
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent " +
        "before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700",

    // Teal
    teal: "bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 " +
        "text-white shadow-lg hover:shadow-xl focus:ring-teal-300 " +
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent " +
        "before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700",

    // Yellow (with dark text for contrast)
    yellow: "bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-500 hover:to-amber-500 " +
        "text-gray-900 shadow-lg hover:shadow-xl focus:ring-yellow-300 " +
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/30 before:to-transparent " +
        "before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700",

    // Orange
    orange: "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 " +
        "text-white shadow-lg hover:shadow-xl focus:ring-orange-300 " +
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent " +
        "before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700",

    // Outline variants
    'outline-primary': "border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white " +
        "bg-transparent shadow-md hover:shadow-lg focus:ring-blue-300 " +
        "transition-colors duration-300",

    'outline-secondary': "border-2 border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white " +
        "bg-transparent shadow-md hover:shadow-lg focus:ring-gray-300 " +
        "transition-colors duration-300",

    // Ghost variants
    'ghost-primary': "text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 " +
        "bg-transparent focus:ring-blue-300 transition-all duration-300",

    'ghost-secondary': "text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200 " +
        "bg-transparent focus:ring-gray-300 transition-all duration-300",
};

export const sizeClassesButton = {
    xs: "px-2 py-1 text-xs",
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
    xl: "px-8 py-4 text-lg"
};

//Custom Card

export const heightClassesCustomCard = {
    sm: 'h-64',   // 256px
    md: 'h-82',   // 320px
    lg: 'h-96',   // 384px
    xl: 'h-[28rem]' // 448px
};
