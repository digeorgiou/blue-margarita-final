import React from 'react';
import {Calendar, Eye, Edit, Trash2, ShoppingCart, Truck, Package, Filter} from 'lucide-react';
import { Button, LoadingSpinner } from '../index';
import { CustomSearchDropdown, CustomDateInput } from '../inputs';
import type { PurchaseReadOnlyDTO } from '../../../types/api/purchaseInterface';
import { FaEuroSign } from "react-icons/fa6";
import { PurchaseFilterPanelProps } from "../../../types/components/filterPanel-types.ts";

const PurchaseFilterPanel: React.FC<PurchaseFilterPanelProps> = ({
                                                                     supplierSearchTerm,
                                                                     onSupplierSearchTermChange,
                                                                     supplierSearchResults,
                                                                     selectedSupplier,
                                                                     onSupplierSelect,
                                                                     loadingSuppliers,
                                                                     materialSearchTerm,
                                                                     onMaterialSearchTermChange,
                                                                     materialSearchResults,
                                                                     selectedMaterial,
                                                                     onMaterialSelect,
                                                                     loadingMaterials,
                                                                     dateFromFilter,
                                                                     onDateFromFilterChange,
                                                                     dateToFilter,
                                                                     onDateToFilterChange,
                                                                     searchResults,
                                                                     loading,
                                                                     onViewDetails,
                                                                     onEdit,
                                                                     onDelete,
                                                                     children
                                                                 }) => {

    const clearFilters = () => {
        onSupplierSelect(null);
        onMaterialSelect(null);
        onDateFromFilterChange('');
        onDateToFilterChange('');
    };

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('el-GR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('el-GR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Transform customer data to match SearchResult interface
    const transformedSupplierResults = supplierSearchResults.map(supplier => ({
        id: supplier.id,
        name: supplier.supplierName,
        subtitle: supplier.email,
        additionalInfo: supplier.phoneNumber
    }));

    // Transform product data to match SearchResult interface
    const transformedMaterialResults = materialSearchResults.map(material => ({
        id: material.materialId,
        name: material.materialName,
        subtitle: `Μονάδα μέτρησης: ${material.unitOfMeasure}`,
        additionalInfo: `Κόστος: ${material.currentUnitCost}`
    }));

    // Transform selected items for display
    const selectedSupplierForDropdown = selectedSupplier ? {
        id: selectedSupplier.id,
        name: selectedSupplier.supplierName,
        subtitle: selectedSupplier.email,
        additionalInfo: selectedSupplier.phoneNumber
    } : null;

    const selectedMaterialForDropdown = selectedMaterial ? {
        id: selectedMaterial.materialId,
        name: selectedMaterial.materialName,
        subtitle: `Μονάδα μέτρησης: ${selectedMaterial.unitOfMeasure}`,
        additionalInfo: `Κόστος: ${selectedMaterial.currentUnitCost}`
    } : null;

    const generatePurchaseTitle = (purchase: PurchaseReadOnlyDTO): string => {
        if(!purchase.materials || purchase.materials.length === 0) {
            return `Αγορά #${purchase.id}`;
        }
        if(purchase.materials.length === 1){
            const material = purchase.materials[0];
            return `${material.materialName}(x${material.quantity})`
        }
        const firstMaterial = purchase.materials[0];
        const remainingCount = purchase.materials.length - 1;

        if (remainingCount === 1) {
            return `${firstMaterial.materialName}  (×${firstMaterial.quantity}) + 1 ακόμα)`;
        } else {
            return `${firstMaterial.materialName}  (×${firstMaterial.quantity}) + ${remainingCount} ακόμα)`;
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                {/* Search Filters Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Supplier Search */}
                        <CustomSearchDropdown
                            label="Προμηθευτής"
                            searchTerm={supplierSearchTerm}
                            onSearchTermChange={onSupplierSearchTermChange}
                            searchResults={transformedSupplierResults}
                            onSelect={(supplier) =>  onSupplierSelect(
                              supplierSearchResults.find(s => s.supplierId ===  supplier.id) || null
                            )}
                            selectedItem={selectedSupplierForDropdown}
                            onClearSelection={() => onSupplierSelect(null)}
                            placeholder="Αναζήτηση προμηθευτή..."
                            entityType="supplier"
                            isLoading={loadingSuppliers}
                        />

                    {/* Material Search */}
                        <CustomSearchDropdown
                            label="Υλικό"
                            searchTerm={materialSearchTerm}
                            onSearchTermChange={onMaterialSearchTermChange}
                            searchResults={transformedMaterialResults}
                            onSelect={(material) => onMaterialSelect(
                                materialSearchResults.find(m => m.materialId === material.id) || null
                            )}
                            selectedItem={selectedMaterialForDropdown}
                            onClearSelection={() => onMaterialSelect(null)}
                            placeholder="Αναζήτηση υλικού..."
                            entityType="material"
                            isLoading={loadingMaterials}
                        />
                </div>

                {/* Date Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <CustomDateInput
                        label="Από Ημερομηνία"
                        value={dateFromFilter}
                        onChange={onDateFromFilterChange}
                        icon={<Calendar className="w-5 h-5 text-blue-500" />}
                    />

                    <CustomDateInput
                        label="Από Ημερομηνία"
                        value={dateToFilter}
                        onChange={onDateToFilterChange}
                        icon={<Calendar className="w-5 h-5 text-blue-500" />}
                    />

                    <div className="flex items-end">
                        <Button
                            onClick={clearFilters}
                            variant="pink"
                            className="w-full h-13"
                        >
                            <Filter className="w-5 h-5 mr-2" />
                            Καθαρισμός Φίλτρων
                        </Button>
                    </div>

                </div>
            </div>

            {/* Children section - Summary Card will be rendered here */}
            {children && (
                <div>
                    {children}
                </div>
            )}

            {/* RESULTS SECTION  */}
            <div className="bg-white rounded-lg border border-gray-200">
                {loading ? (
                    <div className="flex items-center justify-center p-8">
                        <LoadingSpinner />
                        <span className="ml-3 text-gray-600">Αναζήτηση αγορών...</span>
                    </div>
                ) : searchResults.length === 0 ? (
                    <div className="text-center py-12">
                        <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Δεν βρέθηκαν αγορές</h3>
                        <p className="text-gray-500">Δοκιμάστε να προσαρμόσετε τα φίλτρα σας</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {searchResults.map((purchase) => (
                            <div
                                key={purchase.id}
                                className="p-6 hover:bg-blue-100 transition-colors duration-150"
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                                    <div className="flex-1">
                                        {/* Header with Title, Date */}
                                        <div className="flex flex-wrap items-center gap-3 mb-3">
                                            <ShoppingCart className="w-5 h-5 text-blue-500" />
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {generatePurchaseTitle(purchase)}
                                            </h3>
                                            <span className="bg-blue-200 text-black px-2 py-1 rounded-full text-sm">
                                                {formatDate(purchase.purchaseDate)}
                                            </span>
                                        </div>

                                        {/* Two Columns - Stack on mobile, side-by-side on desktop */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                            {/* First Column: Supplier, Items Count */}
                                            <div className="space-y-2">
                                                <div className="flex items-center">
                                                    <Truck className="w-4 h-4 mr-2 text-gray-400" />
                                                    <span>{purchase.supplierName}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <Package className="w-4 h-4 mr-2 text-gray-400" />
                                                    <span>{purchase.itemCount}{purchase.itemCount > 1 ? " υλικά" : " υλικό"}</span>
                                                </div>
                                            </div>

                                            {/* Second Column: Total Cost */}
                                            <div className="space-y-2">
                                                <div className="flex items-center text-blue-600">
                                                    <FaEuroSign className="w-4 h-4 mr-1" />
                                                    <span className="font-semibold">Συνολικό Κόστος: {formatCurrency(purchase.totalCost)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center justify-center gap-2 lg:min-w-fit">
                                        <Button
                                            onClick={() => onViewDetails(purchase)}
                                            variant="info"
                                            size="sm"
                                            className="w-full sm:w-auto"
                                        >
                                            <Eye className="w-4 h-4 mr-1" />
                                            Προβολή
                                        </Button>
                                        <Button
                                            onClick={() => onEdit(purchase)}
                                            variant="teal"
                                            size="sm"
                                            className="w-full sm:w-auto"
                                        >
                                            <Edit className="w-4 h-4 mr-1" />
                                            Επεξεργασία
                                        </Button>
                                        <Button
                                            onClick={() => onDelete(purchase)}
                                            variant="danger"
                                            size="sm"
                                            className="w-full sm:w-auto"
                                        >
                                            <Trash2 className="w-4 h-4 mr-1" />
                                            Διαγραφή
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PurchaseFilterPanel;