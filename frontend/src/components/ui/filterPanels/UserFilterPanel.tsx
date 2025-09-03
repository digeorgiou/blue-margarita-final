import React from 'react';
import { Search, Users } from 'lucide-react';
import { LoadingSpinner } from '../common';
import { CustomTextInput } from "../inputs";
import { UserFilterPanelProps } from "../../../types/components/filterPanel-types.ts";
import { UserCard } from '../resultCards'

const UserFilterPanel: React.FC<UserFilterPanelProps> = ({
                                                             searchTerm,
                                                             onSearchTermChange,
                                                             searchResults,
                                                             loading,
                                                             onViewDetails,
                                                             onEdit,
                                                             onDelete,
                                                             showInactiveOnly = false,
                                                             onRestore
                                                         }) => {

    return (
        <div className="space-y-6">
            {/* Search Controls */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                    <CustomTextInput
                        label=""
                        placeholder="Αναζήτηση με username..."
                        value={searchTerm}
                        onChange={onSearchTermChange}
                        icon={<Search className="w-5 h-5" />}
                        className="w-full"
                    />
                </div>
            </div>

            {/* Results */}
            <div>
                {loading ? (
                    <div className="bg-white flex items-center justify-center p-8">
                        <LoadingSpinner/>
                        <p className="ml-3 text-gray-600">Αναζήτηση χρηστών...</p>
                    </div>
                ) : searchResults.length === 0 ? (
                    <div className="text-center py-12">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Δεν βρέθηκαν χρήστες
                        </h3>
                        <p className="text-gray-600">
                            {searchTerm.trim() ? 'Δοκιμάστε διαφορετικούς όρους αναζήτησης ή αλλάξτε τα φίλτρα.'
                                : 'Ξεκινήστε αναζήτηση ή δημιουργήστε έναν νέο χρήστη.'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {searchResults.map((user) => (
                            <UserCard
                                key={user.id}
                                user={user}
                                onViewDetails={onViewDetails}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                showInactiveOnly={showInactiveOnly}
                                onRestore={onRestore}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserFilterPanel;