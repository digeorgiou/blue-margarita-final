import React from 'react';
import { Edit, Trash2, Eye } from 'lucide-react';
import Button from "./Button";

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
        <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
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
                            title="Προβολή λεπτομερειών"
                        >
                            <Eye className="w-4 h-4" />
                        </Button>
                    )}

                    {canUpdate && onUpdate && (
                        <Button
                            onClick={onUpdate}
                            variant="secondary"
                            size="sm"
                            title="Επεξεργασία"
                        >
                            <Edit className="w-4 h-4" />
                        </Button>
                    )}

                    {canDelete && onDelete && (
                        <Button
                            onClick={onDelete}
                            variant="danger"
                            size="sm"
                            title="Διαγραφή"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManagementListItem;