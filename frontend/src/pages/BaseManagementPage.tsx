import React, { useState, useEffect } from 'react';
import { Search, Plus, RefreshCw } from 'lucide-react';
import { Button, DashboardCard, Input, ManagementList, LoadingSpinner, ErrorDisplay, Alert, PaginationControls } from '../components/ui';

export interface BaseManagementPageProps<T, FilterType> {
    title: string;
    icon: string;
    entityName: string; // singular form: "Category", "Customer", etc.
    entityNamePlural: string; // plural form: "Categories", "Customers", etc.

    // Data loading
    loadData: (filters: FilterType) => Promise<{ content: T[]; totalElements: number; totalPages: number; currentPage: number; hasNext: boolean; hasPrevious: boolean; }>;

    // Render functions
    renderListItem: (item: T) => React.ReactNode;
    renderCreateModal: () => React.ReactNode;
    renderUpdateModal: (item: T) => React.ReactNode;
    renderDeleteModal: (item: T) => React.ReactNode;
    renderDetailModal: (item: T) => React.ReactNode;
    renderSuccessModal: () => React.ReactNode;

    // Modal controls
    showCreateModal: boolean;
    showUpdateModal: boolean;
    showDeleteModal: boolean;
    showDetailModal: boolean;
    showSuccessModal: boolean;
    setShowCreateModal: (show: boolean) => void;
    setShowUpdateModal: (show: boolean) => void;
    setShowDeleteModal: (show: boolean) => void;
    setShowDetailModal: (show: boolean) => void;
    setShowSuccessModal: (show: boolean) => void;

    // Selected item for modals
    selectedItem: T | null;

    // Custom filters (rendered between search and actions)
    customFilters?: React.ReactNode;

    // Initial filter values
    initialFilters: FilterType;

    // Search configuration
    searchPlaceholder?: string;
    searchFields: (keyof FilterType)[];
}

function BaseManagementPage<T extends { [key: string]: any }, FilterType extends {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortDirection?: string;
}>({
       title,
       icon,
       entityName,
       entityNamePlural,
       loadData,
       renderListItem,
       renderCreateModal,
       renderUpdateModal,
       renderDeleteModal,
       renderDetailModal,
       renderSuccessModal,
       showCreateModal,
       showUpdateModal,
       showDeleteModal,
       showDetailModal,
       showSuccessModal,
       setShowCreateModal,
       setShowUpdateModal,
       setShowDeleteModal,
       setShowDetailModal,
       setShowSuccessModal,
       selectedItem,
       customFilters,
       initialFilters,
       searchPlaceholder = `Αναζήτηση ${entityNamePlural.toLowerCase()}...`,
       searchFields
   }: BaseManagementPageProps<T, FilterType>) {
    // State management
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    // Filter and pagination
    const [filters, setFilters] = useState<FilterType>(initialFilters);
    const [searchTerm, setSearchTerm] = useState('');
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrevious, setHasPrevious] = useState(false);

    // Load data function
    const fetchData = async (newFilters?: Partial<FilterType>) => {
        try {
            setError(null);
            const effectiveFilters = { ...filters, ...newFilters };

            // Apply search to appropriate fields
            if (searchTerm) {
                searchFields.forEach(field => {
                    (effectiveFilters as any)[field] = searchTerm;
                });
            }

            const result = await loadData(effectiveFilters);
            setData(result.content);
            setTotalElements(result.totalElements);
            setTotalPages(result.totalPages);
            setCurrentPage(result.currentPage);
            setHasNext(result.hasNext);
            setHasPrevious(result.hasPrevious);
        } catch (err) {
            console.error(`Failed to load ${entityNamePlural.toLowerCase()}:`, err);
            setError(err instanceof Error ? err.message : `Failed to load ${entityNamePlural.toLowerCase()}`);
        }
    };

    // Initial load
    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            await fetchData();
            setLoading(false);
        };
        loadInitialData();
    }, []);

    // Search with debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchTerm !== '') {
                setCurrentPage(0);
                fetchData({ ...filters, page: 0 });
            } else if (searchTerm === '') {
                fetchData({ ...filters, page: currentPage });
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    // Refresh data
    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    };

    // Pagination handlers
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        fetchData({ ...filters, page });
    };

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(0);
    };

    const clearSearch = () => {
        setSearchTerm('');
        setCurrentPage(0);
    };

    if (loading) {
        return (
            <div className="min-h-screen p-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <LoadingSpinner />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <span className="text-3xl mr-3">{icon}</span>
                        <h1 className="text-3xl font-bold text-white">{title}</h1>
                    </div>
                    <Button
                        onClick={() => setShowCreateModal(true)}
                        variant="success"
                        size="lg"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Νέο {entityName}
                    </Button>
                </div>

                {/* Error Display */}
                {error && (
                    <Alert variant="error" onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {/* Main Content Card */}
                <DashboardCard
                    title={`Διαχείριση ${entityNamePlural}`}
                    icon={icon}
                    height="xl"
                    className="min-h-[600px]"
                >
                    <div className="space-y-4">
                        {/* Search and Filters */}
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <Input
                                        type="text"
                                        placeholder={searchPlaceholder}
                                        value={searchTerm}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            {/* Custom Filters */}
                            {customFilters && (
                                <div className="flex gap-2">
                                    {customFilters}
                                </div>
                            )}

                            {/* Refresh Button */}
                            <Button
                                onClick={handleRefresh}
                                variant="secondary"
                                disabled={refreshing}
                            >
                                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                                Ανανέωση
                            </Button>
                        </div>

                        {/* Results Summary */}
                        <div className="flex justify-between items-center text-sm text-gray-600">
              <span>
                Δείχνοντας {data.length} από {totalElements} {entityNamePlural.toLowerCase()}
                  {searchTerm && ` για "${searchTerm}"`}
              </span>
                            {searchTerm && (
                                <Button
                                    onClick={clearSearch}
                                    variant="secondary"
                                    size="sm"
                                >
                                    Καθαρισμός
                                </Button>
                            )}
                        </div>

                        {/* Data List */}
                        <ManagementList
                            items={data}
                            renderItem={renderListItem}
                            loading={loading}
                            emptyMessage={`Δεν βρέθηκαν ${entityNamePlural.toLowerCase()}`}
                            emptyIcon={icon}
                        />

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <PaginationControls
                                currentPage={currentPage}
                                totalPages={totalPages}
                                hasNext={hasNext}
                                hasPrevious={hasPrevious}
                                onPageChange={handlePageChange}
                                totalElements={totalElements}
                                pageSize={filters.pageSize || 20}
                            />
                        )}
                    </div>
                </DashboardCard>

                {/* Modals */}
                {showCreateModal && renderCreateModal()}
                {showUpdateModal && selectedItem && renderUpdateModal(selectedItem)}
                {showDeleteModal && selectedItem && renderDeleteModal(selectedItem)}
                {showDetailModal && selectedItem && renderDetailModal(selectedItem)}
                {showSuccessModal && renderSuccessModal()}
            </div>
        </div>
    );
}

export default BaseManagementPage;