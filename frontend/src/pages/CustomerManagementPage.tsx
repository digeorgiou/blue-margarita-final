import { useState, useEffect } from 'react';
import { Button, Alert, CustomCard } from '../components/ui/common';
import { CustomerFilterPanel } from '../components/ui/filterPanels'
import { ConfirmDeleteModal, CustomerDetailModal, CustomerUpdateModal, CustomerCreateModal, SuccessModal } from '../components/ui/modals';
import { EnhancedPaginationControls } from '../components/ui/pagination';
import { customerService } from '../services/customerService';
import { authService } from '../services/authService';
import { CustomToggleOption } from '../components/ui/inputs';
import { useFormErrorHandler } from '../hooks/useFormErrorHandler';
import { UserPlus } from 'lucide-react';
import { DEFAULT_PAGE_SIZES } from "../constants/pagination.ts";
import type {
    CustomerListItemDTO,
    CustomerDetailedViewDTO,
    CustomerInsertDTO,
    CustomerUpdateDTO,
    Paginated
} from '../types/api/customerInterface';

const CustomerManagementPage = () => {
    // Search and pagination state - simplified
    const [searchTerm, setSearchTerm] = useState('');
    const [tinOnlyFilter, setTinOnlyFilter] = useState(false); // Changed from wholesaleOnly to tinOnlyFilter
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZES.CUSTOMERS);
    const [searchResults, setSearchResults] = useState<Paginated<CustomerListItemDTO> | null>(null);
    const [loading, setLoading] = useState(false);

    const [showInactiveOnly, setShowInactiveOnly] = useState(false);

    // Error handling
    const { generalError, handleApiError, clearErrors } = useFormErrorHandler();

    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

    // Selected customer states
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerListItemDTO | null>(null);
    const [customerDetails, setCustomerDetails] = useState<CustomerDetailedViewDTO | null>(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    // Success message state
    const [successMessage, setSuccessMessage] = useState({ title: '', message: '' });

    const [isAdmin, setIsAdmin] = useState(false);

    // Simple search function
    const searchCustomers = async (page: number = currentPage, size: number = pageSize) => {
        try {
            setLoading(true);
            clearErrors();

            // If search term is less than 2 characters and not empty, don't search
            if (searchTerm.length > 0 && searchTerm.length < 2) {
                setLoading(false);
                return;
            }

            const filters = {
                searchTerm: searchTerm.trim() || undefined,
                isActive: showInactiveOnly ? false : true,
                page,
                pageSize: size,
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

    const handleToggleChange = (checked: boolean) => {
        setShowInactiveOnly(checked);
        setCurrentPage(0); // Reset to first page when toggle changes
    };

    // Load initial data
    useEffect(() => {
        searchCustomers();
    }, []);

    // Debounced search when search term changes
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            // Reset to page 0 when search changes
            setCurrentPage(0);
            searchCustomers(0, pageSize);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, tinOnlyFilter]);

    useEffect(() => {
        const userRole = authService.getCurrentUserRole();
        setIsAdmin(userRole === 'ADMIN');
    }, []);

    useEffect(() => {
        searchCustomers(0, pageSize);
    }, [showInactiveOnly]);

    useEffect(() => {
        searchCustomers();
    }, [currentPage, pageSize]);

    // Modal handlers
    const handleViewDetails = async (customer: CustomerListItemDTO) => {
        setSelectedCustomer(customer);
        setDetailsLoading(true);
        setIsDetailsModalOpen(true);

        try {
            const details = await customerService.getCustomerDetailedView(customer.customerId);
            setCustomerDetails(details);
        } catch (err) {
            await handleApiError(err);
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleEdit = (customer: CustomerListItemDTO) => {
        setSelectedCustomer(customer);
        setIsUpdateModalOpen(true);
    };

    const handleDelete = (customer: CustomerListItemDTO) => {
        setSelectedCustomer(customer);
        setIsDeleteModalOpen(true);
    };

    // CRUD operations
    const handleCreateCustomer = async (data: CustomerInsertDTO) => {
        await customerService.createCustomer(data);
        await searchCustomers(); // Refresh results
        setSuccessMessage({
            title: 'Επιτυχής Δημιουργία',
            message: `Ο πελάτης "${data.firstname} ${data.lastname}" δημιουργήθηκε επιτυχώς.`
        });
        setIsSuccessModalOpen(true);
    };

    const handleUpdateCustomer = async (data: CustomerUpdateDTO) => {

        await customerService.updateCustomer(data.customerId, data);
        await searchCustomers(); // Refresh results
        setSuccessMessage({
            title: 'Επιτυχής Ενημέρωση',
            message: `Ο πελάτης "${data.firstname} ${data.lastname}" ενημερώθηκε επιτυχώς.`
        });
        setIsSuccessModalOpen(true);
    };

    const handleDeleteCustomer = async () => {
        if (!selectedCustomer) return;

        try {
            await customerService.deleteCustomer(selectedCustomer.customerId);
            await searchCustomers(); // Refresh results
            setSuccessMessage({
                title: 'Επιτυχής Διαγραφή',
                message: `Ο πελάτης "${selectedCustomer.firstname} ${selectedCustomer.lastname}" διαγράφηκε επιτυχώς.`
            });
            setIsSuccessModalOpen(true);
        } catch (err) {
            // Keep error handling for delete since it's not in a modal with useFormErrorHandler
            await handleApiError(err);
        }
    };

    const handleRestoreCustomer = async (customer: CustomerListItemDTO) => {
        try {
            await customerService.restoreCustomer(customer.customerId);
            await searchCustomers(); // Reload the list
            setSuccessMessage({
                title: 'Επιτυχής Επαναφορά',
                message: `Ο πελάτης "${customer.firstname} ${customer.lastname}" επαναφέρθηκε επιτυχώς.`
            });
            setIsSuccessModalOpen(true);
        } catch (error) {
            await handleApiError(error);
        }
    };

    return (
        <div className="min-h-screen p-4">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-bold text-white">Φίλτρα Αναζήτησης</h3>
                    </div>
                    {isAdmin && (
                        <CustomToggleOption
                            value={showInactiveOnly}
                            onChange={handleToggleChange}
                            optionLabel="Προβολή Ανενεργών"
                            className=""
                            textClassName="text-white"
                        />
                    )}
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        variant="create"
                        size="lg"
                        className="w-full md:w-auto"
                    >
                        <UserPlus className="w-5 h-5 mr-2" />
                        Νέος Πελάτης
                    </Button>
                </div>

                {/* Error Display */}
                {generalError && (
                    <Alert variant="error" className="shadow-sm" onClose={clearErrors}>
                        {generalError}
                    </Alert>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                    {/* Search Section */}
                    <CustomCard
                        className="shadow-lg"
                    >
                        <CustomerFilterPanel
                            searchTerm={searchTerm}
                            onSearchTermChange={setSearchTerm}
                            tinOnlyFilter={tinOnlyFilter}
                            onTinOnlyFilterChange={setTinOnlyFilter}
                            searchResults={searchResults ? searchResults.data : []}
                            loading={loading}
                            onViewDetails={handleViewDetails}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            showInactiveOnly={showInactiveOnly}
                            onRestore={showInactiveOnly ? handleRestoreCustomer : undefined}
                        />
                    </CustomCard>

                    {/* Pagination Controls - Top */}
                    {searchResults && searchResults.totalElements > 0 && (
                        <CustomCard className="shadow-lg">
                            <EnhancedPaginationControls
                                paginationData={{
                                    currentPage: searchResults.currentPage,
                                    totalPages: searchResults.totalPages,
                                    totalElements: searchResults.totalElements,
                                    pageSize: searchResults.pageSize,
                                    numberOfElements: searchResults.numberOfElements
                                }}
                                setPageSize={setPageSize}
                                setCurrentPage={setCurrentPage}
                                className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
                            />
                        </CustomCard>
                    )}

                </div>
            </div>

            {/* Modals */}
            <CustomerCreateModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateCustomer}
            />

            <CustomerUpdateModal
                isOpen={isUpdateModalOpen}
                onClose={() => setIsUpdateModalOpen(false)}
                onSubmit={handleUpdateCustomer}
                customer={selectedCustomer}
            />

            <CustomerDetailModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                customer={customerDetails}
                loading={detailsLoading}
            />

            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteCustomer}
                title="Διαγραφή Πελάτη"
                message={selectedCustomer ?
                    `Είστε σίγουροι ότι θέλετε να διαγράψετε τον πελάτη "${selectedCustomer.firstname} ${selectedCustomer.lastname}";`
                    : ''
                }
                warningMessage="Αυτή η ενέργεια δεν μπορεί να αναιρεθεί."
            />

            <SuccessModal
                isOpen={isSuccessModalOpen}
                onClose={() => setIsSuccessModalOpen(false)}
                title={successMessage.title}
                message={successMessage.message}
            />
        </div>
    );
};

export default CustomerManagementPage;