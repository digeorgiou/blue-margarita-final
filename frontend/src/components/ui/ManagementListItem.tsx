import React from 'react';
import { Edit, Trash2, Eye } from 'lucide-react';
import Button from "./Button.tsx";

interface ManagementListItemProps {
    children: React.ReactNode;
    onUpdate?: () => void;
    onDelete?: () => void;
    onViewDetails?: () => void;
    canUpdate?: boolean;
    canDelete?: boolean;
    canViewDetails?: boolean;
}

const ManagementListItem: React.FC<ManagementListItemProps> = ({
                                                                   children,
                                                                   onUpdate,
                                                                   onDelete,
                                                                   onViewDetails,
                                                                   canUpdate = true,
                                                                   canDelete = true,
                                                                   canViewDetails = true
                                                               }) => {
    return (
        <div className="flex items-center justify-between">
            <div className="flex-1">
                {children}
            </div>

            <div className="flex items-center space-x-2 ml-4">
                {canViewDetails && onViewDetails && (
                    <Button
                        onClick={onViewDetails}
                        variant="secondary"
                        size="sm"
                    >
                        <Eye className="w-4 h-4" />
                    </Button>
                )}

                {canUpdate && onUpdate && (
                    <Button
                        onClick={onUpdate}
                        variant="primary"
                        size="sm"
                    >
                        <Edit className="w-4 h-4" />
                    </Button>
                )}

                {canDelete && onDelete && (
                    <Button
                        onClick={onDelete}
                        variant="danger"
                        size="sm"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                )}
            </div>
        </div>
    );
};

export default ManagementListItem;