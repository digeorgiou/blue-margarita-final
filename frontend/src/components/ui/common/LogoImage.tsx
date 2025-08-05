import React from 'react';

interface LogoProps {
    src: string;
    alt?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

const LogoImage: React.FC<LogoProps> = ({
                                       src,
                                       alt = "Logo",
                                       size = 'md',
                                       className = ''
                                   }) => {
    const sizeClasses = {
        xs: 'h-6 w-auto',
        sm: 'h-8 w-auto',
        md: 'h-12 w-auto',
        lg: 'h-16 w-auto',
        xl: 'h-24 w-auto'
    };

    return (
        <img
            src={src}
            alt={alt}
            className={`${sizeClasses[size]} ${className}`}
        />
    );
};

export default LogoImage;