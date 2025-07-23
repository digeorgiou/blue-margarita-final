import React, { useState, useEffect } from 'react';
import { dashboardService } from "../../../services/dashboardService.ts";
import { Button, Card, LoadingSpinner, Input } from "../"
import { getPricingIssueTypeLabel } from "../../../types/api/dashboardInterface.ts";
import type { MispricedProductAlertDTO, Paginated } from "../../../types/api/dashboardInterface.ts";
import type { LocationForDropdownDTO } from "../../../types/api/locationInterface.ts";
import { authService } from "../../../services/authService.ts";

interface MispricedProductsListProps {
    onNavigate: (page: string) => void;
}

// Create a simple location service function
const getLocationsForDropdown = async (): Promise<LocationForDropdownDTO[]> => {
    try {
        const response = await fetch('/api/locations/dropdown', {
            method: 'GET',
            headers: authService.getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch locations: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Locations fetch error:', error);
        throw error;
    }
};

const MispricedProductsList: React.FC<MispricedProductsListProps> = ({ onNavigate }) => {
    const [data, setData] = useState<Paginated<MispricedProductAlertDTO> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [locations, setLocations] = useState<LocationForDropdownDTO[]>([]);

    // Filter states
    const [nameOrCodeFilter, setNameOrCodeFilter] = useState('');
    const [thresholdPercentage, setThresholdPercentage] = useState(20);
    const [issueTypeFilter, setIssueTypeFilter] = useState('');
    const [locationIdFilter, setLocationIdFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(20);
    const [sortBy, setSortBy] = useState('priceDifferencePercentage');
    const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('DESC');

    // Load locations on component mount
    useEffect(() => {
        const loadLocations = async () => {
            try {
                const locationsData = await getLocationsForDropdown();
                setLocations(locationsData);
            } catch (err) {
                console.error('Failed to load locations:', err);
                // Don't fail the whole component if locations fail
            }
        };
        loadLocations();
    }, []);

    // Format money function
    const formatMoney = (amount: number): string => {
        return `€${amount.toLocaleString('el-GR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    };

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = {
                nameOrCode: nameOrCodeFilter.trim() || undefined,
                thresholdPercentage: thresholdPercentage,
                issueType: issueTypeFilter || undefined,
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

            // DEBUG: Log the actual response structure
            console.log('Mispriced Products API Response:', response);
            console.log('Response type:', typeof response);
            console.log('Response keys:', Object.keys(response || {}));

            setData(response);

        } catch (err) {
            setError('Failed to load mispriced products');
            console.error('Mispriced products error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Load data when dependencies change
    useEffect(() => {
        loadData();
    }, [currentPage, sortBy, sortDirection, thresholdPercentage, issueTypeFilter]);

    // Debounced search for text filters
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            setCurrentPage(0); // Reset to first page when filtering
            loadData();
        }, 500);

        return () => clearTimeout(debounceTimer);
    }, [nameOrCodeFilter]);

    // Immediate load for number/dropdown filters
    useEffect(() => {
        setCurrentPage(0);
        loadData();
    }, [thresholdPercentage, issueTypeFilter, locationIdFilter]);

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortDirection(sortDirection === 'ASC' ? 'DESC' : 'ASC');
        } else {
            setSortBy(field);
            setSortDirection('ASC');
        }
    };

    const handleClearFilters = () => {
        setNameOrCodeFilter('');
        setThresholdPercentage(20);
        setIssueTypeFilter('');
        setLocationIdFilter('');
        setCurrentPage(0);
    };

    const hasNext = data !== null ? data.currentPage + 1 < data.totalPages : false;
    const hasPrevious = data !== null ? data.currentPage > 0 : false;

    if (loading) {
        return (
            <div className="min-h-screen p-4">
                <LoadingSpinner/>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen p-4">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-xl shadow-md p-8 text-center">
                        <div className="text-6xl mb-4">😵</div>
                        <h2 className="text-2xl font-bold text-red-600 mb-4">Oops! Something went wrong</h2>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <Button onClick={loadData} variant="primary">
                            Try Again
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8 border border-white/20">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">💰 Mispriced Products</h1>
                            <p className="text-gray-700 mt-1">Products with significant pricing differences</p>
                        </div>
                        <Button
                            onClick={() => onNavigate('dashboard')}
                            variant="secondary"
                        >
                            ← Back to Dashboard
                        </Button>
                    </div>

                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Product Name/Code
                            </label>
                            <Input
                                type="text"
                                value={nameOrCodeFilter}
                                onChange={(e) => setNameOrCodeFilter(e.target.value)}
                                placeholder="Search by name or code..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Location
                            </label>
                            <select
                                value={locationIdFilter}
                                onChange={(e) => setLocationIdFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">All Locations</option>
                                {locations.map((location) => (
                                    <option key={location.id} value={location.id}>
                                        {location.name}
                                    </option>
                                ))}
                            </select>
                            {locationIdFilter && (
                                <p className="text-xs text-orange-500 mt-1">
                                    Note: Location filter may need backend support
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Threshold %
                            </label>
                            <Input
                                type="number"
                                placeholder="20"
                                value={thresholdPercentage}
                                onChange={(e) => setThresholdPercentage(Number(e.target.value) || 20)}
                                min="0"
                                max="100"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Issue Type
                            </label>
                            <select
                                value={issueTypeFilter}
                                onChange={(e) => setIssueTypeFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">All Types</option>
                                <option value="RETAIL_UNDERPRICED">Retail Underpriced</option>
                                <option value="WHOLESALE_UNDERPRICED">Wholesale Underpriced</option>
                                <option value="BOTH_UNDERPRICED">Both Underpriced</option>
                            </select>
                        </div>
                    </div>

                    {/* Filter Actions */}
                    <div className="flex gap-2 mt-4">
                        <Button onClick={handleClearFilters} variant="secondary" size="sm">
                            Clear Filters
                        </Button>
                        <Button onClick={loadData} variant="outline-secondary" size="sm">
                            🔄 Refresh
                        </Button>
                    </div>
                </div>

                {/* Results */}
                <Card title={`Mispriced Products (${data?.totalElements || 0} total)`} icon="💰">
                    {data?.data && data.data.length > 0 ? (
                        <>
                            {/* Table Header - Desktop */}
                            <div
                                className="hidden md:grid md:grid-cols-6 gap-4 p-3 bg-gray-100 rounded-lg font-semibold text-gray-700 mb-4">
                                <button
                                    onClick={() => handleSort('name')}
                                    className="text-left hover:text-blue-600 transition-colors"
                                >
                                    Product Name {sortBy === 'name' && (sortDirection === 'ASC' ? '↑' : '↓')}
                                </button>
                                <button
                                    onClick={() => handleSort('productCode')}
                                    className="text-left hover:text-blue-600 transition-colors"
                                >
                                    Code {sortBy === 'productCode' && (sortDirection === 'ASC' ? '↑' : '↓')}
                                </button>
                                <div>Current Price</div>
                                <div>Suggested Price</div>
                                <button
                                    onClick={() => handleSort('priceDifferencePercentage')}
                                    className="text-left hover:text-blue-600 transition-colors"
                                >
                                    Difference
                                    % {sortBy === 'priceDifferencePercentage' && (sortDirection === 'ASC' ? '↑' : '↓')}
                                </button>
                                <div>Issue Type</div>
                            </div>

                            {/* Product List */}
                            <div className="space-y-4">
                                {data.data.map((product) => (
                                    <div key={product.productId}
                                         className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                                        {/* Desktop Layout */}
                                        <div className="hidden md:grid md:grid-cols-6 gap-4 p-4 items-center">
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{product.productName}</h3>
                                            </div>
                                            <div>
                                                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                                    {product.productCode}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-sm text-gray-900">
                                                    {formatMoney(product.suggestedRetailPrice)}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-green-600">
                                                    {formatMoney(product.suggestedRetailPrice)}
                                                </span>
                                            </div>
                                            <div>
                                                <span className={`font-bold text-lg ${
                                                    product.priceDifferencePercentage >= 50 ? 'text-red-600' :
                                                        product.priceDifferencePercentage >= 20 ? 'text-orange-600' : 'text-yellow-600'
                                                }`}>
                                                    {product.priceDifferencePercentage.toFixed(1)}%
                                                </span>
                                            </div>
                                            <div>
                                                <span
                                                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                                        product.issueType === 'BOTH_UNDERPRICED' ? 'bg-red-100 text-red-800' :
                                                            product.issueType === 'RETAIL_UNDERPRICED' ? 'bg-orange-100 text-orange-800' :
                                                                'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {getPricingIssueTypeLabel(product.issueType)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Mobile Layout */}
                                        <div className="md:hidden p-4 space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{product.productName}</h3>
                                                    <span
                                                        className="font-mono text-sm bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
                                                        {product.productCode}
                                                    </span>
                                                </div>
                                                <span className={`font-bold text-lg ${
                                                    product.priceDifferencePercentage >= 50 ? 'text-red-600' :
                                                        product.priceDifferencePercentage >= 20 ? 'text-orange-600' : 'text-yellow-600'
                                                }`}>
                                                    {product.priceDifferencePercentage.toFixed(1)}%
                                                </span>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Current Price:</span>
                                                    <span
                                                        className="font-medium">{formatMoney(product.suggestedRetailPrice)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Suggested Price:</span>
                                                    <span
                                                        className="font-medium text-green-600">{formatMoney(product.suggestedRetailPrice)}</span>
                                                </div>
                                            </div>

                                            <div className="flex justify-center">
                                                <span
                                                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                                        product.issueType === 'BOTH_UNDERPRICED' ? 'bg-red-100 text-red-800' :
                                                            product.issueType === 'RETAIL_UNDERPRICED' ? 'bg-orange-100 text-orange-800' :
                                                                'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {getPricingIssueTypeLabel(product.issueType)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                                <div className="text-sm text-gray-600">
                                    Page {data.currentPage + 1} of {data.totalPages} ({data.totalElements} total)
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => setCurrentPage(currentPage - 1)}
                                        disabled={!hasPrevious}
                                        variant="outline-secondary"
                                        size="sm"
                                    >
                                        ← Previous
                                    </Button>
                                    <Button
                                        onClick={() => setCurrentPage(currentPage + 1)}
                                        disabled={!hasNext}
                                        variant="outline-secondary"
                                        size="sm"
                                    >
                                        Next →
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">✅</div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Mispriced Products</h3>
                            <p className="text-gray-600">All products have appropriate pricing within the threshold.</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default MispricedProductsList;