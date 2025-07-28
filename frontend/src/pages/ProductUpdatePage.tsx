import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import { procedureService } from '../services/procedureService';
import { categoryService } from '../services/categoryService';
import { materialService } from '../services/materialService';
import { Button, LoadingSpinner, Input, Alert } from '../components/ui';
import DashboardCard from '../components/ui/DashboardCard';
import SearchDropdown from '../components/ui/searchDropdowns/SearchDropdown';
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
    Clock,
    RefreshCw
} from 'lucide-react';
import { useFormErrorHandler } from '../hooks/useFormErrorHandler';
import type {
    ProductUpdateDTO,
    ProductMaterialDetailDTO,
    ProductProcedureDetailDTO
} from '../types/api/productInterface';
import type { MaterialSearchResultDTO } from '../types/api/materialInterface';
import type { ProcedureForDropdownDTO } from '../types/api/procedureInterface';
import type { CategoryForDropdownDTO } from '../types/api/categoryInterface';

interface UpdateProductPageProps {
    productId: number;
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

const UpdateProductPage: React.FC<UpdateProductPageProps> = ({ productId, onNavigate }) => {
    // Loading and error states
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const { fieldErrors, generalError, handleApiError, clearErrors, clearFieldError } = useFormErrorHandler();

    // Form fields - using correct field names from ProductDetailedViewDTO
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [categoryId, setCategoryId] = useState<number | null>(null);
    const [minutesToMake, setMinutesToMake] = useState(0);
    const [finalRetailPrice, setFinalRetailPrice] = useState(0);
    const [finalWholesalePrice, setFinalWholesalePrice] = useState(0);
    const [currentStock, setCurrentStock] = useState(0);
    const [lowStockAlert, setLowStockAlert] = useState(0);

    // Materials and procedures
    const [selectedMaterials, setSelectedMaterials] = useState<ProductMaterialDetailDTO[]>([]);
    const [selectedProcedures, setSelectedProcedures] = useState<ProductProcedureDetailDTO[]>([]);

    // Dropdown data
    const [categories, setCategories] = useState<CategoryForDropdownDTO[]>([]);

    // Search states for materials
    const [materialSearchTerm, setMaterialSearchTerm] = useState('');
    const [materialSearchResults, setMaterialSearchResults] = useState<MaterialSearchResultDTO[]>([]);
    const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);

    // Search states for procedures
    const [procedureSearchTerm, setProcedureSearchTerm] = useState('');
    const [filteredProcedures, setFilteredProcedures] = useState<ProcedureForDropdownDTO[]>([]);
    const [isLoadingProcedures, setIsLoadingProcedures] = useState(false);

    // Track if there are unsaved changes
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [originalMaterials, setOriginalMaterials] = useState<ProductMaterialDetailDTO[]>([]);
    const [originalProcedures, setOriginalProcedures] = useState<ProductProcedureDetailDTO[]>([]);

    // Price calculation
    const [priceCalculation, setPriceCalculation] = useState<PriceCalculation>({
        materialCost: 0,
        laborCost: 0,
        procedureCost: 0,
        totalCost: 0,
        suggestedRetailPrice: 0,
        suggestedWholesalePrice: 0
    });

    // Current user ID (get from auth context)
    const getCurrentUserId = (): number => {
        return 1; // Replace with actual user ID logic
    };

    // Load initial data and refresh when productId changes
    useEffect(() => {
        loadProductData();
        loadDropdownData();
    }, [productId]);

    // Reset form when component mounts or productId changes
    useEffect(() => {
        // Reset all search states
        setMaterialSearchTerm('');
        setMaterialSearchResults([]);
        setProcedureSearchTerm('');
        setFilteredProcedures([]);
        setIsLoadingMaterials(false);
        setIsLoadingProcedures(false);

        // Clear any errors
        clearErrors();
    }, [productId]);

    // Check for unsaved changes
    useEffect(() => {
        const materialsChanged = JSON.stringify(selectedMaterials) !== JSON.stringify(originalMaterials);
        const proceduresChanged = JSON.stringify(selectedProcedures) !== JSON.stringify(originalProcedures);
        setHasUnsavedChanges(materialsChanged || proceduresChanged);
    }, [selectedMaterials, selectedProcedures, originalMaterials, originalProcedures]);

    // Recalculate prices whenever materials, procedures, or minutesToMake change
    useEffect(() => {
        calculatePrices();
    }, [selectedMaterials, selectedProcedures, minutesToMake]);

    const loadProductData = async () => {
        try {
            setLoading(true);
            const productData = await productService.getProductDetails(productId);

            // Always refresh form fields from database - don't preserve local changes
            setName(productData.name);
            setCode(productData.code);
            setCategoryId(productData.categoryId);
            setMinutesToMake(productData.minutesToMake || 0);
            setFinalRetailPrice(productData.finalRetailPrice || 0);
            setFinalWholesalePrice(productData.finalWholesalePrice || 0);
            setCurrentStock(productData.currentStock || 0);
            setLowStockAlert(productData.lowStockAlert || 0);

            // Always refresh materials and procedures from database
            const materials = productData.materials || [];
            const procedures = productData.procedures || [];

            setSelectedMaterials(materials);
            setSelectedProcedures(procedures);

            // Store original values for comparison
            setOriginalMaterials(materials);
            setOriginalProcedures(procedures);
            setHasUnsavedChanges(false);

            console.log('Product data refreshed from database:', {
                materials: materials.length,
                procedures: procedures.length
            });
        } catch (err) {
            await handleApiError(err);
        } finally {
            setLoading(false);
        }
    };

    const loadDropdownData = async () => {
        try {
            const categoriesData = await categoryService.getCategoriesForDropdown();
            setCategories(categoriesData);
        } catch (err) {
            console.error('Error loading dropdown data:', err);
        }
    };

    // Calculate all prices locally - instant calculation, no API calls
    const calculatePrices = () => {
        // Calculate material cost
        const materialCost = selectedMaterials.reduce((total, material) =>
            total + (material.unitCost * material.quantity), 0);

        // Calculate procedure cost
        const procedureCost = selectedProcedures.reduce((total, procedure) =>
            total + procedure.cost, 0);

        // Calculate labor cost: (minutes ÷ 60) × hourly rate
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

    // Material management - LOCAL ONLY (no immediate API calls)
    const addMaterial = (material: MaterialSearchResultDTO): void => {
        console.log('Adding material locally:', material);

        // Check if material is already selected
        if (selectedMaterials.some(m => m.materialId === material.materialId)) {
            console.log('Material already selected:', material.materialId);
            return;
        }

        // Update local state only - no API call
        const newMaterial: ProductMaterialDetailDTO = {
            materialId: material.materialId,
            materialName: material.materialName,
            quantity: 1,
            unitOfMeasure: material.unitOfMeasure,
            unitCost: material.currentUnitCost,
            totalCost: material.currentUnitCost
        };

        setSelectedMaterials(prev => {
            const updated = [...prev, newMaterial];
            console.log('Updated materials list (local only):', updated);
            return updated;
        });

        // Clear search state
        setMaterialSearchTerm('');
        setMaterialSearchResults([]);
    };

    const updateMaterialQuantity = (materialId: number, newQuantity: number): void => {
        if (newQuantity <= 0) {
            removeMaterial(materialId);
            return;
        }

        // Update local state only - no API call
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

    const removeMaterial = (materialId: number): void => {
        // Update local state only - no API call
        setSelectedMaterials(prev => prev.filter(m => m.materialId !== materialId));
    };

    // Procedure management - LOCAL ONLY (no immediate API calls)
    const addProcedure = (procedure: ProcedureForDropdownDTO): void => {
        console.log('Adding procedure locally:', procedure);

        // Check if procedure is already selected
        if (selectedProcedures.some(p => p.procedureId === procedure.id)) {
            console.log('Procedure already selected:', procedure.id);
            return;
        }

        // Update local state only - no API call
        const newProcedure: ProductProcedureDetailDTO = {
            procedureId: procedure.id,
            procedureName: procedure.name,
            cost: 0 // User will set the cost
        };

        setSelectedProcedures(prev => {
            const updated = [...prev, newProcedure];
            console.log('Updated procedures list (local only):', updated);
            return updated;
        });

        // Clear search state
        setProcedureSearchTerm('');
        setFilteredProcedures([]);
    };

    const updateProcedureCost = (procedureId: number, newCost: number): void => {
        // Update local state only - no API call
        setSelectedProcedures(prev =>
            prev.map(procedure =>
                procedure.procedureId === procedureId
                    ? { ...procedure, cost: Math.max(0, newCost) }
                    : procedure
            )
        );
    };

    const removeProcedure = (procedureId: number): void => {
        // Update local state only - no API call
        setSelectedProcedures(prev => prev.filter(p => p.procedureId !== procedureId));
    };

    // Handle form submission - Save all changes at once
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim() || !code.trim() || !categoryId) {
            return;
        }

        setSubmitting(true);
        clearErrors();

        try {
            console.log('Starting product update with all changes...');

            // 1. Update basic product information
            const productData: ProductUpdateDTO = {
                productId: productId,
                name: name.trim(),
                code: code.trim(),
                categoryId: categoryId,
                finalSellingPriceRetail: finalRetailPrice,
                finalSellingPriceWholesale: finalWholesalePrice,
                minutesToMake: minutesToMake,
                stock: currentStock,
                lowStockAlert: lowStockAlert,
                updaterUserId: getCurrentUserId()
            };

            await productService.updateProduct(productId,productData);
            console.log('Basic product info updated');

            // 2. Get current materials/procedures from database to compare
            const currentProduct = await productService.getProductDetails(productId);
            const currentMaterials = currentProduct.materials || [];
            const currentProcedures = currentProduct.procedures || [];

            // 3. Update materials
            console.log('Updating materials...');

            // Remove materials that are no longer in the selection
            for (const currentMaterial of currentMaterials) {
                if (!selectedMaterials.some(m => m.materialId === currentMaterial.materialId)) {
                    console.log('Removing material:', currentMaterial.materialId);
                    await productService.removeMaterialFromProduct(productId, currentMaterial.materialId, getCurrentUserId());
                }
            }

            // Add or update materials
            for (const selectedMaterial of selectedMaterials) {
                const existingMaterial = currentMaterials.find(m => m.materialId === selectedMaterial.materialId);
                if (!existingMaterial || existingMaterial.quantity !== selectedMaterial.quantity) {
                    console.log('Adding/updating material:', selectedMaterial.materialId, 'quantity:', selectedMaterial.quantity);
                    await productService.addMaterialToProduct(productId, selectedMaterial.materialId, selectedMaterial.quantity, getCurrentUserId());
                }
            }

            // 4. Update procedures
            console.log('Updating procedures...');

            // Remove procedures that are no longer in the selection
            for (const currentProcedure of currentProcedures) {
                if (!selectedProcedures.some(p => p.procedureId === currentProcedure.procedureId)) {
                    console.log('Removing procedure:', currentProcedure.procedureId);
                    await productService.removeProcedureFromProduct(productId, currentProcedure.procedureId, getCurrentUserId());
                }
            }

            // Add or update procedures
            for (const selectedProcedure of selectedProcedures) {
                const existingProcedure = currentProcedures.find(p => p.procedureId === selectedProcedure.procedureId);
                if (!existingProcedure || existingProcedure.cost !== selectedProcedure.cost) {
                    console.log('Adding/updating procedure:', selectedProcedure.procedureId, 'cost:', selectedProcedure.cost);
                    await productService.addProcedureToProduct(productId, selectedProcedure.procedureId, selectedProcedure.cost, getCurrentUserId());
                }
            }

            console.log('All changes saved successfully');
            onNavigate('manage-products');
        } catch (err) {
            console.error('Error saving changes:', err);
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <LoadingSpinner/>
                    <p className="text-gray-600">Loading product details...</p>
                </div>
            </div>
        );
    }

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
                            <h1 className="text-3xl font-bold text-gray-900">
                                Update Product
                                {hasUnsavedChanges && (
                                    <span className="ml-3 text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                                        Unsaved changes
                                    </span>
                                )}
                            </h1>
                            <p className="text-gray-600 mt-1">Edit product details and pricing</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Button
                            type="button"
                            onClick={() => {
                                console.log('Refreshing product data...');
                                loadProductData();
                            }}
                            variant="outline-secondary"
                            className="flex items-center"
                            disabled={loading}
                        >
                            {loading ? (
                                <LoadingSpinner/>
                            ) : (
                                <RefreshCw className="w-4 h-4 mr-2" />
                            )}
                            Refresh
                        </Button>
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
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        clearFieldError('name');
                                    }}
                                    placeholder="Enter product name..."
                                    error={fieldErrors.name}
                                    required
                                />

                                <Input
                                    label="Product Code *"
                                    type="text"
                                    value={code}
                                    onChange={(e) => {
                                        setCode(e.target.value);
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
                                        value={categoryId || ''}
                                        onChange={(e) => {
                                            setCategoryId(e.target.value ? Number(e.target.value) : null);
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
                                    label="Current Stock"
                                    type="number"
                                    value={currentStock}
                                    onChange={(e) => setCurrentStock(Number(e.target.value))}
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
                            <DashboardCard
                                title={
                                    <div className="flex items-center justify-between">
                                        <span>Materials</span>
                                        {hasUnsavedChanges && JSON.stringify(selectedMaterials) !== JSON.stringify(originalMaterials) && (
                                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                                Modified
                                            </span>
                                        )}
                                    </div>
                                }
                                className="space-y-4"
                            >
                                <SearchDropdown
                                    searchTerm={materialSearchTerm}
                                    onSearchTermChange={(term: string) => {
                                        setMaterialSearchTerm(term);
                                        searchMaterials(term);
                                    }}
                                    searchResults={transformedMaterialResults}
                                    onSelect={(item: { id: number; name: string; subtitle?: string; additionalInfo?: string }) => {
                                        const material = materialSearchResults.find(m => m.materialId === item.id);
                                        if (material) {
                                            addMaterial(material);
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
                            <DashboardCard
                                title={
                                    <div className="flex items-center justify-between">
                                        <span>Procedures</span>
                                        {hasUnsavedChanges && JSON.stringify(selectedProcedures) !== JSON.stringify(originalProcedures) && (
                                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                                                Modified
                                            </span>
                                        )}
                                    </div>
                                }
                                className="space-y-4"
                            >
                                <SearchDropdown
                                    searchTerm={procedureSearchTerm}
                                    onSearchTermChange={(term: string) => {
                                        setProcedureSearchTerm(term);
                                        searchProcedures(term);
                                    }}
                                    searchResults={transformedProcedureResults}
                                    onSelect={(item: { id: number; name: string; subtitle?: string; additionalInfo?: string }) => {
                                        const procedure = filteredProcedures.find(p => p.id === item.id);
                                        if (procedure) {
                                            addProcedure(procedure);
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
                                        <span className="font-medium text-green-700">€{priceCalculation.suggestedWholesalePrice.toFixed(2)}</span>
                                    </div>
                                </div>
                            </DashboardCard>

                            {/* Final Pricing */}
                            <DashboardCard title="Final Pricing" className="space-y-4">
                                <Input
                                    label="Final Retail Price"
                                    type="number"
                                    value={finalRetailPrice}
                                    onChange={(e) => setFinalRetailPrice(Number(e.target.value))}
                                    placeholder={priceCalculation.suggestedRetailPrice.toFixed(2)}
                                    min="0"
                                    step="0.01"
                                    icon={<Euro className="w-4 h-4" />}
                                />

                                <Input
                                    label="Final Wholesale Price"
                                    type="number"
                                    value={finalWholesalePrice}
                                    onChange={(e) => setFinalWholesalePrice(Number(e.target.value))}
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
                                        className={`w-full ${hasUnsavedChanges ? 'bg-orange-600 hover:bg-orange-700' : ''}`}
                                        disabled={submitting}
                                    >
                                        {submitting ? (
                                            <>
                                                <LoadingSpinner />
                                                <span className="ml-2">Saving Changes...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                {hasUnsavedChanges ? 'Save All Changes' : 'Update Product'}
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

export default UpdateProductPage;