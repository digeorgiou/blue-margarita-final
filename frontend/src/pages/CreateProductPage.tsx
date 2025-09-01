import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import { procedureService } from '../services/procedureService';
import { categoryService } from '../services/categoryService';
import { materialService } from '../services/materialService';
import { CustomTextInput, CustomNumberInput, CustomSelect, CustomSearchDropdown } from '../components/ui/inputs';
import { Button, LoadingSpinner, Alert } from '../components/ui';
import { FlexibleHeightCard } from "../components/ui";
import CustomCard from '../components/ui/common/CustomCard.tsx';
import {
    Package,
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
    onNavigate: (page: string, productId?: string, successMessage?: string) => void;
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
    const { generalError, handleApiError, clearErrors, clearFieldError } = useFormErrorHandler();

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
    const [procedureSearchResults, setProcedureSearchResults] = useState<ProcedureForDropdownDTO[]>([]);
    const [isLoadingProcedures, setIsLoadingProcedures] = useState(false);

    // Filtered procedures (removes already selected ones)
    const filteredProcedures = procedureSearchResults.filter(
        procedure => !selectedProcedures.some(selected => selected.procedureId === procedure.id)
    );

    // Calculate price suggestions
    const calculatePriceSuggestions = (): PriceCalculation => {
        const materialCost = selectedMaterials.reduce((sum, material) => sum + material.totalCost, 0);
        const laborCost = (minutesToMake / MINUTES_PER_HOUR) * HOURLY_LABOR_RATE;
        const procedureCost = selectedProcedures.reduce((sum, procedure) => sum + procedure.cost, 0);
        const totalCost = materialCost + laborCost + procedureCost;

        return {
            materialCost,
            laborCost,
            procedureCost,
            totalCost,
            suggestedRetailPrice: totalCost * RETAIL_MARKUP_FACTOR,
            suggestedWholesalePrice: totalCost * WHOLESALE_MARKUP_FACTOR
        };
    };

    const priceCalculation = calculatePriceSuggestions();

    // Load initial data
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const categoriesData = await categoryService.getCategoriesForDropdown();
                setCategories(categoriesData);
            } catch (err) {
                console.error('Failed to load categories:', err);
            }
        };

        loadCategories();
    }, []);

    // Search materials
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
                console.error('Failed to search materials:', err);
                setMaterialSearchResults([]);
            } finally {
                setIsLoadingMaterials(false);
            }
        };

        const timeoutId = setTimeout(searchMaterials, 300);
        return () => clearTimeout(timeoutId);
    }, [materialSearchTerm]);

    // Search procedures
    useEffect(() => {
        const searchProcedures = async () => {
            if (procedureSearchTerm.length < 2) {
                setProcedureSearchResults([]);
                return;
            }

            setIsLoadingProcedures(true);
            try {
                const results = await procedureService.searchProceduresForAutocomplete(procedureSearchTerm);
                setProcedureSearchResults(results);
            } catch (err) {
                console.error('Failed to search procedures:', err);
                setProcedureSearchResults([]);
            } finally {
                setIsLoadingProcedures(false);
            }
        };

        const timeoutId = setTimeout(searchProcedures, 300);
        return () => clearTimeout(timeoutId);
    }, [procedureSearchTerm]);


    // Add material to selection
    const addMaterial = (material: MaterialSearchResultDTO) => {
        // Check if material is already selected
        if (selectedMaterials.some(m => m.materialId === material.materialId)) {
            return;
        }

        const newMaterial: ProductMaterialDetailDTO = {
            materialId: material.materialId,
            materialName: material.materialName,
            unitOfMeasure: material.unitOfMeasure,
            quantity: 1,
            unitCost: material.currentUnitCost,
            totalCost: material.currentUnitCost
        };

        setSelectedMaterials(prev => [...prev, newMaterial]);
        setMaterialSearchTerm(''); // Clear search term after selection
    };

    // Update material quantity
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
        setProcedureSearchTerm(''); // Clear search term after selection
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
            onNavigate('manage-products', undefined, `SUCCESS_CREATE:${productName.trim()}`);
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

    // Category options for CustomSelect
    const categoryOptions = categories.map(category => ({
        value: category.id,
        label: category.name
    }));

    return (
        <div className="min-h-screen p-4">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center space-x-3 mb-4 md:mb-0">

                        <div>
                            <h1 className="text-2xl font-bold text-white">Δημιουργία Νέου Προϊόντος</h1>
                        </div>
                    </div>

                        <Button
                            onClick={() => onNavigate('manage-products')}
                            variant="yellow"
                            className="flex items-center"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Επιστροφή στα Προϊόντα
                        </Button>

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
                            <CustomCard title="Basic Information" className="space-y-4">
                                <CustomTextInput
                                    label="Όνομα Προϊόντος"
                                    value={productName}
                                    onChange={(value) => {
                                        setProductName(value);
                                        clearFieldError('name');
                                    }}
                                    placeholder="Εισάγετε όνομα..."
                                    icon={<Package className="w-4 h-4" />}
                                    required
                                />

                                <CustomTextInput
                                    label="Κωδικός Προϊόντος"
                                    value={productCode}
                                    onChange={(value) => {
                                        setProductCode(value);
                                        clearFieldError('code');
                                    }}
                                    placeholder="Εισάγετε μοναδικό κωδικό προϊόντος..."
                                    icon={<Settings className="w-4 h-4" />}
                                    required
                                />

                                <CustomSelect
                                    label="Κατηγορία"
                                    value={selectedCategoryId || ''}
                                    onChange={(value) => {
                                        setSelectedCategoryId(value ? Number(value) : undefined);
                                        clearFieldError('categoryId');
                                    }}
                                    options={categoryOptions}
                                    placeholder="Επιλογή Κατηγορίας"
                                    icon={<Package className="w-4 h-4" />}
                                    required
                                />
                            </CustomCard>

                            {/* Materials */}
                            <FlexibleHeightCard title="Materials" className="space-y-4">
                                <CustomSearchDropdown
                                    label="Προσθήκη Υλικών"
                                    searchTerm={materialSearchTerm}
                                    onSearchTermChange={setMaterialSearchTerm}
                                    searchResults={transformedMaterialResults}
                                    onSelect={(item) => {
                                        const material = materialSearchResults.find(m => m.materialId === item.id);
                                        if (material) addMaterial(material);
                                    }}
                                    placeholder="Αναζήτηση Υλικών..."
                                    isLoading={isLoadingMaterials}
                                    entityType="material"
                                    icon={<Ruler className="w-4 h-4" />}
                                />

                                {/* Selected Materials */}
                                {selectedMaterials.length > 0 && (
                                    <div className="space-y-2 overflow-y-auto">
                                        <h4 className="text-sm font-semibold text-gray-700">Επιλεγμένα Υλικά</h4>
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

                                                <CustomNumberInput
                                                    label = {`Ποσότητα (${material.unitOfMeasure})`}
                                                    value={material.quantity}
                                                    onChange={(value) => updateMaterialQuantity(material.materialId, value)}
                                                    min={0}
                                                    step={0.01}
                                                    className="text-sm"
                                                />

                                                    <span className="ml-auto text-sm text-gray-600">
                                                        Συνολικό Κόστος €{material.totalCost.toFixed(2)}
                                                    </span>
                                            </div>
                                        ))}

                                    </div>


                                )}
                            </FlexibleHeightCard>


                        </div>

                        {/* Middle Column - Materials and Procedures */}
                        <div className="xl:col-span-1 space-y-6">

                            {/* Inventory Information */}
                            <CustomCard title="Inventory" className="space-y-4">
                                <CustomNumberInput
                                    label="Αρχικό Απόθεμα"
                                    value={stock}
                                    onChange={setStock}
                                    placeholder="Εισάγετε Απόθεμα..."
                                    icon={<Package className="w-4 h-4" />}
                                    min={0}
                                    step={1}
                                />

                                <CustomNumberInput
                                    label="Οριακό Απόθεμα"
                                    value={lowStockAlert}
                                    onChange={setLowStockAlert}
                                    placeholder="Εισάγετε οριακό απόθεμα..."
                                    icon={<Package className="w-4 h-4" />}
                                    min={0}
                                    step={1}
                                />

                                <CustomNumberInput
                                    label="Χρόνος Κατασκευής (Λεπτά)"
                                    value={minutesToMake}
                                    onChange={setMinutesToMake}
                                    placeholder="Εισάγετε χρόνο κατασκευής σε λεπτά..."
                                    icon={<Clock className="w-4 h-4" />}
                                    min={0}
                                    step={1}
                                />
                            </CustomCard>


                            {/* Procedures */}
                            <FlexibleHeightCard title="Procedures" className="space-y-4">
                                <CustomSearchDropdown
                                    label="Προσθήκη Διαδικασίας / Πάγιου Εξόδου"
                                    searchTerm={procedureSearchTerm}
                                    onSearchTermChange={setProcedureSearchTerm}
                                    searchResults={transformedProcedureResults}
                                    onSelect={(item) => {
                                        const procedure = procedureSearchResults.find(p => p.id === item.id);
                                        if (procedure) addProcedure(procedure);
                                    }}
                                    placeholder="Αναζήτηση Διαδικασίας..."
                                    isLoading={isLoadingProcedures}
                                    entityType="procedure"
                                    icon={<Settings className="w-4 h-4" />}
                                />

                                {/* Selected Procedures */}
                                {selectedProcedures.length > 0 && (
                                    <div className="space-y-2 overflow-y-auto">
                                        <h4 className="text-sm font-semibold text-gray-700">Επιλεγμένες Διαδικασίες</h4>
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
                                                    <CustomNumberInput
                                                        label=""
                                                        value={procedure.cost}
                                                        onChange={(value) => updateProcedureCost(procedure.procedureId, value)}
                                                        placeholder="Εισάγετε κόστος..."
                                                        icon={<Euro className="w-4 h-4" />}
                                                        min={0}
                                                        step={1}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </FlexibleHeightCard>
                        </div>

                        {/* Right Column - Pricing */}
                        <div className="xl:col-span-1 space-y-6">
                            {/* Price Calculation */}
                            <CustomCard title="Price Calculation" className="space-y-4" height="md">
                                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                                    <div className="flex justify-between text-xs">
                                        <span>Κόστος Υλικών:</span>
                                        <span className="font-medium">€{priceCalculation.materialCost.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span>Κόστος Εργατικών:</span>
                                        <span className="font-medium">€{priceCalculation.laborCost.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span>Κόστος Διαδικασιών:</span>
                                        <span className="font-medium">€{priceCalculation.procedureCost.toFixed(2)}</span>
                                    </div>
                                    <div className="border-t pt-2">
                                        <div className="flex justify-between font-semibold">
                                            <span>Συνολικό Κόστος:</span>
                                            <span>€{priceCalculation.totalCost.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-green-50 p-4 rounded-lg space-y-3 mt-2">
                                    <div className="font-bold">
                                        <span>Προτεινόμενες Τιμές</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-semibold">
                                        <span>Προτεινόμενη Λιανική:</span>
                                        <span className="font-medium text-green-700">€{priceCalculation.suggestedRetailPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-semibold">
                                        <span>Προτεινόμενη Χονδρική:</span>
                                        <span className="font-medium text-green-700">€{priceCalculation.suggestedWholesalePrice.toFixed(2)}</span>
                                    </div>
                                </div>
                            </CustomCard>

                            {/* Final Pricing */}
                            <CustomCard title="Final Pricing" className="space-y-4">
                                <CustomNumberInput
                                    label="Τελική Λιανική Τιμή (€)"
                                    value={finalSellingPriceRetail}
                                    onChange={setFinalSellingPriceRetail}
                                    placeholder="Εισάγετε τελική λιανική..."
                                    icon={<Euro className="w-4 h-4" />}
                                    min={0}
                                    step={1}
                                />

                                <CustomNumberInput
                                    label="Τελική Χονδρική Τιμή (€)"
                                    value={finalSellingPriceWholesale}
                                    onChange={setFinalSellingPriceWholesale}
                                    placeholder="Εισάγετε τελική Χονδρική..."
                                    icon={<Euro className="w-4 h-4" />}
                                    min={0}
                                    step={1}
                                    className="mt-2"
                                />
                            </CustomCard>

                            {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        variant="create"
                                        className="w-full px-1 py-4"
                                        disabled={submitting}
                                    >
                                        {submitting ? (
                                            <>
                                                <LoadingSpinner />
                                                <span className="ml-2">Δημιουργία...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                Δημιουργία Προϊόντος
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

export default CreateProductPage;