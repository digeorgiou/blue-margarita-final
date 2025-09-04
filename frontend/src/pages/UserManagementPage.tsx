import { useState, useEffect } from 'react';
import { Button, Alert, CustomCard } from '../components/ui/common';
import { ConfirmDeleteModal, SuccessModal, UserCreateModal, UserDetailModal, UserUpdateModal } from '../components/ui/modals';
import { EnhancedPaginationControls } from '../components/ui/pagination';
import { UserFilterPanel } from '../components/ui/filterPanels'
import { userService } from '../services/userService';
import { authService } from '../services/authService';
import { useFormErrorHandler } from '../hooks/useFormErrorHandler';
import { CustomToggleOption } from '../components/ui/inputs';
import { UserPlus } from 'lucide-react';
import type {
    UserReadOnlyDTO,
    UserInsertDTO,
    UserUpdateDTO
} from '../types/api/userInterface';
import type { Paginated } from '../types/api/dashboardInterface';
import { DEFAULT_PAGE_SIZES } from "../constants/pagination.ts";

const UserManagementPage = () => {
    // Search and pagination state
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZES.USERS || 12);
    const [searchResults, setSearchResults] = useState<Paginated<UserReadOnlyDTO> | null>(null);
    const [loading, setLoading] = useState(false);

    // Toggle state for showing inactive users
    const [showInactiveOnly, setShowInactiveOnly] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    // Error handling
    const { generalError, handleApiError, clearErrors } = useFormErrorHandler();

    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

    // Selected user and details
    const [selectedUser, setSelectedUser] = useState<UserReadOnlyDTO | null>(null);

    // Success message state
    const [successMessage, setSuccessMessage] = useState({
        title: '',
        message: ''
    });

    // Search function
    const searchUsers = async (page: number = currentPage, size: number = pageSize) => {
        try {
            setLoading(true);
            clearErrors();

            if (searchTerm.length > 0 && searchTerm.length < 2) {
                setLoading(false);
                return;
            }

            const filters = {
                username: searchTerm.trim() || undefined,
                isActive: showInactiveOnly ? false : true,
                page,
                pageSize: size,
                sortBy: 'username',
                sortDirection: 'ASC'
            };

            const data = await userService.getUsersFilteredPaginated(filters);
            setSearchResults(data);
        } catch (err) {
            await handleApiError(err);
            setSearchResults(null);
        } finally {
            setLoading(false);
        }
    };

    // Handle toggle change
    const handleToggleChange = (checked: boolean) => {
        setShowInactiveOnly(checked);
        setCurrentPage(0);
    };

    // Load initial data
    useEffect(() => {
        searchUsers();
    }, []);

    // Reload when toggle changes
    useEffect(() => {
        searchUsers(0, pageSize);
    }, [showInactiveOnly]);

    // Debounced search when search term changes
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setCurrentPage(0);
            searchUsers(0, pageSize);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    useEffect(() => {
        searchUsers();
    }, [currentPage, pageSize]);

    // Check admin status
    useEffect(() => {
        const userRole = authService.getCurrentUserRole();
        setIsAdmin(userRole === 'ADMIN');
    }, []);

    // Modal handlers
    const handleViewDetails = (user: UserReadOnlyDTO) => {
        setSelectedUser(user);
        setIsDetailsModalOpen(true);
    };

    const handleEdit = (user: UserReadOnlyDTO) => {
        setSelectedUser(user);
        setIsUpdateModalOpen(true);
    };

    const handleDelete = (user: UserReadOnlyDTO) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
    };

    // Handle restore user (for soft-deleted users)
    const handleRestoreUser = async (user: UserReadOnlyDTO) => {
        try {
            await userService.restoreUser(user.id);
            await searchUsers();
            setSuccessMessage({
                title: 'Επιτυχής Επαναφορά',
                message: `Ο χρήστης "${user.username}" επαναφέρθηκε επιτυχώς.`
            });
            setIsSuccessModalOpen(true);
        } catch (error) {
            await handleApiError(error);
        }
    };

    // CRUD handlers
    const handleCreateUser = async (data: UserInsertDTO) => {
        try {
            await userService.createUser(data);
            await searchUsers();
            setSuccessMessage({
                title: 'Επιτυχής Δημιουργία',
                message: `Ο χρήστης "${data.username}" δημιουργήθηκε επιτυχώς.`
            });
            setIsSuccessModalOpen(true);
        } catch (err) {
            await handleApiError(err);
        }
    };

    const handleUpdateUser = async (data: UserUpdateDTO) => {
        try {
            await userService.updateUser(data);
            await searchUsers();
            setSuccessMessage({
                title: 'Επιτυχής Ενημέρωση',
                message: `Ο χρήστης "${data.username}" ενημερώθηκε επιτυχώς.`
            });
            setIsSuccessModalOpen(true);
        } catch (err) {
            await handleApiError(err);
        }
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) return;

        try {
            await userService.deleteUser(selectedUser.id);
            setIsDeleteModalOpen(false);
            setSelectedUser(null);
            await searchUsers();
            setSuccessMessage({
                title: 'Επιτυχής Διαγραφή',
                message: `Ο χρήστης "${selectedUser.username}" διαγράφηκε επιτυχώς.`
            });
            setIsSuccessModalOpen(true);
        } catch (err) {
            setIsDeleteModalOpen(false);
            await handleApiError(err);
        }
    };

    return (
        <div className="min-h-screen p-4">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        {isAdmin && (
                            <CustomToggleOption
                                value={showInactiveOnly}
                                onChange={handleToggleChange}
                                optionLabel="Προβολή Ανενεργών"
                                className=""
                                textClassName="text-white"
                            />
                        )}
                    </div>
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        variant="create"
                    >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Νέος Χρήστης
                    </Button>
                </div>

                {/* Error Display */}
                {generalError && (
                    <Alert variant="error" className="mb-6">
                        {generalError}
                    </Alert>
                )}

                {/* Filter Panel */}
                <CustomCard title="Αναζήτηση & Φίλτρα" className="bg-white/10 backdrop-blur-sm border-white/20">
                    <UserFilterPanel
                        searchTerm={searchTerm}
                        onSearchTermChange={setSearchTerm}
                        searchResults={searchResults ? searchResults.data : []}
                        loading={loading}
                        onViewDetails={handleViewDetails}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        showInactiveOnly={showInactiveOnly}
                        onRestore={showInactiveOnly ? handleRestoreUser : undefined}
                    />
                </CustomCard>

                {/* Pagination */}
                {searchResults && searchResults.totalElements > 0 && (
                    <CustomCard className="bg-white/10 backdrop-blur-sm border-white/20">
                        <EnhancedPaginationControls
                            paginationData={{
                                currentPage: searchResults.currentPage,
                                totalPages: searchResults.totalPages,
                                totalElements: searchResults.totalElements,
                                pageSize: searchResults.pageSize,
                                numberOfElements: searchResults.numberOfElements
                            }}
                            setCurrentPage={setCurrentPage}
                            setPageSize={setPageSize}
                            className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
                        />
                    </CustomCard>
                )}

                {/* Modals */}
                <UserCreateModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSubmit={handleCreateUser}
                />


                <UserUpdateModal
                    isOpen={isUpdateModalOpen}
                    onClose={() => {setIsUpdateModalOpen(false)}}
                    onSubmit={handleUpdateUser}
                    user={selectedUser}
                />

                <ConfirmDeleteModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleDeleteUser}
                    title="Διαγραφή Χρήστη"
                    message={selectedUser ?
                        `Είστε σίγουροι ότι θέλετε να διαγράψετε τον χρήστη "${selectedUser.username}";`
                        : ''
                    }
                    warningMessage="Αυτή η ενέργεια δεν μπορεί να αναιρεθεί."
                />

                <UserDetailModal
                    isOpen={isDetailsModalOpen}
                    onClose={() => setIsDetailsModalOpen(false)}
                    user={selectedUser}
                />

                <SuccessModal
                    isOpen={isSuccessModalOpen}
                    onClose={() => setIsSuccessModalOpen(false)}
                    title={successMessage.title}
                    message={successMessage.message}
                />
            </div>
        </div>
    );
};

export default UserManagementPage;