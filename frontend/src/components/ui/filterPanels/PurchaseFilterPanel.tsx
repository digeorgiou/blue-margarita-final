import React from 'react';
import {Calendar, Eye, Edit, Trash2, ShoppingCart, Truck, Package, Filter} from 'lucide-react';
import { Button, LoadingSpinner } from '../index';
import { CustomSearchDropdown, CustomDateInput } from '../inputs';
import type { PurchaseReadOnlyDTO } from '../../../types/api/purchaseInterface';
import { FaEuroSign } from "react-icons/fa6";
import { PurchaseFilterPanelProps } from "../../../types/components/filterPanel-types.ts";
import { transformSuppliersForDropdown, transformSelectedSupplierForDropdown, transformMaterialsForDropdown, transformSelectedMaterialForDropdown } from "../../../utils/searchDropdownTransformations.ts";
import { PurchaseCard } from '../resultCards';

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
    const transformedSupplierResults = transformSuppliersForDropdown(supplierSearchResults);

    // Transform product data to match SearchResult interface
    const transformedMaterialResults = transformMaterialsForDropdown(materialSearchResults);

    // Transform selected items for display
    const selectedSupplierForDropdown = transformSelectedSupplierForDropdown(selectedSupplier);

    const selectedMaterialForDropdown = transformSelectedMaterialForDropdown(selectedMaterial);

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
            <div>
                {loading ? (
                    <div className="bg-white flex items-center justify-center p-8">
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
                    <div className="space-y-4">
                        {searchResults.map((purchase) => (
                            <PurchaseCard
                                key={purchase.id}
                                purchase={purchase}
                                onViewDetails={onViewDetails}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PurchaseFilterPanel;