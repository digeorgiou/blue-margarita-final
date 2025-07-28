import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import { procedureService } from '../services/procedureService';
import { categoryService } from '../services/categoryService';
import { materialService } from '../services/materialService';
import { Button, LoadingSpinner, Input, Alert } from '../components/ui';
import DashboardCard from '../components/ui/DashboardCard';
import SearchDropdown from '../components/ui/searchDropdowns/SearchDropdown.tsx'
import {
    Package,
    Plus,
    Minus,
    Trash2,
    Settings,
    ArrowLeft,
    Save,
    Euro,
    Ruler,
    Clock
} from 'lucide-react';
import { useFormErrorHandler } from '../hooks/useFormErrorHandler';
import type {
    ProductInsertDTO,
    ProductMaterialDetailDTO,
    ProductProcedureDetailDTO
} from '../types/api/productInterface';
import type { MaterialSearchResultDTO } from '../types/api/materialInterface';
import type { ProcedureForDropdownDTO } from '../types/api/procedureInterface';
import type { CategoryForDropdownDTO } from '../types/api/categoryInterface';

interface CreateProductPageProps {
    onNavigate: (page: string) => void;
}

interface PriceCalculation {
    materialCost: number;
    laborCost: number;
    procedureCost: number;
    totalCost: number;
    suggestedRetailPrice: number;
    suggestedWholesalePrice: number;
}

// Constants matching backend exactly
const HOURLY_LABOR_RATE = 7.0;
const MINUTES_PER_HOUR = 60.0;
const RETAIL_MARKUP_FACTOR = 3.0;
const WHOLESALE_MARKUP_FACTOR = 1.86;

const CreateProductPage: React.FC<CreateProductPageProps> = ({ onNavigate }) => {
    // Loading and error states
    const [submitting, setSubmitting] = useState(false);
    const { fieldErrors, generalError, handleApiError, clearErrors, clearFieldError } = useFormErrorHandler();

    // Form data
    const [productName, setProductName] = useState('');
    const [productCode, setProductCode] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);
    const [stock, setStock] = useState<number>(0);
    const [lowStockAlert, setLowStockAlert] = useState<number>(5);
    const [minutesToMake, setMinutesToMake] = useState<number>(0);
    const [finalSellingPriceRetail, setFinalSellingPriceRetail] = useState<number>(0);
    const [finalSellingPriceWholesale, setFinalSellingPriceWholesale] = useState<number>(0);

    // Dropdown data
    const [categories, setCategories] = useState<CategoryForDropdownDTO[]>([]);

    // Selected materials and procedures
    const [selectedMaterials, setSelectedMaterials] = useState<ProductMaterialDetailDTO[]>([]);
    const [selectedProcedures, setSelectedProcedures] = useState<ProductProcedureDetailDTO[]>([]);

    // Search states for materials
    const [materialSearchTerm, setMaterialSearchTerm] = useState('');
    const [materialSearchResults, setMaterialSearchResults] = useState<MaterialSearchResultDTO[]>([]);
    const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);

    // Search states for procedures
    const [procedureSearchTerm, setProcedureSearchTerm] = useState('');
    const [filteredProcedures, setFilteredProcedures] = useState<ProcedureForDropdownDTO[]>([]);
    const [isLoadingProcedures, setIsLoadingProcedures] = useState(false);

    // Price calculation
    const [priceCalculation, setPriceCalculation] = useState<PriceCalculation>({
        materialCost: 0,
        laborCost: 0,
        procedureCost: 0,
        totalCost: 0,
        suggestedRetailPrice: 0,
        suggestedWholesalePrice: 0
    });

    // Load categories on component mount
    useEffect(() => {
        loadCategories();
    }, []);

    // Recalculate prices when materials, procedures, or minutesToMake change
    useEffect(() => {
        calculatePrices();
    }, [selectedMaterials, selectedProcedures, minutesToMake]);

    const loadCategories = async () => {
        try {
            const categoriesData = await categoryService.getCategoriesForDropdown();
            setCategories(categoriesData);
        } catch (err) {
            console.error('Error loading categories:', err);
        }
    };

    const calculatePrices = () => {
        // Calculate material cost
        const materialCost = selectedMaterials.reduce((total, material) =>
            total + (material.unitCost * material.quantity), 0
        );

        // Calculate procedure cost
        const procedureCost = selectedProcedures.reduce((total, procedure) =>
            total + procedure.cost, 0
        );

        // Calculate labor cost based on minutes to make
        const laborCost = minutesToMake > 0
            ? (minutesToMake / MINUTES_PER_HOUR) * HOURLY_LABOR_RATE
            : 0;

        // Calculate total cost
        const totalCost = materialCost + laborCost + procedureCost;

        // Calculate suggested prices using markup factors
        const suggestedRetailPrice = totalCost * RETAIL_MARKUP_FACTOR;
        const suggestedWholesalePrice = totalCost * WHOLESALE_MARKUP_FACTOR;

        // Update state with all calculations
        setPriceCalculation({
            materialCost,
            laborCost,
            procedureCost,
            totalCost,
            suggestedRetailPrice,
            suggestedWholesalePrice
        });
    };

    // Material search
    const searchMaterials = async (term: string): Promise<void> => {
        if (term.length < 2) {
            setMaterialSearchResults([]);
            return;
        }

        setIsLoadingMaterials(true);
        try {
            const results = await materialService.searchMaterialsForAutocomplete(term);
            setMaterialSearchResults(results);
        } catch (err) {
            console.error('Material search error:', err);
            setMaterialSearchResults([]);
        } finally {
            setIsLoadingMaterials(false);
        }
    };

    // Procedure search
    const searchProcedures = async (term: string): Promise<void> => {
        if (term.length < 2) {
            setFilteredProcedures([]);
            return;
        }

        setIsLoadingProcedures(true);
        try {
            const results = await procedureService.searchProceduresForAutocomplete(term);
            setFilteredProcedures(results);
        } catch (err) {
            console.error('Procedure search error:', err);
            setFilteredProcedures([]);
        } finally {
            setIsLoadingProcedures(false);
        }
    };

    // Add material to selection
    const addMaterial = (material: MaterialSearchResultDTO) => {
        // Check if material is already selected
        if (selectedMaterials.some(m => m.materialId === material.materialId)) {
            return;
        }

        const newMaterial: ProductMaterialDetailDTO = {
            materialId: material.materialId,
            materialName: material.materialName,
            quantity: 1, // Default quantity
            unitOfMeasure: material.unitOfMeasure,
            unitCost: material.currentUnitCost,
            totalCost: material.currentUnitCost
        };

        setSelectedMaterials(prev => [...prev, newMaterial]);
    };

    // Update material quantity
    const updateMaterialQuantity = (materialId: number, newQuantity: number) => {
        if (newQuantity <= 0) {
            removeMaterial(materialId);
            return;
        }

        setSelectedMaterials(prev =>
            prev.map(material =>
                material.materialId === materialId
                    ? {
                        ...material,
                        quantity: newQuantity,
                        totalCost: material.unitCost * newQuantity
                    }
                    : material
            )
        );
    };

    // Remove material
    const removeMaterial = (materialId: number) => {
        setSelectedMaterials(prev => prev.filter(m => m.materialId !== materialId));
    };

    // Add procedure to selection
    const addProcedure = (procedure: ProcedureForDropdownDTO) => {
        // Check if procedure is already selected
        if (selectedProcedures.some(p => p.procedureId === procedure.id)) {
            return;
        }

        const newProcedure: ProductProcedureDetailDTO = {
            procedureId: procedure.id,
            procedureName: procedure.name,
            cost: 0 // User will set the cost
        };

        setSelectedProcedures(prev => [...prev, newProcedure]);
    };

    // Update procedure cost
    const updateProcedureCost = (procedureId: number, newCost: number) => {
        setSelectedProcedures(prev =>
            prev.map(procedure =>
                procedure.procedureId === procedureId
                    ? { ...procedure, cost: Math.max(0, newCost) }
                    : procedure
            )
        );
    };

    // Remove procedure
    const removeProcedure = (procedureId: number) => {
        setSelectedProcedures(prev => prev.filter(p => p.procedureId !== procedureId));
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!productName.trim() || !productCode.trim() || !selectedCategoryId) {
            return;
        }

        setSubmitting(true);
        clearErrors();

        try {
            // Convert selected materials to the format expected by ProductInsertDTO
            const materials: { [materialId: number]: number } = {};
            selectedMaterials.forEach(material => {
                materials[material.materialId] = material.quantity;
            });

            // Convert selected procedures to the format expected by ProductInsertDTO
            const procedures: { [procedureId: number]: number } = {};
            selectedProcedures.forEach(procedure => {
                procedures[procedure.procedureId] = procedure.cost;
            });

            const productData: ProductInsertDTO = {
                name: productName.trim(),
                code: productCode.trim(),
                categoryId: selectedCategoryId,
                finalSellingPriceRetail: finalSellingPriceRetail || undefined,
                finalSellingPriceWholesale: finalSellingPriceWholesale || undefined,
                minutesToMake: minutesToMake || undefined,
                stock: stock || undefined,
                lowStockAlert: lowStockAlert || undefined,
                creatorUserId: 1, // Replace with actual user ID
                materials: Object.keys(materials).length > 0 ? materials : undefined,
                procedures: Object.keys(procedures).length > 0 ? procedures : undefined
            };

            await productService.createProduct(productData);
            onNavigate('manage-products');
        } catch (err) {
            await handleApiError(err);
        } finally {
            setSubmitting(false);
        }
    };

    // Transform search results for the dropdown components
    const transformedMaterialResults = materialSearchResults.map(material => ({
        id: material.materialId,
        name: material.materialName,
        subtitle: material.unitOfMeasure,
        additionalInfo: `€${material.currentUnitCost.toFixed(2)}`
    }));

    const transformedProcedureResults = filteredProcedures.map(procedure => ({
        id: procedure.id,
        name: procedure.name,
        subtitle: "Manufacturing Process"
    }));

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <Button
                            onClick={() => onNavigate('manage-products')}
                            variant="outline-secondary"
                            className="flex items-center"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Products
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Create New Product</h1>
                            <p className="text-gray-600 mt-1">Add a new jewelry product to your inventory</p>
                        </div>
                    </div>
                </div>

                {/* Error Display */}
                {generalError && (
                    <Alert variant="error" className="mb-6">
                        {generalError}
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        {/* Left Column - Basic Info */}
                        <div className="xl:col-span-1 space-y-6">
                            {/* Basic Product Information */}
                            <DashboardCard title="Basic Information" className="space-y-4">
                                <Input
                                    label="Product Name *"
                                    type="text"
                                    value={productName}
                                    onChange={(e) => {
                                        setProductName(e.target.value);
                                        clearFieldError('name');
                                    }}
                                    placeholder="Enter product name..."
                                    error={fieldErrors.name}
                                    required
                                />

                                <Input
                                    label="Product Code *"
                                    type="text"
                                    value={productCode}
                                    onChange={(e) => {
                                        setProductCode(e.target.value);
                                        clearFieldError('code');
                                    }}
                                    placeholder="Enter unique product code..."
                                    error={fieldErrors.code}
                                    required
                                />

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category *
                                    </label>
                                    <select
                                        value={selectedCategoryId || ''}
                                        onChange={(e) => {
                                            setSelectedCategoryId(e.target.value ? Number(e.target.value) : undefined);
                                            clearFieldError('categoryId');
                                        }}
                                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="">Select a category...</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                    {fieldErrors.categoryId && (
                                        <p className="text-red-500 text-sm mt-1">{fieldErrors.categoryId}</p>
                                    )}
                                </div>
                            </DashboardCard>

                            {/* Inventory Information */}
                            <DashboardCard title="Inventory" className="space-y-4">
                                <Input
                                    label="Initial Stock"
                                    type="number"
                                    value={stock}
                                    onChange={(e) => setStock(Number(e.target.value))}
                                    placeholder="0"
                                    min="0"
                                />

                                <Input
                                    label="Low Stock Alert"
                                    type="number"
                                    value={lowStockAlert}
                                    onChange={(e) => setLowStockAlert(Number(e.target.value))}
                                    placeholder="5"
                                    min="0"
                                />

                                <Input
                                    label="Minutes to Make"
                                    type="number"
                                    value={minutesToMake}
                                    onChange={(e) => setMinutesToMake(Number(e.target.value))}
                                    placeholder="0"
                                    min="0"
                                    icon={<Clock className="w-4 h-4" />}
                                />
                            </DashboardCard>
                        </div>

                        {/* Middle Column - Materials and Procedures */}
                        <div className="xl:col-span-1 space-y-6">
                            {/* Materials */}
                            <DashboardCard title="Materials" className="space-y-4">
                                <SearchDropdown
                                    searchTerm={materialSearchTerm}
                                    onSearchTermChange={(term : string) => {
                                        setMaterialSearchTerm(term);
                                        searchMaterials(term);
                                    }}
                                    searchResults={transformedMaterialResults}
                                    onSelect={(item: { id: number; name: string; subtitle?: string; additionalInfo?: string }) => {
                                        const material = materialSearchResults.find(m => m.materialId === item.id);
                                        if (material) {
                                            addMaterial(material); // material is MaterialSearchResultDTO
                                            setMaterialSearchTerm('');
                                            setMaterialSearchResults([]);
                                        }
                                    }}
                                    placeholder="Search materials..."
                                    label="Add Materials"
                                    icon={<Package className="w-5 h-5 text-blue-500" />}
                                    isLoading={isLoadingMaterials}
                                    emptyMessage="No materials found"
                                    emptySubMessage="Try searching with different keywords"
                                    renderItem={(item: { id: number; name: string; subtitle?: string; additionalInfo?: string }) => (
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
                                                {item.name}
                                            </div>
                                            <div className="text-sm text-gray-500 mt-0.5 flex items-center space-x-2">
                                                <span className="flex items-center">
                                                    <Ruler className="w-3 h-3 mr-1" />
                                                    {item.subtitle}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    renderAdditionalInfo={(item: { id: number; name: string; subtitle?: string; additionalInfo?: string }) => (
                                        <div className="flex flex-col items-end space-y-1">
                                            <div className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-md">
                                                {item.additionalInfo}
                                            </div>
                                            <div className="text-xs text-gray-400">per unit</div>
                                        </div>
                                    )}
                                />

                                {/* Selected Materials */}
                                {selectedMaterials.length > 0 && (
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        <h4 className="text-sm font-semibold text-gray-700">Selected Materials</h4>
                                        {selectedMaterials.map((material) => (
                                            <div key={material.materialId} className="p-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-medium text-gray-900">{material.materialName}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeMaterial(material.materialId)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => updateMaterialQuantity(material.materialId, material.quantity - 1)}
                                                        className="p-1 text-gray-500 hover:text-gray-700"
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <span className="px-3 py-1 bg-white rounded border text-center min-w-[3rem]">
                                                        {material.quantity} {material.unitOfMeasure}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateMaterialQuantity(material.materialId, material.quantity + 1)}
                                                        className="p-1 text-gray-500 hover:text-gray-700"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                    <span className="ml-auto text-sm text-gray-600">
                                                        €{material.totalCost.toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </DashboardCard>

                            {/* Procedures */}
                            <DashboardCard title="Procedures" className="space-y-4">
                                <SearchDropdown
                                    searchTerm={procedureSearchTerm}
                                    onSearchTermChange={(term : string) => {
                                        setProcedureSearchTerm(term);
                                        searchProcedures(term);
                                    }}
                                    searchResults={transformedProcedureResults}
                                    onSelect={(item: { id: number; name: string; subtitle?: string; additionalInfo?: string }) => {
                                        const procedure = filteredProcedures.find(p => p.id === item.id);
                                        if (procedure) {
                                            addProcedure(procedure); // procedure is ProcedureForDropdownDTO
                                            setProcedureSearchTerm('');
                                            setFilteredProcedures([]);
                                        }
                                    }}
                                    placeholder="Search procedures..."
                                    label="Add Procedures"
                                    icon={<Settings className="w-5 h-5 text-purple-500" />}
                                    isLoading={isLoadingProcedures}
                                    emptyMessage="No procedures found"
                                    emptySubMessage="Try searching with different keywords"
                                    renderItem={(item: { id: number; name: string; subtitle?: string; additionalInfo?: string }) => (
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900 group-hover:text-purple-700 transition-colors">
                                                {item.name}
                                            </div>
                                            <div className="text-sm text-gray-500 mt-0.5">
                                                {item.subtitle}
                                            </div>
                                        </div>
                                    )}
                                    renderAdditionalInfo={(item: { id: number; name: string; subtitle?: string; additionalInfo?: string }) => (
                                        <div className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-md">
                                            {item.additionalInfo}
                                        </div>
                                    )}
                                />

                                {/* Selected Procedures */}
                                {selectedProcedures.length > 0 && (
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        <h4 className="text-sm font-semibold text-gray-700">Selected Procedures</h4>
                                        {selectedProcedures.map((procedure) => (
                                            <div key={procedure.procedureId} className="p-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-medium text-gray-900">{procedure.procedureName}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeProcedure(procedure.procedureId)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Euro className="w-4 h-4 text-gray-400" />
                                                    <input
                                                        type="number"
                                                        value={procedure.cost}
                                                        onChange={(e) => updateProcedureCost(procedure.procedureId, Number(e.target.value))}
                                                        placeholder="Enter cost..."
                                                        className="flex-1 p-2 border border-gray-200 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                        min="0"
                                                        step="0.01"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </DashboardCard>
                        </div>

                        {/* Right Column - Pricing */}
                        <div className="xl:col-span-1 space-y-6">
                            {/* Price Calculation */}
                            <DashboardCard title="Price Calculation" className="space-y-4">
                                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span>Material Cost:</span>
                                        <span className="font-medium">€{priceCalculation.materialCost.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Labor Cost:</span>
                                        <span className="font-medium">€{priceCalculation.laborCost.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Procedure Cost:</span>
                                        <span className="font-medium">€{priceCalculation.procedureCost.toFixed(2)}</span>
                                    </div>
                                    <div className="border-t pt-2">
                                        <div className="flex justify-between font-semibold">
                                            <span>Total Cost:</span>
                                            <span>€{priceCalculation.totalCost.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-green-50 p-4 rounded-lg space-y-3">
                                    <h4 className="font-semibold text-green-800">Suggested Prices</h4>
                                    <div className="flex justify-between text-sm">
                                        <span>Suggested Retail:</span>
                                        <span className="font-medium text-green-700">€{priceCalculation.suggestedRetailPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Suggested Wholesale:</span>
                                        <span className="font-medium text-green-700">€{priceCalculation.suggestedWholesalePrice.toFixed(2)}</span>
                                    </div>
                                </div>
                            </DashboardCard>

                            {/* Final Pricing */}
                            <DashboardCard title="Final Pricing" className="space-y-4">
                                <Input
                                    label="Final Retail Price"
                                    type="number"
                                    value={finalSellingPriceRetail}
                                    onChange={(e) => setFinalSellingPriceRetail(Number(e.target.value))}
                                    placeholder={priceCalculation.suggestedRetailPrice.toFixed(2)}
                                    min="0"
                                    step="0.01"
                                    icon={<Euro className="w-4 h-4" />}
                                />

                                <Input
                                    label="Final Wholesale Price"
                                    type="number"
                                    value={finalSellingPriceWholesale}
                                    onChange={(e) => setFinalSellingPriceWholesale(Number(e.target.value))}
                                    placeholder={priceCalculation.suggestedWholesalePrice.toFixed(2)}
                                    min="0"
                                    step="0.01"
                                    icon={<Euro className="w-4 h-4" />}
                                />
                            </DashboardCard>

                            {/* Submit Button */}
                            <DashboardCard className="text-center">
                                <div className="space-y-3">
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        className="w-full"
                                        disabled={submitting}
                                    >
                                        {submitting ? (
                                            <>
                                                <LoadingSpinner />
                                                <span className="ml-2">Creating...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                Create Product
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => onNavigate('manage-products')}
                                        variant="outline-secondary"
                                        className="w-full"
                                        disabled={submitting}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </DashboardCard>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateProductPage;