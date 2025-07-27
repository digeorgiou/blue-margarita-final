import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import { procedureService } from '../services/procedureService';
import { categoryService } from '../services/categoryService';
import { Button, LoadingSpinner, Input, Alert } from '../components/ui';
import DashboardCard from '../components/ui/DashboardCard';
import { Package, Plus, Minus, Trash2, Search, Calculator, ArrowLeft, Save } from 'lucide-react';
import { useFormErrorHandler } from '../hooks/useFormErrorHandler';
import type {
    ProductInsertDTO,
    ProductMaterialDetailDTO,
    ProductProcedureDetailDTO
} from '../types/api/productInterface';
import type { MaterialSearchResultDTO } from '../types/api/materialInterface';
import type { ProcedureForDropdownDTO } from '../types/api/procedureInterface';
import type { CategoryForDropdownDTO } from '../types/api/categoryInterface';
import {materialService} from "../services/materialService.ts";

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
    const [procedures, setProcedures] = useState<ProcedureForDropdownDTO[]>([]);

    // Selected materials and procedures (using the interface types)
    const [selectedMaterials, setSelectedMaterials] = useState<ProductMaterialDetailDTO[]>([]);
    const [selectedProcedures, setSelectedProcedures] = useState<ProductProcedureDetailDTO[]>([]);

    // Search states for materials
    const [materialSearchTerm, setMaterialSearchTerm] = useState('');
    const [materialSearchResults, setMaterialSearchResults] = useState<MaterialSearchResultDTO[]>([]);

    // Search states for procedures
    const [procedureSearchTerm, setProcedureSearchTerm] = useState('');
    const [filteredProcedures, setFilteredProcedures] = useState<ProcedureForDropdownDTO[]>([]);
    const [showProcedureDropdown, setShowProcedureDropdown] = useState(false);

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

    // Load initial data
    useEffect(() => {
        loadDropdownData();
    }, []);

    // Recalculate prices whenever materials, procedures, or minutesToMake change
    useEffect(() => {
        calculatePrices();
    }, [selectedMaterials, selectedProcedures, minutesToMake]);

    const loadDropdownData = async () => {
        try {
            const [categoriesData, proceduresData] = await Promise.all([
                categoryService.getCategoriesForDropdown(),
                procedureService.getActiveProceduresForDropdown()
            ]);
            setCategories(categoriesData);
            setProcedures(proceduresData);
            setFilteredProcedures(proceduresData);
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
    const searchMaterials = async (term: string) => {
        if (term.length < 2) {
            setMaterialSearchResults([]);
            return;
        }

        try {
            const results = await materialService.searchMaterialsForAutocomplete(term);
            setMaterialSearchResults(results);
        } catch (err) {
            console.error('Material search error:', err);
            setMaterialSearchResults([]);
        }
    };

    // Procedure search (filter locally since we have all procedures)
    const searchProcedures = async (term: string) => {
        if (term.length < 2) {
            setFilteredProcedures(procedures);
            setShowProcedureDropdown(false);
            return;
        }

        try {
            const results = await procedureService.searchProceduresForAutocomplete(term);
            setFilteredProcedures(results);
            setShowProcedureDropdown(true);
        }catch (err) {
            console.error('Procedure search error:', err);
            setFilteredProcedures([]);
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
        setMaterialSearchTerm('');
        setMaterialSearchResults([]);
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
        setProcedureSearchTerm('');
        setFilteredProcedures(procedures);
        setShowProcedureDropdown(false);
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
                creatorUserId: getCurrentUserId(),
                materials: Object.keys(materials).length > 0 ? materials : undefined,
                procedures: Object.keys(procedures).length > 0 ? procedures : undefined
            };

            await productService.createProduct(productData);

            // Navigate back to product management with success
            onNavigate('manage-products');

        } catch (err) {
            await handleApiError(err);
        } finally {
            setSubmitting(false);
        }
    };

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('el-GR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatProfitMargin = (finalPrice: number, cost: number) : string => {
        if (finalPrice === 0) {
            return '0%'; // or handle this case differently based on your requirements
        }
        const margin = ((finalPrice - cost) * 100 / finalPrice);
        return `${Math.round(margin * 100) / 100}%`;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Button
                            onClick={() => onNavigate('manage-products')}
                            variant="outline-secondary"
                            size="sm"
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Πίσω
                        </Button>
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Δημιουργία Νέου Προϊόντος</h1>
                            <p className="text-gray-600">Συμπληρώστε τα στοιχεία του νέου προϊόντος</p>
                        </div>
                    </div>
                </div>

                {/* Error Display */}
                {generalError && (
                    <Alert variant="error" className="shadow-sm" onClose={clearErrors}>
                        {generalError}
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Basic Info */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Basic Information */}
                            <DashboardCard title="Βασικά Στοιχεία" className="shadow-lg">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Όνομα Προϊόντος"
                                        type="text"
                                        value={productName}
                                        onChange={(e) => {
                                            setProductName(e.target.value);
                                            clearFieldError('name');
                                        }}
                                        error={fieldErrors.name}
                                        placeholder="π.χ. Χρυσό Δαχτυλίδι με Διαμάντι"
                                        required
                                    />
                                    <Input
                                        label="Κωδικός Προϊόντος"
                                        type="text"
                                        value={productCode}
                                        onChange={(e) => {
                                            setProductCode(e.target.value);
                                            clearFieldError('code');
                                        }}
                                        error={fieldErrors.code}
                                        placeholder="π.χ. RNG-001"
                                        required
                                    />
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Κατηγορία *
                                        </label>
                                        <select
                                            value={selectedCategoryId || ''}
                                            onChange={(e) => {
                                                setSelectedCategoryId(e.target.value ? Number(e.target.value) : undefined);
                                                clearFieldError('categoryId');
                                            }}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${fieldErrors.categoryId ? 'border-red-300' : 'border-gray-300'}`}
                                            required
                                        >
                                            <option value="">Επιλέξτε κατηγορία</option>
                                            {categories.map(category => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                        {fieldErrors.categoryId && (
                                            <p className="mt-1 text-sm text-red-600">{fieldErrors.categoryId}</p>
                                        )}
                                    </div>
                                    <Input
                                        label="Χρόνος Παραγωγής (λεπτά)"
                                        type="number"
                                        min="0"
                                        value={minutesToMake}
                                        onChange={(e) => setMinutesToMake(Number(e.target.value) || 0)}
                                        placeholder="0"
                                    />
                                    <Input
                                        label="Αρχικό Απόθεμα"
                                        type="number"
                                        min="0"
                                        value={stock}
                                        onChange={(e) => setStock(Number(e.target.value) || 0)}
                                        placeholder="0"
                                    />
                                    <Input
                                        label="Όριο Συναγερμού"
                                        type="number"
                                        min="0"
                                        value={lowStockAlert}
                                        onChange={(e) => setLowStockAlert(Number(e.target.value) || 0)}
                                        placeholder="5"
                                    />

                                </div>
                            </DashboardCard>

                            {/* Material Selection */}
                            <DashboardCard title="Υλικά" className="shadow-lg" height='md'>
                                <div className="space-y-4">
                                    {/* Material Search */}
                                    <div className="relative">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Αναζήτηση Υλικών
                                        </label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                type="text"
                                                placeholder="Αναζήτηση υλικών..."
                                                value={materialSearchTerm}
                                                onChange={(e) => {
                                                    setMaterialSearchTerm(e.target.value);
                                                    searchMaterials(e.target.value);
                                                }}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                            />
                                        </div>

                                        {/* Material Search Results */}
                                        {materialSearchTerm && materialSearchResults.length > 0 && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                {materialSearchResults.map((material) => (
                                                    <div
                                                        key={material.materialId}
                                                        onClick={() => addMaterial(material)}
                                                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                                    >
                                                        <div className="font-medium text-gray-900">{material.materialName}</div>
                                                        <div className="text-sm text-gray-600">
                                                            {formatCurrency(material.currentUnitCost)} / {material.unitOfMeasure}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Selected Materials */}
                                    {selectedMaterials.length > 0 && (
                                        <div className="space-y-3">
                                            <h4 className="font-medium text-gray-900">Επιλεγμένα Υλικά</h4>
                                            {selectedMaterials.map((material) => (
                                                <div key={material.materialId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex-1">
                                                        <div className="font-medium text-gray-900">{material.materialName}</div>
                                                        <div className="text-sm text-gray-600">
                                                            {formatCurrency(material.unitCost)} / {material.unitOfMeasure}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            type="button"
                                                            onClick={() => updateMaterialQuantity(material.materialId, material.quantity - 1)}
                                                            variant="outline-secondary"
                                                            size="sm"
                                                        >
                                                            <Minus className="w-4 h-4" />
                                                        </Button>
                                                        <span className="min-w-12 text-center font-medium">
                                                            {material.quantity}
                                                        </span>
                                                        <Button
                                                            type="button"
                                                            onClick={() => updateMaterialQuantity(material.materialId, material.quantity + 1)}
                                                            variant="outline-secondary"
                                                            size="sm"
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-medium text-gray-900">
                                                            {formatCurrency(material.totalCost)}
                                                        </div>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        onClick={() => removeMaterial(material.materialId)}
                                                        variant="danger"
                                                        size="sm"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </DashboardCard>

                            {/* Procedure Selection */}
                            <DashboardCard title="Διαδικασίες" className="shadow-lg" height='md'>
                                <div className="space-y-4">
                                    {/* Procedure Search */}
                                    <div className="relative">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Αναζήτηση Διαδικασιών
                                        </label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                type="text"
                                                placeholder="Αναζήτηση διαδικασιών..."
                                                value={procedureSearchTerm}
                                                onChange={(e) => {
                                                    setProcedureSearchTerm(e.target.value);
                                                    searchProcedures(e.target.value);
                                                    setShowProcedureDropdown(true);
                                                }}
                                                onFocus={() => setShowProcedureDropdown(true)}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                            />
                                        </div>

                                        {/* Procedure Search Results */}
                                        {showProcedureDropdown && filteredProcedures.length > 0 && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                {filteredProcedures
                                                    .filter(procedure => !selectedProcedures.some(sp => sp.procedureId === procedure.id))
                                                    .map((procedure) => (
                                                        <div
                                                            key={procedure.id}
                                                            onClick={() => addProcedure(procedure)}
                                                            className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                                        >
                                                            <div className="font-medium text-gray-900">{procedure.name}</div>
                                                        </div>
                                                    ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Selected Procedures */}
                                    {selectedProcedures.length > 0 && (
                                        <div className="space-y-3">
                                            <h4 className="font-medium text-gray-900">Επιλεγμένες Διαδικασίες</h4>
                                            {selectedProcedures.map((procedure) => (
                                                <div key={procedure.procedureId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex-1">
                                                        <div className="font-medium text-gray-900">{procedure.procedureName}</div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-gray-600">Κόστος:</span>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={procedure.cost}
                                                            onChange={(e) => updateProcedureCost(procedure.procedureId, Number(e.target.value) || 0)}
                                                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                                            placeholder="0.00"
                                                        />
                                                        <span className="text-sm text-gray-600">€</span>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        onClick={() => removeProcedure(procedure.procedureId)}
                                                        variant="danger"
                                                        size="sm"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </DashboardCard>

                            {/* Stock & Pricing */}
                            <DashboardCard title="Απόθεμα & Τιμές" className="shadow-lg">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Αρχικό Απόθεμα"
                                        type="number"
                                        min="0"
                                        value={stock}
                                        onChange={(e) => setStock(Number(e.target.value) || 0)}
                                        placeholder="0"
                                    />
                                    <Input
                                        label="Όριο Συναγερμού"
                                        type="number"
                                        min="0"
                                        value={lowStockAlert}
                                        onChange={(e) => setLowStockAlert(Number(e.target.value) || 0)}
                                        placeholder="5"
                                    />
                                    <Input
                                        label="Τελική Τιμή Λιανικής (€)"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={finalSellingPriceRetail}
                                        onChange={(e) => setFinalSellingPriceRetail(Number(e.target.value) || 0)}
                                        placeholder="0.00"
                                    />
                                    <Input
                                        label="Τελική Τιμή Χονδρικής (€)"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={finalSellingPriceWholesale}
                                        onChange={(e) => setFinalSellingPriceWholesale(Number(e.target.value) || 0)}
                                        placeholder="0.00"
                                    />
                                </div>
                            </DashboardCard>
                        </div>

                        {/* Right Column - Price Calculation */}
                        <div className="space-y-6">
                            <DashboardCard
                                title="Υπολογισμός Κόστους"
                                icon={<Calculator className="w-5 h-5" />}
                                className="shadow-lg sticky top-6"
                            >
                                <div className="space-y-4">
                                    {/* No loading state needed - calculation is instant */}
                                    {/* Cost Breakdown */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Κόστος Υλικών:</span>
                                            <span className="font-medium">{formatCurrency(priceCalculation.materialCost)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Κόστος Εργασίας:</span>
                                            <span className="font-medium">{formatCurrency(priceCalculation.laborCost)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Κόστος Διαδικασιών:</span>
                                            <span className="font-medium">{formatCurrency(priceCalculation.procedureCost)}</span>
                                        </div>
                                        <hr className="border-gray-200" />
                                        <div className="flex justify-between font-medium">
                                            <span className="text-gray-900">Συνολικό Κόστος:</span>
                                            <span className="text-blue-600">{formatCurrency(priceCalculation.totalCost)}</span>
                                        </div>
                                    </div>

                                    {/* Suggested Prices */}
                                    <div className="pt-4 border-t border-gray-200">
                                        <h4 className="font-medium text-gray-900 mb-3">Προτεινόμενες Τιμές</h4>
                                        <div className="space-y-3">
                                            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-medium text-green-800">Λιανική:</span>
                                                    <span className="font-bold text-green-900">
                                                        {formatCurrency(priceCalculation.suggestedRetailPrice)}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-green-600 mt-1">
                                                    Κόστος × 3.0
                                                </div>
                                            </div>
                                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-medium text-blue-800">Χονδρική:</span>
                                                    <span className="font-bold text-blue-900">
                                                        {formatCurrency(priceCalculation.suggestedWholesalePrice)}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-blue-600 mt-1">
                                                    Κόστος × 1.86
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <Input
                                        label="Τελική Τιμή Λιανικής (€)"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={finalSellingPriceRetail}
                                        onChange={(e) => setFinalSellingPriceRetail(Number(e.target.value) || 0)}
                                        placeholder="0.00"
                                    />
                                    <Input
                                        label="Τελική Τιμή Χονδρικής (€)"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={finalSellingPriceWholesale}
                                        onChange={(e) => setFinalSellingPriceWholesale(Number(e.target.value) || 0)}
                                        placeholder="0.00"
                                    />

                                    {/* Profit Margins */}
                                    {(finalSellingPriceRetail > 0 || finalSellingPriceWholesale > 0) && (
                                        <div className="pt-4 border-t border-gray-200">
                                            <h4 className="font-medium text-gray-900 mb-3">Περιθώρια Κέρδους</h4>
                                            <div className="space-y-2">
                                                {finalSellingPriceRetail > 0 && (
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-600">Λιανική:</span>
                                                        <span className={`font-medium ${
                                                            finalSellingPriceRetail > priceCalculation.totalCost
                                                                ? 'text-green-600'
                                                                : 'text-red-600'
                                                        }`}>
                                                            {formatProfitMargin(finalSellingPriceRetail,priceCalculation.totalCost)}
                                                        </span>
                                                    </div>
                                                )}
                                                {finalSellingPriceWholesale > 0 && (
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-600">Χονδρική:</span>
                                                        <span className={`font-medium ${
                                                            finalSellingPriceWholesale > priceCalculation.totalCost
                                                                ? 'text-green-600'
                                                                : 'text-red-600'
                                                        }`}>
                                                            {formatProfitMargin(finalSellingPriceWholesale,priceCalculation.totalCost)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </DashboardCard>

                            {/* Action Buttons */}
                            <DashboardCard className="shadow-lg">
                                <div className="space-y-3">
                                    <Button
                                        type="submit"
                                        disabled={submitting || !productName.trim() || !productCode.trim() || !selectedCategoryId}
                                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
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
                                    <Button
                                        type="button"
                                        onClick={() => onNavigate('manage-products')}
                                        variant="outline-secondary"
                                        className="w-full"
                                        disabled={submitting}
                                    >
                                        Ακύρωση
                                    </Button>
                                </div>
                            </DashboardCard>
                        </div>
                    </div>
                </form>

                {/* Click outside to close dropdowns */}
                {( showProcedureDropdown) && (
                    <div
                        className="fixed inset-0 z-5"
                        onClick={() => {
                            setShowProcedureDropdown(false);
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default CreateProductPage;