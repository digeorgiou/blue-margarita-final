import React, { useState, useEffect } from 'react';
import { Button, Alert } from '../components/ui';
import CustomCard from '../components/ui/common/CustomCard.tsx';
import { dashboardService } from '../services/dashboardService';
import { locationService } from '../services/locationService';
import { categoryService } from '../services/categoryService';
import { useFormErrorHandler } from '../hooks/useFormErrorHandler';
import { TrendingDown } from 'lucide-react';
import type {
    MispricedProductAlertDTO,
    Paginated
} from '../types/api/dashboardInterface';
import type { LocationForDropdownDTO } from '../types/api/locationInterface';
import type { CategoryForDropdownDTO } from '../types/api/categoryInterface';

import MispricedProductFilterPanel from '../components/ui/filterPanels/MispricedProductFilterPanel';
import EnhancedPaginationControls from '../components/ui/pagination/EnhancedPaginationControls.tsx';

interface MispricedProductsPageProps {
    onNavigate: (page: string) => void;
}

const MispricedProductsPage: React.FC<MispricedProductsPageProps> = ({ onNavigate }) => {
    // FILTER STATE
    const [thresholdPercentage, setThresholdPercentage] = useState(20);
    const [nameOrCodeFilter, setNameOrCodeFilter] = useState('');
    const [categoryIdFilter, setCategoryIdFilter] = useState<number | undefined>(undefined);
    const [issueTypeFilter, setIssueTypeFilter] = useState('');
    const [locationIdFilter, setLocationIdFilter] = useState<number | undefined>(undefined);

    // PAGINATION STATE
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [sortBy, setSortBy] = useState('priceDifferencePercentage');
    const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('DESC');

    // DATA STATE
    const [searchResults, setSearchResults] = useState<Paginated<MispricedProductAlertDTO> | null>(null);
    const [loading, setLoading] = useState(false);
    const [locations, setLocations] = useState<LocationForDropdownDTO[]>([]);
    const [categories, setCategories] = useState<CategoryForDropdownDTO[]>([]);

    // ERROR HANDLING
    const { generalError, handleApiError, clearErrors } = useFormErrorHandler();

    // LOAD DROPDOWN DATA
    useEffect(() => {
        const loadDropdownData = async () => {
            try {
                const [locationsData, categoriesData] = await Promise.all([
                    locationService.getActiveLocationsForDropdown(),
                    categoryService.getCategoriesForDropdown()
                ]);
                setLocations(locationsData);
                setCategories(categoriesData);
            } catch (err) {
                console.error('Failed to load dropdown data:', err);
            }
        };

        loadDropdownData();
    }, []);

    // LOAD DATA FUNCTION
    const loadData = async () => {
        try {
            setLoading(true);
            clearErrors();

            const params = {
                thresholdPercentage,
                nameOrCode: nameOrCodeFilter || undefined,
                categoryId: categoryIdFilter || undefined,
                issueType: issueTypeFilter || undefined,
                locationId: locationIdFilter || undefined,
                page: currentPage,
                pageSize: pageSize,
                sortBy: sortBy,
                sortDirection: sortDirection
            };

            // Create clean params object (remove empty filters)
            const cleanParams = Object.fromEntries(
                Object.entries(params).filter(([, value]) =>
                    value !== '' && value !== null && value !== undefined
                )
            );

            const response = await dashboardService.getAllMispricedProducts(cleanParams);
            setSearchResults(response);

        } catch (err) {
            handleApiError(err, 'Failed to load mispriced products');
        } finally {
            setLoading(false);
        }
    };

    // EFFECT TO LOAD DATA
    useEffect(() => {
        loadData();
    }, [currentPage, pageSize, sortBy, sortDirection, thresholdPercentage, issueTypeFilter, categoryIdFilter, locationIdFilter]);

    // Debounced search for text filters
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            setCurrentPage(0); // Reset to first page when filtering
            loadData();
        }, 500);

        return () => clearTimeout(debounceTimer);
    }, [nameOrCodeFilter]);

    // PAGINATION HANDLERS
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize);
        setCurrentPage(0); // Reset to first page when changing page size
    };

    // FILTER HANDLERS
    const handleClearFilters = () => {
        setNameOrCodeFilter('');
        setThresholdPercentage(20);
        setIssueTypeFilter('');
        setCategoryIdFilter(undefined);
        setLocationIdFilter(undefined);
        setCurrentPage(0);
    };

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortDirection(sortDirection === 'ASC' ? 'DESC' : 'ASC');
        } else {
            setSortBy(field);
            setSortDirection('ASC');
        }
    };

    return (
        <div className="min-h-screen p-4 space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-600 to-red-700 rounded-xl p-6 text-white shadow-lg">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <TrendingDown className="w-8 h-8" />
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold">Προϊόντα με Λάθος Τιμή</h1>
                            <p className="text-orange-100 mt-1">Προϊόντα με σημαντικές διαφορές τιμολόγησης</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3 mt-4 md:mt-0">
                        <h3 className="text-lg font-bold text-white">Φίλτρα Αναζήτησης</h3>
                    </div>
                    <Button
                        onClick={() => onNavigate('dashboard')}
                        variant="secondary"
                        size="lg"
                        className="w-full md:w-auto mt-4 md:mt-0"
                    >
                        ← Επιστροφή στο Dashboard
                    </Button>
                </div>
            </div>

            {/* Error Display */}
            {generalError && (
                <Alert
                    variant="error"
                    onClose={clearErrors}
                />
            )}

            {/* Filter Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                <CustomCard className="shadow-lg">
                    <MispricedProductFilterPanel
                        // Filter values
                        thresholdPercentage={thresholdPercentage}
                        onThresholdPercentageChange={setThresholdPercentage}
                        nameOrCodeFilter={nameOrCodeFilter}
                        onNameOrCodeFilterChange={setNameOrCodeFilter}
                        categoryIdFilter={categoryIdFilter}
                        onCategoryIdFilterChange={setCategoryIdFilter}
                        categories={categories}
                        issueTypeFilter={issueTypeFilter}
                        onIssueTypeFilterChange={setIssueTypeFilter}
                        locationIdFilter={locationIdFilter}
                        onLocationIdFilterChange={setLocationIdFilter}
                        locations={locations}

                        // Results and actions
                        searchResults={searchResults?.data || []}
                        loading={loading}
                        onClearFilters={handleClearFilters}
                        onRefresh={loadData}
                        onSort={handleSort}
                        sortBy={sortBy}
                        sortDirection={sortDirection}
                        onNavigateToProduct={(productId: number) => onNavigate(`product-details-${productId}`)}
                    />
                </CustomCard>

                {/* Pagination */}
                {searchResults && searchResults.totalElements > 0 && (
                    <CustomCard title="" className="shadow-lg">
                        <div className="w-full overflow-x-auto">
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
                        </div>
                    </CustomCard>
                )}
            </div>
        </div>
    );
};

export default MispricedProductsPage;