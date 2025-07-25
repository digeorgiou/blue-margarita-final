import { useState, useEffect, useRef } from 'react';
import { Button, Alert, CustomerSearchBar, CustomerDetailModal, CustomerUpdateModal, CustomerCreateModal} from '../components/ui';
import DashboardCard from '../components/ui/DashboardCard';
import ConfirmDeleteModal from '../components/ui/modals/ConfirmDeleteModal';
import SuccessModal from '../components/ui/modals/SuccessModal';
import EnhancedPaginationControls from '../components/ui/EnhancedPaginationControls';
import { customerService } from '../services/customerService';
import { usePagination } from '../hooks/usePagination';
import { useFormErrorHandler } from '../hooks/useFormErrorHandler';
import { Users, UserPlus, Search } from 'lucide-react';
import type {
    CustomerListItemDTO,
    CustomerDetailedViewDTO,
    CustomerInsertDTO,
    GenderType,
    Paginated
} from '../types/api/customerInterface';

const CustomerManagementPage = () => {
    // Search and filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [wholesaleOnly, setWholesaleOnly] = useState(false);
    const [searchResults, setSearchResults] = useState<Paginated<CustomerListItemDTO> | null>(null);
    const [loading, setLoading] = useState(false);

    // Enhanced pagination hook with page size selection
    const {
        pageSize,
        setPage,
        setPageSize,
        getPaginationParams,
        resetPagination
    } = usePagination({
        initialPageSize: 12,
        onPageChange: () => {
            // Use a ref or state to track if we should skip the initial call
            if (skipInitialPageChange.current) {
                skipInitialPageChange.current = false;
                return;
            }
            searchCustomers();
        }
    });

    const skipInitialPageChange = useRef(true);

    // Enhanced error handling hook
    const { generalError, handleApiError, clearErrors } = useFormErrorHandler();

    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

    // Selected customer states
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerListItemDTO | null>(null);
    const [selectedCustomerFull, setSelectedCustomerFull] = useState<CustomerDetailedViewDTO | null>(null);
    const [customerDetails, setCustomerDetails] = useState<CustomerDetailedViewDTO | null>(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    // Success message state
    const [successMessage, setSuccessMessage] = useState({ title: '', message: '' });

    // Get current user ID (you'd get this from auth context)
    const getCurrentUserId = () => 1; // Placeholder

    // Enhanced search customers function
    const searchCustomers = async () => {
        try {
            setLoading(true);
            clearErrors();

            // If search term is less than 2 characters and not empty, don't search
            if (searchTerm.length > 0 && searchTerm.length < 2) {
                setLoading(false);
                return;
            }

            const paginationParams = getPaginationParams();

            const filters = {
                searchTerm: searchTerm.trim() || undefined,
                wholesaleOnly: wholesaleOnly || undefined,
                isActive: true,
                ...paginationParams,
                sortBy: 'lastname',
                sortDirection: 'ASC'
            };

            const data = await customerService.getCustomersFilteredPaginated(filters);
            setSearchResults(data);
        } catch (err) {
            await handleApiError(err);
            setSearchResults(null);
        } finally {
            setLoading(false);
        }
    };

    // Effect for search term changes only - debounced
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            // Only search if term is empty (load all) or has 2+ characters
            if (searchTerm.length === 0 || searchTerm.length >= 2) {
                resetPagination();
                // Search after pagination reset
                searchCustomers();
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, wholesaleOnly]);

    // Initial load only
    useEffect(() => {
        searchCustomers();
    }, []);

    // Load customer details for modals
    const loadCustomerDetails = async (id: number) => {
        try {
            setDetailsLoading(true);
            const details = await customerService.getCustomerDetailedView(id);
            setCustomerDetails(details);
        } catch (err) {
            await handleApiError(err);
        } finally {
            setDetailsLoading(false);
        }
    };

    // Load full customer data for update modal
    const loadFullCustomerData = async (id: number) => {
        try {
            const customerData = await customerService.getCustomerDetailedView(id);
            setSelectedCustomerFull(customerData);
        } catch (err) {
            await handleApiError(err);
        }
    };

    // Handle create customer
    const handleCreateCustomer = async (data: CustomerInsertDTO): Promise<void> => {
        await customerService.createCustomer({
            ...data,
            creatorUserId: getCurrentUserId()
        });
        await searchCustomers();
        setSuccessMessage({
            title: 'Επιτυχής Δημιουργία',
            message: `Ο πελάτης "${data.firstname} ${data.lastname}" δημιουργήθηκε επιτυχώς.`
        });
        setIsSuccessModalOpen(true);
    };

    // Handle update customer
    const handleUpdateCustomer = async (data: { firstname: string; lastname: string; gender: GenderType; phoneNumber: string; address: string; email: string; tin: string; }) => {
        if (!selectedCustomer) return;

        try {
            const updateData = {
                customerId: selectedCustomer.customerId,
                updaterUserId: getCurrentUserId(),
                ...data
            };

            await customerService.updateCustomer(selectedCustomer.customerId, updateData);
            await searchCustomers();
            setSuccessMessage({
                title: 'Επιτυχής Ενημέρωση',
                message: `Ο πελάτης "${data.firstname} ${data.lastname}" ενημερώθηκε επιτυχώς.`
            });
            setIsSuccessModalOpen(true);
        } catch (err) {
            await handleApiError(err);
        }
    };

    // Handle delete customer
    const handleDeleteCustomer = async () => {
        if (!selectedCustomer) return;

        try {
            await customerService.deleteCustomer(selectedCustomer.customerId);
            await searchCustomers();
            setSuccessMessage({
                title: 'Επιτυχής Διαγραφή',
                message: `Ο πελάτης "${selectedCustomer.firstname} ${selectedCustomer.lastname}" διαγράφηκε επιτυχώς.`
            });
            setIsSuccessModalOpen(true);
        } catch (err) {
            await handleApiError(err);
        }
    };

    // Enhanced pagination handlers with immediate search
    const handlePageChange = (page: number) => {
        if (!loading) {
            setPage(page);
        }
    };

    const handlePageSizeChange = (newPageSize: number) => {
        if (!loading) {
            setPageSize(newPageSize);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center space-x-3 mb-4 md:mb-0">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Διαχείριση Πελατών</h1>
                            <p className="text-gray-600">Αναζήτηση και διαχείριση πελατών</p>
                        </div>
                    </div>
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
                    >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Νέος Πελάτης
                    </Button>
                </div>

                {/* Enhanced Error Display */}
                {generalError && (
                    <Alert variant="error" className="shadow-sm" onClose={clearErrors}>
                        {generalError}
                    </Alert>
                )}

                {/* Enhanced Pagination Controls - Moved to top */}
                {searchResults && searchResults.totalElements > 0 && (
                    <EnhancedPaginationControls
                        paginationData={{
                            currentPage: searchResults.currentPage,
                            totalPages: searchResults.totalPages,
                            totalElements: searchResults.totalElements,
                            pageSize: searchResults.pageSize,
                            numberOfElements: searchResults.numberOfElements
                        }}
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}
                        className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
                    />
                )}

                {/* Search Section */}
                <DashboardCard
                    title="Αναζήτηση Πελατών"
                    icon={<Search className="w-5 h-5" />}
                    className="shadow-lg border-white/20"
                >
                    <CustomerSearchBar
                        searchTerm={searchTerm}
                        onSearchTermChange={setSearchTerm}
                        wholesaleOnly={wholesaleOnly}
                        onWholesaleOnlyChange={setWholesaleOnly}
                        searchResults={searchResults ? {
                            ...searchResults,
                            hasNext: searchResults.currentPage < searchResults.totalPages - 1,
                            hasPrevious: searchResults.currentPage > 0
                        } : {
                            data: [],
                            totalElements: 0,
                            totalPages: 0,
                            numberOfElements: 0,
                            currentPage: 0,
                            pageSize: pageSize,
                            hasNext: false,
                            hasPrevious: false
                        }}
                        loading={loading}
                        onViewDetails={(customer) => {
                            setSelectedCustomer(customer);
                            setIsDetailsModalOpen(true);
                            loadCustomerDetails(customer.customerId);
                        }}
                        onEdit={async (customer) => {
                            setSelectedCustomer(customer);
                            await loadFullCustomerData(customer.customerId);
                            setIsUpdateModalOpen(true);
                        }}
                        onDelete={(customer) => {
                            setSelectedCustomer(customer);
                            setIsDeleteModalOpen(true);
                        }}
                    />
                </DashboardCard>

                {/* Modals */}
                <CustomerCreateModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSubmit={handleCreateCustomer}
                    currentUserId={getCurrentUserId()}
                />

                {selectedCustomerFull && (
                    <CustomerUpdateModal
                        isOpen={isUpdateModalOpen}
                        onClose={() => {
                            setIsUpdateModalOpen(false);
                            setSelectedCustomerFull(null);
                        }}
                        onSubmit={handleUpdateCustomer}
                        customer={selectedCustomerFull}
                    />
                )}

                <ConfirmDeleteModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleDeleteCustomer}
                    entityName="πελάτη"
                    entityDisplayName={selectedCustomer ? `${selectedCustomer.firstname} ${selectedCustomer.lastname}` : ''}
                    warningMessage="Αυτή η ενέργεια θα κάνει soft delete τον πελάτη αν έχει συσχετισμένες πωλήσεις, ή θα τον διαγράψει οριστικά αν δεν έχει."
                />

                {customerDetails && (
                    <CustomerDetailModal
                        isOpen={isDetailsModalOpen}
                        onClose={() => {
                            setIsDetailsModalOpen(false);
                            setCustomerDetails(null);
                        }}
                        customer={customerDetails}
                        loading={detailsLoading}
                    />
                )}

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

export default CustomerManagementPage;