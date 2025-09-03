import React from 'react';
import { BaseFormModal } from '..';
import { Shield, User, Calendar, Clock } from 'lucide-react';
import type { UserReadOnlyDTO } from '../../../../types/api/userInterface';

interface UserDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: UserReadOnlyDTO | null;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({
                                                             isOpen,
                                                             onClose,
                                                             user
                                                         }) => {
    if (!user) return null;

    const getRoleInfo = (role: string) => {
        return role === 'ADMIN' ?
            { icon: <Shield className="w-5 h-5 text-red-500" />, label: 'Διαχειριστής', color: 'text-red-600' } :
            { icon: <User className="w-5 h-5 text-blue-500" />, label: 'Χρήστης', color: 'text-blue-600' };
    };

    const roleInfo = getRoleInfo(user.role);

    return (
        <BaseFormModal isOpen={isOpen} onClose={onClose} title="Στοιχεία Χρήστη">
            <div className="space-y-6">
                {/* Basic Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Βασικά Στοιχεία</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Username</label>
                            <p className="mt-1 text-sm text-gray-900">{user.username}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Ρόλος</label>
                            <div className="mt-1 flex items-center">
                                {roleInfo.icon}
                                <span className={`ml-2 text-sm font-medium ${roleInfo.color}`}>
                                    {roleInfo.label}
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Κατάσταση</label>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                user.isActive
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                            }`}>
                                {user.isActive ? 'Ενεργός' : 'Ανενεργός'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Timestamps */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Χρονικά Στοιχεία</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Δημιουργήθηκε</label>
                            <div className="mt-1 flex items-center text-sm text-gray-900">
                                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                {new Date(user.createdAt).toLocaleString('el-GR')}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Τελευταία Ενημέρωση</label>
                            <div className="mt-1 flex items-center text-sm text-gray-900">
                                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                {new Date(user.updatedAt).toLocaleString('el-GR')}
                            </div>
                        </div>

                        {user.deletedAt && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Διαγράφηκε</label>
                                <div className="mt-1 flex items-center text-sm text-red-600">
                                    <Clock className="w-4 h-4 mr-2 text-red-400" />
                                    {new Date(user.deletedAt).toLocaleString('el-GR')}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Audit Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Πληροφορίες Ελέγχου</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Δημιουργήθηκε από</label>
                            <p className="mt-1 text-sm text-gray-900">{user.createdBy || 'Σύστημα'}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Τελευταία ενημέρωση από</label>
                            <p className="mt-1 text-sm text-gray-900">{user.lastUpdatedBy || 'Σύστημα'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </BaseFormModal>
    );
};

export default UserDetailModal;