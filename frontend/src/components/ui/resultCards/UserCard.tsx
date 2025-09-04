import React from 'react';
import { Button } from '../common';
import { Eye, Edit, Trash2, Shield, User } from 'lucide-react';
import type { UserReadOnlyDTO } from '../../../types/api/userInterface';

interface UserCardProps {
    user: UserReadOnlyDTO;
    onViewDetails: (user: UserReadOnlyDTO) => void;
    onEdit: (user: UserReadOnlyDTO) => void;
    onDelete: (user: UserReadOnlyDTO) => void;
    showInactiveOnly?: boolean;
    onRestore?: (user: UserReadOnlyDTO) => void;
}

const UserCard: React.FC<UserCardProps> = ({
                                               user,
                                               onViewDetails,
                                               onEdit,
                                               onDelete,
                                               showInactiveOnly = false,
                                               onRestore
                                           }) => {

    const getRoleIcon = (role: string) => {
        return role === 'ADMIN' ?
            <Shield className="w-4 h-4 text-red-500" /> :
            <User className="w-4 h-4 text-blue-500" />;
    };

    const getRoleLabel = (role: string) => {
        return role === 'ADMIN' ? 'Διαχειριστής' : 'Χρήστης';
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        {getRoleIcon(user.role)}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">
                                {user.username}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span className="flex items-center">
                                    <span className="ml-1">{getRoleLabel(user.role)}</span>
                                </span>
                                <span>Δημιουργήθηκε: {new Date(user.createdAt).toLocaleDateString('el-GR')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => onViewDetails(user)}
                        >
                            <Eye className="w-4 h-4" />
                            <span>Λεπτομέρειες</span>
                        </Button>

                        {!showInactiveOnly && (
                            <>
                                <Button
                                    variant="teal"
                                    size="sm"
                                    onClick={() => onEdit(user)}
                                    disabled={!user.isActive}
                                >
                                    <Edit className="w-4 h-4" />
                                    <span>Επεξεργασία</span>
                                </Button>

                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => onDelete(user)}
                                    disabled={!user.isActive}
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span>Διαγραφή</span>
                                </Button>
                            </>
                        )}

                        {showInactiveOnly && onRestore && (
                            <Button
                                variant="success"
                                size="sm"
                                onClick={() => onRestore(user)}
                            >
                                <span>Επαναφορά</span>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Status indicator */}
                {!user.isActive && (
                    <div className="pt-2">
                        <p className="text-xs text-gray-500 italic">
                            Ανενεργός χρήστης
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserCard;