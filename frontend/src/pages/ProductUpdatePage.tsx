import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import { procedureService } from '../services/procedureService';
import { categoryService } from '../services/categoryService';
import { materialService } from '../services/materialService';
import { CustomTextInput, CustomNumberInput, CustomSelect, CustomSearchDropdown } from '../components/ui/inputs';
import { Button, LoadingSpinner, CustomCard } from '../components/ui/common';
import {
    Trash2,
    Settings,
    ArrowLeft,
    Save,
    Euro,
    Clock,
    RefreshCw
} from 'lucide-react';
import { IoHammerOutline } from "react-icons/io5";
import { useFormErrorHandler } from '../hooks/useFormErrorHandler';
import type {
    ProductUpdateDTO,
    ProductMaterialDetailDTO,
    ProductProcedureDetailDTO
} from '../types/api/productInterface';
import type { MaterialSearchResultDTO } from '../types/api/materialInterface';
import type { ProcedureForDropdownDTO } from '../types/api/procedureInterface';
import type { CategoryForDropdownDTO } from '../types/api/categoryInterface';
import { HOURLY_LABOR_RATE, MINUTES_PER_HOUR, RETAIL_MARKUP_FACTOR, WHOLESALE_MARKUP_FACTOR } from "../constants/pricing.ts";
import { PriceCalculation } from "../types/api/productInterface";

interface UpdateProductPageProps {
    productId: number;
    onNavigate: (page: string, productId?: string, successMessage?: string) => void;
}

const UpdateProductPage: React.FC<UpdateProductPageProps> = ({ productId, onNavigate }) => {
    // Loading and error states
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const {
        fieldErrors,
        generalError,
        handleApiError,
        clearErrors,
        clearFieldError
    } = useFormErrorHandler();

    // Basic product fields
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
    const [minutesToMake, setMinutesToMake] = useState(0);
    const [currentStock, setCurrentStock] = useState(0);
    const [lowStockAlert, setLowStockAlert] = useState(0);
    const [finalRetailPrice, setFinalRetailPrice] = useState(0);
    const [finalWholesalePrice, setFinalWholesalePrice] = useState(0);

    // Original values for comparison (ALL fields)
    const [originalName, setOriginalName] = useState('');
    const [originalCode, setOriginalCode] = useState('');
    const [originalCategoryId, setOriginalCategoryId] = useState<number | undefined>(undefined);
    const [originalMinutesToMake, setOriginalMinutesToMake] = useState(0);
    const [originalCurrentStock, setOriginalCurrentStock] = useState(0);
    const [originalLowStockAlert, setOriginalLowStockAlert] = useState(0);
    const [originalFinalRetailPrice, setOriginalFinalRetailPrice] = useState(0);
    const [originalFinalWholesalePrice, setOriginalFinalWholesalePrice] = useState(0);

    // Materials and procedures
    const [selectedMaterials, setSelectedMaterials] = useState<ProductMaterialDetailDTO[]>([]);
    const [selectedProcedures, setSelectedProcedures] = useState<ProductProcedureDetailDTO[]>([]);
    const [originalMaterials, setOriginalMaterials] = useState<ProductMaterialDetailDTO[]>([]);
    const [originalProcedures, setOriginalProcedures] = useState<ProductProcedureDetailDTO[]>([]);

    // Material search states
    const [materialSearchTerm, setMaterialSearchTerm] = useState('');
    const [materialSearchResults, setMaterialSearchResults] = useState<MaterialSearchResultDTO[]>([]);
    const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);

    // Procedure search states
    const [procedureSearchTerm, setProcedureSearchTerm] = useState('');
    const [filteredProcedures, setFilteredProcedures] = useState<ProcedureForDropdownDTO[]>([]);
    const [isLoadingProcedures, setIsLoadingProcedures] = useState(false);

    // Dropdown data
    const [categories, setCategories] = useState<CategoryForDropdownDTO[]>([]);

    // Price calculation
    const [priceCalculation, setPriceCalculation] = useState<PriceCalculation>({
        materialCost: 0,
        laborCost: 0,
        procedureCost: 0,
        totalCost: 0,
        suggestedRetailPrice: 0,
        suggestedWholesalePrice: 0
    });

    // Track unsaved changes
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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
        const basicFieldsChanged = (
            name !== originalName ||
            code !== originalCode ||
            categoryId !== originalCategoryId ||
            minutesToMake !== originalMinutesToMake ||
            currentStock !== originalCurrentStock ||
            lowStockAlert !== originalLowStockAlert ||
            finalRetailPrice !== originalFinalRetailPrice ||
            finalWholesalePrice !== originalFinalWholesalePrice
        );

        const materialsChanged = JSON.stringify(selectedMaterials) !== JSON.stringify(originalMaterials);
        const proceduresChanged = JSON.stringify(selectedProcedures) !== JSON.stringify(originalProcedures);

        setHasUnsavedChanges(basicFieldsChanged || materialsChanged || proceduresChanged);
    }, [
        name, originalName,
        code, originalCode,
        categoryId, originalCategoryId,
        minutesToMake, originalMinutesToMake,
        currentStock, originalCurrentStock,
        lowStockAlert, originalLowStockAlert,
        finalRetailPrice, originalFinalRetailPrice,
        finalWholesalePrice, originalFinalWholesalePrice,
        selectedMaterials, originalMaterials,
        selectedProcedures, originalProcedures
    ]);

    // Recalculate prices whenever materials, procedures, or minutesToMake change
    useEffect(() => {
        calculatePrices();
    }, [selectedMaterials, selectedProcedures, minutesToMake]);

    const loadProductData = async () => {
        try {
            setLoading(true);
            const productData = await productService.getProductDetails(productId);

            // Set current form fields
            setName(productData.name);
            setCode(productData.code);
            setCategoryId(productData.categoryId);
            setMinutesToMake(productData.minutesToMake);
            setCurrentStock(productData.currentStock);
            setLowStockAlert(productData.lowStockAlert);
            setFinalRetailPrice(productData.finalRetailPrice);
            setFinalWholesalePrice(productData.finalWholesalePrice);

            // Store original values for ALL fields
            setOriginalName(productData.name);
            setOriginalCode(productData.code);
            setOriginalCategoryId(productData.categoryId);
            setOriginalMinutesToMake(productData.minutesToMake);
            setOriginalCurrentStock(productData.currentStock);
            setOriginalLowStockAlert(productData.lowStockAlert);
            setOriginalFinalRetailPrice(productData.finalRetailPrice);
            setOriginalFinalWholesalePrice(productData.finalWholesalePrice);

            // Set materials and procedures
            const materials = productData.materials || [];
            const procedures = productData.procedures || [];

            setSelectedMaterials(materials);
            setSelectedProcedures(procedures);
            setOriginalMaterials([...materials]);
            setOriginalProcedures([...procedures]);

            clearErrors();
        } catch (err) {
            console.error('Error loading product data:', err);
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

    const calculatePrices = () => {
        // Calculate material cost
        const materialCost = selectedMaterials.reduce((sum, material) =>
            sum + (material.unitCost * material.quantity), 0);

        // Calculate labor cost
        const laborCost = (minutesToMake / MINUTES_PER_HOUR) * HOURLY_LABOR_RATE;

        // Calculate procedure cost
        const procedureCost = selectedProcedures.reduce((sum, procedure) =>
            sum + procedure.cost, 0);

        // Calculate total cost
        const totalCost = materialCost + laborCost + procedureCost;

        // Calculate suggested prices
        const suggestedRetailPrice = totalCost * RETAIL_MARKUP_FACTOR;
        const suggestedWholesalePrice = totalCost * WHOLESALE_MARKUP_FACTOR;

        setPriceCalculation({
            materialCost,
            laborCost,
            procedureCost,
            totalCost,
            suggestedRetailPrice,
            suggestedWholesalePrice
        });
    };

    // Material search with debouncing
    useEffect(() => {
        const searchMaterials = async () => {
            if (materialSearchTerm.length < 2) {
                setMaterialSearchResults([]);
                return;
            }

            setIsLoadingMaterials(true);
            try {
                const results = await materialService.searchMaterialsForAutocomplete(materialSearchTerm);
                setMaterialSearchResults(results);
            } catch (err) {
                console.error('Error searching materials:', err);
            } finally {
                setIsLoadingMaterials(false);
            }
        };

        const timeoutId = setTimeout(searchMaterials, 300);
        return () => clearTimeout(timeoutId);
    }, [materialSearchTerm]);

    // Procedure search with debouncing
    useEffect(() => {
        const searchProcedures = async () => {
            if (procedureSearchTerm.length < 2) {
                setFilteredProcedures([]);
                return;
            }

            setIsLoadingProcedures(true);
            try {
                const results = await procedureService.searchProceduresForAutocomplete(procedureSearchTerm);
                setFilteredProcedures(results);
            } catch (err) {
                console.error('Error searching procedures:', err);
            } finally {
                setIsLoadingProcedures(false);
            }
        };

        const timeoutId = setTimeout(searchProcedures, 300);
        return () => clearTimeout(timeoutId);
    }, [procedureSearchTerm]);

    // Material handlers
    const handleMaterialSelect = (material: MaterialSearchResultDTO): void => {
        const existingMaterial = selectedMaterials.find(m => m.materialId === material.materialId);
        if (existingMaterial) {
            return; // Material already selected
        }

        const newMaterial: ProductMaterialDetailDTO = {
            materialId: material.materialId,
            materialName: material.materialName,
            unitOfMeasure: material.unitOfMeasure,
            unitCost: material.currentUnitCost,
            quantity: 1,
            totalCost: material.currentUnitCost
        };

        setSelectedMaterials(prev => [...prev, newMaterial]);
        setMaterialSearchTerm('');
        setMaterialSearchResults([]);
    };

    const updateMaterialQuantity = (materialId: number, newQuantity: number) => {
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
        setSelectedMaterials(prev => prev.filter(m => m.materialId !== materialId));
    };

    // Procedure handlers
    const handleProcedureSelect = (procedure: ProcedureForDropdownDTO): void => {
        const existingProcedure = selectedProcedures.find(p => p.procedureId === procedure.id);
        if (existingProcedure) {
            return; // Procedure already selected
        }

        const newProcedure: ProductProcedureDetailDTO = {
            procedureId: procedure.id,
            procedureName: procedure.name,
            cost: 0
        };

        setSelectedProcedures(prev => [...prev, newProcedure]);
        setProcedureSearchTerm('');
        setFilteredProcedures([]);
    };

    const updateProcedureCost = (procedureId: number, newCost: number): void => {
        setSelectedProcedures(prev =>
            prev.map(procedure =>
                procedure.procedureId === procedureId
                    ? { ...procedure, cost: Math.max(0, newCost) }
                    : procedure
            )
        );
    };

    const removeProcedure = (procedureId: number): void => {
        setSelectedProcedures(prev => prev.filter(p => p.procedureId !== procedureId));
    };

    const handleInputChange = (field: string, value: string | number) => {
        // Update the appropriate state based on field
        switch (field) {
            case 'name':
                setName(value as string);
                break;
            case 'code':
                setCode(value as string);
                break;
            case 'categoryId':
                setCategoryId(value as number);
                break;
            case 'currentStock':
                setCurrentStock(value as number);
                break;
            case 'lowStockAlert':
                setLowStockAlert(value as number);
                break;
            case 'minutesToMake':
                setMinutesToMake(value as number);
                break;
            case 'finalRetailPrice':
                setFinalRetailPrice(value as number);
                break;
            case 'finalWholesalePrice':
                setFinalWholesalePrice(value as number);
                break;
        }

        // Clear field error when user starts typing (like in your modals)
        if (fieldErrors[field]) {
            clearFieldError(field);
        }

        // Clear general error when user makes changes (like in your modals)
        if (generalError) {
            clearErrors();
        }
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
                lowStockAlert: lowStockAlert
            };

            await productService.updateProduct(productId, productData);
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
                    await productService.removeMaterialFromProduct(productId, currentMaterial.materialId);
                }
            }

            // Add or update materials
            for (const selectedMaterial of selectedMaterials) {
                const existingMaterial = currentMaterials.find(m => m.materialId === selectedMaterial.materialId);
                if (!existingMaterial || existingMaterial.quantity !== selectedMaterial.quantity) {
                    console.log('Adding/updating material:', selectedMaterial.materialId, 'quantity:', selectedMaterial.quantity);
                    await productService.addMaterialToProduct(productId, selectedMaterial.materialId, selectedMaterial.quantity);
                }
            }

            // 4. Update procedures
            console.log('Updating procedures...');

            // Remove procedures that are no longer in the selection
            for (const currentProcedure of currentProcedures) {
                if (!selectedProcedures.some(p => p.procedureId === currentProcedure.procedureId)) {
                    console.log('Removing procedure:', currentProcedure.procedureId);
                    await productService.removeProcedureFromProduct(productId, currentProcedure.procedureId);
                }
            }

            // Add or update procedures
            for (const selectedProcedure of selectedProcedures) {
                const existingProcedure = currentProcedures.find(p => p.procedureId === selectedProcedure.procedureId);
                if (!existingProcedure || existingProcedure.cost !== selectedProcedure.cost) {
                    console.log('Adding/updating procedure:', selectedProcedure.procedureId, 'cost:', selectedProcedure.cost);
                    await productService.addProcedureToProduct(productId, selectedProcedure.procedureId, selectedProcedure.cost);
                }
            }

            console.log('All changes saved successfully');
            onNavigate('manage-products', undefined, `SUCCESS_UPDATE:${name.trim()}`);
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

    // Transform categories for CustomSelect
    const categoryOptions = [
        { value: '', label: 'Select a category...' },
        ...categories.map(category => ({
            value: category.id,
            label: category.name
        }))
    ];

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
        <div className="min-h-screen p-4">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center space-x-3 mb-4 md:mb-0">
                        <div>
                            <h1 className="text-2xl font-bold text-white">Επεξεργασία Προϊόντος</h1>
                            {hasUnsavedChanges && (
                                <span className="text-sm text-amber-300 font-medium">
                                    ⚠️ Υπάρχουν μη αποθηκευμένες αλλαγές
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <Button
                            onClick={() => onNavigate('manage-products')}
                            variant="yellow"
                            className="flex items-center justify-center w-full sm:w-[200px]"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Επιστροφή στα Προϊόντα
                        </Button>
                        <Button
                            onClick={loadProductData}
                            variant="pink"
                            disabled={loading}
                            className="flex items-center justify-center w-full sm:w-[200px]"
                        >
                            {loading ? (
                                <LoadingSpinner/>
                            ) : (
                                 <RefreshCw className="w-4 h-4 mr-2" />
                            )}
                            Ανανέωση
                        </Button>
                    </div>
                </div>

                {/* Error Display */}
                {generalError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
                        <p className="text-sm text-red-800">
                            {generalError}
                        </p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        {/* Left Column - Basic Info */}
                        <div className="xl:col-span-1 space-y-6">
                            {/* Basic Product Information */}
                            <CustomCard title="Basic Information" className="space-y-4">
                                <CustomTextInput
                                    label="Όνομα Προϊόντος *"
                                    value={name}
                                    onChange={(value) => handleInputChange('name', value)}
                                    placeholder="π.χ. Χρυσό Δαχτυλίδι"
                                    error={fieldErrors.name} // Show validation error
                                    disabled={submitting}
                                />

                                <CustomTextInput
                                    label="Κωδικός Προϊόντος *"
                                    value={code}
                                    onChange={(value) => handleInputChange('code', value)}
                                    placeholder="π.χ. RING-001"
                                    error={fieldErrors.code} // Show validation error
                                    disabled={submitting}
                                />

                                <CustomSelect
                                    label="Κατηγορία"
                                    value={categoryId || ''}
                                    onChange={(value) => {
                                        setCategoryId(value as number || undefined);
                                        clearFieldError('categoryId');
                                    }}
                                    options={categoryOptions}
                                    placeholder=""
                                    required
                                    disabled={submitting}
                                />
                            </CustomCard>

                            {/* Materials Section */}
                            <CustomCard
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
                                <CustomSearchDropdown
                                    label="Προσθήκη Υλικών"
                                    searchTerm={materialSearchTerm}
                                    onSearchTermChange={setMaterialSearchTerm}
                                    searchResults={transformedMaterialResults}
                                    onSelect={(item) => {
                                        const material = materialSearchResults.find(m => m.materialId === item.id);
                                        if (material) handleMaterialSelect(material);
                                    }}
                                    placeholder="Αναζήτηση Υλικών"
                                    isLoading={isLoadingMaterials}
                                    entityType="material"
                                    icon={<IoHammerOutline className="w-4 h-4" />}
                                    emptyMessage="Δεν βρέθηκαν υλικά"
                                    emptySubMessage="Δοκιμάστε διαφορετικό όρο αναζήτησης"
                                />

                                {/* Selected Materials Display */}
                                {selectedMaterials.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium text-gray-700">Επιλεγμένα Υλικά:</h4>
                                        {selectedMaterials.map((material) => (
                                            <div key={material.materialId} className="bg-blue-50 p-3 rounded-lg border">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex-1">
                                                        <span className="font-medium text-gray-900">{material.materialName}</span>
                                                        <div className="text-sm text-gray-600">
                                                            €{material.unitCost.toFixed(2)} / {material.unitOfMeasure}
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeMaterial(material.materialId)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>


                                                <div className="flex items-center space-x-2">

                                                    <CustomNumberInput
                                                        label=""
                                                        value={material.quantity}
                                                        onChange={(value) => updateMaterialQuantity(material.materialId, value)}
                                                        placeholder="Enter quantity..."
                                                        min={0}
                                                        step={0.01}
                                                        className="flex-1"
                                                    />

                                                    <span className="ml-auto text-sm text-gray-600">
                                                        Σύνολο: €{(material.unitCost * material.quantity).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CustomCard>


                        </div>

                        {/* Middle Column - Materials and Procedures */}
                        <div className="xl:col-span-1 space-y-6">

                            {/* Stock Information */}
                            <CustomCard title="Stock Information" className="space-y-4">
                                <CustomNumberInput
                                    label="Τρέχον Απόθεμα"
                                    value={currentStock}
                                    onChange={(value) => handleInputChange('currentStock', value)}
                                    placeholder="0"
                                    min={0}
                                    step={1}
                                    error={fieldErrors.stock} // Show validation error (backend might return 'stock')
                                    disabled={submitting}
                                />

                                <CustomNumberInput
                                    label="Οριακό Απόθεμα"
                                    value={lowStockAlert}
                                    onChange={(value) => handleInputChange('lowStockAlert', value)}
                                    placeholder="0"
                                    min={0}
                                    step={1}
                                    error={fieldErrors.lowStockAlert} // Show validation error
                                    disabled={submitting}
                                />

                                <CustomNumberInput
                                    label="Χρόνος Κατασκευής (Λεπτά)"
                                    value={minutesToMake}
                                    onChange={(value) => handleInputChange('minutesToMake', value)}
                                    placeholder="0"
                                    min={0}
                                    icon={<Clock className="w-4 h-4" />}
                                    step={1}
                                    error={fieldErrors.minutesToMake}
                                    disabled={submitting}
                                />
                            </CustomCard>



                            {/* Procedures Section */}
                            <CustomCard
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
                                <CustomSearchDropdown
                                    label="Προσθήκη Διαδικασίας"
                                    searchTerm={procedureSearchTerm}
                                    onSearchTermChange={setProcedureSearchTerm}
                                    searchResults={transformedProcedureResults}
                                    onSelect={(item) => {
                                        const procedure = filteredProcedures.find(p => p.id === item.id);
                                        if (procedure) handleProcedureSelect(procedure);
                                    }}
                                    placeholder="Αναζήτηση Διαδικασίας..."
                                    isLoading={isLoadingProcedures}
                                    entityType="procedure"
                                    icon={<Settings className="w-4 h-4" />}
                                    emptyMessage="Δεν βρέθηκαν διαδικασίες"
                                    emptySubMessage="Δοκιμάστε διαφορετικό όρο αναζήτησης"
                                />

                                {/* Selected Procedures Display */}
                                {selectedProcedures.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium text-gray-700">Επιλεγμένες Διαδικασίες:</h4>
                                        {selectedProcedures.map((procedure) => (
                                            <div key={procedure.procedureId} className="bg-purple-50 p-3 rounded-lg border">
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
                                                    <CustomNumberInput
                                                        label=""
                                                        value={procedure.cost}
                                                        onChange={(value) => updateProcedureCost(procedure.procedureId, value)}
                                                        placeholder="Enter cost..."
                                                        min={0}
                                                        step={0.01}
                                                        className="flex-1"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CustomCard>
                        </div>

                        {/* Right Column - Pricing */}
                        <div className="xl:col-span-1 space-y-6">
                            {/* Price Calculation */}
                            <CustomCard title="Price Calculation" className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Κόστος Υλικών:</span>
                                        <span className="font-medium">€{priceCalculation.materialCost.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Κόστος Εργατικών:</span>
                                        <span className="font-medium">€{priceCalculation.laborCost.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Κόστος Διαδικασιών:</span>
                                        <span className="font-medium">€{priceCalculation.procedureCost.toFixed(2)}</span>
                                    </div>
                                    <hr className="border-gray-200" />
                                    <div className="flex justify-between font-medium">
                                        <span>Συνολικό Κόστος:</span>
                                        <span>€{priceCalculation.totalCost.toFixed(2)}</span>
                                    </div>
                                    <hr className="border-gray-200" />
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Προτεινόμενη Λιανική:</span>
                                        <span className="font-medium text-green-600">
                                            €{priceCalculation.suggestedRetailPrice.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Προτεινόμενη Χονδρική:</span>
                                        <span className="font-medium text-blue-600">
                                            €{priceCalculation.suggestedWholesalePrice.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </CustomCard>

                            {/* Final Pricing */}
                            <CustomCard title="Final Pricing" className="space-y-4">
                                <CustomNumberInput
                                    label="Τελική Λιανική Τιμή"
                                    value={finalRetailPrice}
                                    onChange={setFinalRetailPrice}
                                    placeholder="0.00"
                                    min={0}
                                    step={1}
                                    icon={<Euro className="w-4 h-4" />}
                                    error={fieldErrors.finalSellingPriceRetail}
                                    disabled={submitting}
                                />

                                <CustomNumberInput
                                    label="Τελική Χονδρική Τιμή"
                                    value={finalWholesalePrice}
                                    onChange={setFinalWholesalePrice}
                                    placeholder="0.00"
                                    className={"mt-2"}
                                    min={0}
                                    step={1}
                                    icon={<Euro className="w-4 h-4" />}
                                    error={fieldErrors.finalSellingPriceWholesale}
                                    disabled={submitting}
                                />
                            </CustomCard>

                            <Button
                                type="submit"
                                variant="create"
                                disabled={submitting || !name.trim() || !code.trim() || !categoryId}
                                className="w-full px-1 py-4"
                            >
                                {submitting ? (
                                    <>
                                        <LoadingSpinner />
                                        <span className="ml-2">Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Αποθήκευση Αλλαγών
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateProductPage;