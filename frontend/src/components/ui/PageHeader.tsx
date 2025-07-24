import React from 'react';
import { Button } from './';

interface PageHeaderProps {
    title: string;
    subtitle: string;
    icon: string;
    onBack: () => void;
    rightContent?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
                                                          title,
                                                          subtitle,
                                                          icon,
                                                          onBack,
                                                          rightContent
                                                      }) => (
    <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">{icon} {title}</h1>
            <p className="text-gray-700 mt-1">{subtitle}</p>
        </div>
        <div className="flex gap-2">
            {rightContent}
            <Button onClick={onBack} variant="secondary">
                ← Επιστροφή στην αρχική
            </Button>
        </div>
    </div>
);

export default PageHeader;