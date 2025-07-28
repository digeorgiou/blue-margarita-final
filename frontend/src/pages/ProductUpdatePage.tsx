import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import { procedureService } from '../services/procedureService';
import { categoryService } from '../services/categoryService';
import { materialService } from '../services/materialService';
import { Button, LoadingSpinner, Input, Alert } from '../components/ui';
import DashboardCard from '../components/ui/DashboardCard';
import { Package, Plus, Minus, Trash2, Search, Calculator, ArrowLeft, Save, Edit } from 'lucide-react';
import { useFormErrorHandler } from '../hooks/useFormErrorHandler';
import type {
    ProductUpdateDTO,
    ProductDetailedViewDTO,
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

    // Product data
    const [product, setProduct] = useState<ProductDetailedViewDTO | null>(null);

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
    const [procedures, setProcedures] = useState<ProcedureForDropdownDTO[]>([]);

    // Search and filtering
    const [materialSearchTerm, setMaterialSearchTerm] = useState('');
    const [materialSearchResults, setMaterialSearchResults] = useState<MaterialSearchResultDTO[]>([]);
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
        loadProductData();
        loadDropdownData();
    }, [productId]);

    // Recalculate prices whenever materials, procedures, or minutesToMake change
    useEffect(() => {
        calculatePrices();
    }, [selectedMaterials, selectedProcedures, minutesToMake]);

    const loadProductData = async () => {
        try {
            setLoading(true);
            const productData = await productService.getProductDetails(productId);
            setProduct(productData);

            // Populate form fields using correct field names
            setName(productData.name);
            setCode(productData.code);
            setCategoryId(productData.categoryId);
            setMinutesToMake(productData.minutesToMake || 0);
            setFinalRetailPrice(productData.finalRetailPrice || 0);
            setFinalWholesalePrice(productData.finalWholesalePrice || 0);
            setCurrentStock(productData.currentStock || 0);
            setLowStockAlert(productData.lowStockAlert || 0);

            // Set materials and procedures
            setSelectedMaterials(productData.materials || []);
            setSelectedProcedures(productData.procedures || []);
        } catch (err) {
            await handleApiError(err);
        } finally {
            setLoading(false);
        }
    };

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

    // Procedure search
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
        } catch (err) {
            console.error('Procedure search error:', err);
            setFilteredProcedures([]);
        }
    };

    // Material management using productService methods with updaterUserId
    const addMaterial = async (material: MaterialSearchResultDTO) => {
        try {
            // Check if material is already selected
            if (selectedMaterials.some(m => m.materialId === material.materialId)) {
                return;
            }

            // Use productService with updaterUserId
            await productService.addMaterialToProduct(productId, material.materialId, 1, getCurrentUserId());

            // Update local state
            const newMaterial: ProductMaterialDetailDTO = {
                materialId: material.materialId,
                materialName: material.materialName,
                quantity: 1,
                unitOfMeasure: material.unitOfMeasure,
                unitCost: material.currentUnitCost,
                totalCost: material.currentUnitCost
            };

            setSelectedMaterials(prev => [...prev, newMaterial]);
            setMaterialSearchTerm('');
            setMaterialSearchResults([]);
        } catch (err) {
            await handleApiError(err);
        }
    };

    const updateMaterialQuantity = async (materialId: number, newQuantity: number) => {
        try {
            if (newQuantity <= 0) {
                await removeMaterial(materialId);
                return;
            }

            // Use productService to update quantity (backend replaces existing)
            await productService.addMaterialToProduct(productId, materialId, newQuantity, getCurrentUserId());

            // Update local state
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
        } catch (err) {
            await handleApiError(err);
        }
    };

    const removeMaterial = async (materialId: number) => {
        try {
            // Use productService with updaterUserId
            await productService.removeMaterialFromProduct(productId, materialId, getCurrentUserId());

            // Update local state
            setSelectedMaterials(prev => prev.filter(m => m.materialId !== materialId));
        } catch (err) {
            await handleApiError(err);
        }
    };

    // Procedure management using productService methods with updaterUserId
    const addProcedure = async (procedure: ProcedureForDropdownDTO) => {
        try {
            // Check if procedure is already selected
            if (selectedProcedures.some(p => p.procedureId === procedure.id)) {
                return;
            }

            // Use productService with updaterUserId
            await productService.addProcedureToProduct(productId, procedure.id, 0.01, getCurrentUserId());

            // Update local state
            const newProcedure: ProductProcedureDetailDTO = {
                procedureId: procedure.id,
                procedureName: procedure.name,
                cost: 0.01 // Start with minimum cost
            };

            setSelectedProcedures(prev => [...prev, newProcedure]);
            setProcedureSearchTerm('');
            setFilteredProcedures(procedures);
            setShowProcedureDropdown(false);
        } catch (err) {
            await handleApiError(err);
        }
    };

    const updateProcedureCost = async (procedureId: number, newCost: number) => {
        try {
            // Ensure minimum cost of 0.01
            const cost = Math.max(0.01, newCost);

            // Use productService to update cost (backend replaces existing)
            await productService.addProcedureToProduct(productId, procedureId, cost, getCurrentUserId());

            // Update local state
            setSelectedProcedures(prev =>
                prev.map(procedure =>
                    procedure.procedureId === procedureId
                        ? { ...procedure, cost }
                        : procedure
                )
            );
        } catch (err) {
            await handleApiError(err);
        }
    };

    const removeProcedure = async (procedureId: number) => {
        try {
            // Use productService with updaterUserId
            await productService.removeProcedureFromProduct(productId, procedureId, getCurrentUserId());

            // Update local state
            setSelectedProcedures(prev => prev.filter(p => p.procedureId !== procedureId));
        } catch (err) {
            await handleApiError(err);
        }
    };

    // Form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearErrors();

        try {
            setSubmitting(true);

            // Using correct field names from ProductUpdateDTO interface
            const updateData: ProductUpdateDTO = {
                productId: productId,
                name,
                code,
                categoryId: categoryId!,
                finalSellingPriceRetail: finalRetailPrice,
                finalSellingPriceWholesale: finalWholesalePrice,
                minutesToMake,
                stock: currentStock,
                lowStockAlert: lowStockAlert,
                updaterUserId: getCurrentUserId()
            };

            await productService.updateProduct(productId, updateData);
            onNavigate('products'); // Navigate back to products list
        } catch (err) {
            await handleApiError(err);
        } finally {
            setSubmitting(false);
        }
    };

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('el-GR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner/>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="p-6">
                <Alert
                    variant="error"
                    title="Product Not Found"
                />
                <Button
                    onClick={() => onNavigate('products')}
                    className="mt-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Products
                </Button>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                    <Button
                        variant="ghost-primary"
                        onClick={() => onNavigate('products')}
                        className="text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                            <Edit className="w-6 h-6 mr-3 text-blue-600" />
                            Update Product: {product.name}
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Modify product details, materials, and procedures with automatic price calculations
                        </p>
                    </div>
                </div>
            </div>

            {/* Error Alert */}
            {generalError && (
                <Alert
                    variant="error"
                    title="Error"
                    className="mb-6"
                />
            )}

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Product Details */}
                    <div className="space-y-6">
                        {/* Basic Information */}
                        <DashboardCard
                            title="Basic Information"
                            icon={<Package className="w-5 h-5" />}
                        >
                            <div className="space-y-4">
                                <Input
                                    label="Product Name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        clearFieldError('name');
                                    }}
                                    error={fieldErrors.name}
                                    placeholder="Enter product name"
                                    required
                                />
                                <Input
                                    label="Product Code"
                                    type="text"
                                    value={code}
                                    onChange={(e) => {
                                        setCode(e.target.value);
                                        clearFieldError('code');
                                    }}
                                    error={fieldErrors.code}
                                    placeholder="Enter unique product code"
                                    required
                                />
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Category
                                    </label>
                                    <select
                                        value={categoryId || ''}
                                        onChange={(e) => {
                                            setCategoryId(Number(e.target.value) || null);
                                            clearFieldError('categoryId');
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="">Select category</option>
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
                                    label="Minutes to Make"
                                    type="number"
                                    min="0"
                                    value={minutesToMake}
                                    onChange={(e) => setMinutesToMake(Number(e.target.value) || 0)}
                                    placeholder="0"
                                />
                                <Input
                                    label="Current Stock"
                                    type="number"
                                    min="0"
                                    value={currentStock}
                                    onChange={(e) => setCurrentStock(Number(e.target.value) || 0)}
                                    placeholder="0"
                                />
                                <Input
                                    label="Low Stock Alert Level"
                                    type="number"
                                    min="0"
                                    value={lowStockAlert}
                                    onChange={(e) => setLowStockAlert(Number(e.target.value) || 0)}
                                    placeholder="0"
                                />
                            </div>
                        </DashboardCard>

                        {/* Materials */}
                        <DashboardCard title="Materials" className="max-h-96 overflow-y-auto">
                            <div className="space-y-4">
                                {/* Material Search */}
                                <div className="relative">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            value={materialSearchTerm}
                                            onChange={(e) => {
                                                setMaterialSearchTerm(e.target.value);
                                                searchMaterials(e.target.value);
                                            }}
                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Search materials..."
                                        />
                                    </div>

                                    {/* Search Results */}
                                    {materialSearchResults.length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                            {materialSearchResults.map(material => (
                                                <button
                                                    key={material.materialId}
                                                    type="button"
                                                    onClick={() => addMaterial(material)}
                                                    className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                                                >
                                                    <div className="flex justify-between">
                                                        <span className="font-medium">{material.materialName}</span>
                                                        <span className="text-sm text-gray-500">
                                                            {formatCurrency(material.currentUnitCost)}/{material.unitOfMeasure}
                                                        </span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Selected Materials */}
                                <div className="space-y-2">
                                    {selectedMaterials.map(material => (
                                        <div key={material.materialId} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                                            <div className="flex-1">
                                                <div className="font-medium">{material.materialName}</div>
                                                <div className="text-sm text-gray-500">
                                                    {formatCurrency(material.unitCost)} per {material.unitOfMeasure}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    type="button"
                                                    onClick={() => updateMaterialQuantity(material.materialId, material.quantity - 1)}
                                                    className="p-1 text-gray-400 hover:text-gray-600"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <input
                                                    type="number"
                                                    value={material.quantity}
                                                    onChange={(e) => updateMaterialQuantity(material.materialId, Number(e.target.value) || 0)}
                                                    className="w-16 px-2 py-1 text-center border border-gray-300 rounded"
                                                    min="0"
                                                    step="0.01"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => updateMaterialQuantity(material.materialId, material.quantity + 1)}
                                                    className="p-1 text-gray-400 hover:text-gray-600"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => removeMaterial(material.materialId)}
                                                    className="p-1 text-red-400 hover:text-red-600"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-medium">
                                                    {formatCurrency(material.totalCost)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </DashboardCard>

                        {/* Procedures */}
                        <DashboardCard title="Procedures" className="max-h-96 overflow-y-auto">
                            <div className="space-y-4">
                                {/* Procedure Search */}
                                <div className="relative">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            value={procedureSearchTerm}
                                            onChange={(e) => {
                                                setProcedureSearchTerm(e.target.value);
                                                searchProcedures(e.target.value);
                                            }}
                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Search procedures..."
                                        />
                                    </div>

                                    {/* Search Results */}
                                    {showProcedureDropdown && filteredProcedures.length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                            {filteredProcedures.map(procedure => (
                                                <button
                                                    key={procedure.id}
                                                    type="button"
                                                    onClick={() => addProcedure(procedure)}
                                                    className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                                                >
                                                    {procedure.name}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Selected Procedures */}
                                <div className="space-y-2">
                                    {selectedProcedures.map(procedure => (
                                        <div key={procedure.procedureId} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                                            <div className="flex-1">
                                                <div className="font-medium">{procedure.procedureName}</div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="number"
                                                    value={procedure.cost}
                                                    onChange={(e) => updateProcedureCost(procedure.procedureId, Number(e.target.value) || 0)}
                                                    className="w-24 px-2 py-1 text-center border border-gray-300 rounded"
                                                    min="0"
                                                    step="0.01"
                                                    placeholder="Cost"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeProcedure(procedure.procedureId)}
                                                    className="p-1 text-red-400 hover:text-red-600"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </DashboardCard>

                        {/* Final Prices */}
                        <DashboardCard title="Final Selling Prices">
                            <div className="space-y-4">
                                <Input
                                    label="Final Retail Price (€)"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={finalRetailPrice}
                                    onChange={(e) => setFinalRetailPrice(Number(e.target.value) || 0)}
                                    placeholder="0.00"
                                />
                                <Input
                                    label="Final Wholesale Price (€)"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={finalWholesalePrice}
                                    onChange={(e) => setFinalWholesalePrice(Number(e.target.value) || 0)}
                                    placeholder="0.00"
                                />
                            </div>
                        </DashboardCard>
                    </div>

                    {/* Right Column - Price Calculation */}
                    <div className="space-y-6">
                        <DashboardCard
                            title="Cost Calculation"
                            icon={<Calculator className="w-5 h-5" />}
                            className="shadow-lg sticky top-6"
                        >
                            <div className="space-y-4">
                                {/* Cost Breakdown */}
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Material Cost:</span>
                                        <span className="font-medium">{formatCurrency(priceCalculation.materialCost)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Labor Cost:</span>
                                        <span className="font-medium">{formatCurrency(priceCalculation.laborCost)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Procedure Cost:</span>
                                        <span className="font-medium">{formatCurrency(priceCalculation.procedureCost)}</span>
                                    </div>
                                    <hr className="border-gray-200" />
                                    <div className="flex justify-between font-medium">
                                        <span className="text-gray-900">Total Cost:</span>
                                        <span className="text-blue-600">{formatCurrency(priceCalculation.totalCost)}</span>
                                    </div>
                                </div>

                                {/* Suggested Prices */}
                                <div className="pt-4 border-t border-gray-200">
                                    <h4 className="font-medium text-gray-900 mb-3">Suggested Prices</h4>
                                    <div className="space-y-3">
                                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-blue-800">Wholesale:</span>
                                                <span className="font-bold text-blue-900">
                                                    {formatCurrency(priceCalculation.suggestedWholesalePrice)}
                                                </span>
                                            </div>
                                            <div className="text-xs text-blue-600 mt-1">
                                                Cost × 1.86
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Price Comparison */}
                                {(finalRetailPrice > 0 || finalWholesalePrice > 0) && (
                                    <div className="pt-4 border-t border-gray-200">
                                        <h4 className="font-medium text-gray-900 mb-3">Price Comparison</h4>
                                        <div className="space-y-2">
                                            {finalRetailPrice > 0 && (
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-600">Retail Difference:</span>
                                                    <span className={`font-medium ${
                                                        finalRetailPrice > priceCalculation.suggestedRetailPrice
                                                            ? 'text-green-600'
                                                            : 'text-red-600'
                                                    }`}>
                                                        {finalRetailPrice > priceCalculation.suggestedRetailPrice ? '+' : ''}
                                                        {formatCurrency(finalRetailPrice - priceCalculation.suggestedRetailPrice)}
                                                    </span>
                                                </div>
                                            )}
                                            {finalWholesalePrice > 0 && (
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-600">Wholesale Difference:</span>
                                                    <span className={`font-medium ${
                                                        finalWholesalePrice > priceCalculation.suggestedWholesalePrice
                                                            ? 'text-green-600'
                                                            : 'text-red-600'
                                                    }`}>
                                                        {finalWholesalePrice > priceCalculation.suggestedWholesalePrice ? '+' : ''}
                                                        {formatCurrency(finalWholesalePrice - priceCalculation.suggestedWholesalePrice)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Labor Cost Breakdown */}
                                {minutesToMake > 0 && (
                                    <div className="pt-4 border-t border-gray-200">
                                        <h4 className="font-medium text-gray-900 mb-2">Labor</h4>
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <div>{minutesToMake} minutes = {(minutesToMake / 60).toFixed(2)} hours</div>
                                            <div>{(minutesToMake / 60).toFixed(2)} × {formatCurrency(HOURLY_LABOR_RATE)}/hour</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </DashboardCard>

                        {/* Current vs Suggested Prices Card */}
                        {product && (
                            <DashboardCard title="Current Prices" className="bg-gray-50">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Current Retail:</span>
                                        <span className="font-medium">{formatCurrency(product.finalRetailPrice || 0)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Suggested Retail:</span>
                                        <span className="font-medium">{formatCurrency(product.suggestedRetailPrice || 0)}</span>
                                    </div>
                                    <hr className="border-gray-200" />
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Current Wholesale:</span>
                                        <span className="font-medium">{formatCurrency(product.finalWholesalePrice || 0)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Suggested Wholesale:</span>
                                        <span className="font-medium">{formatCurrency(product.suggestedWholesalePrice || 0)}</span>
                                    </div>
                                </div>
                            </DashboardCard>
                        )}

                        {/* Update Actions */}
                        <DashboardCard title="Actions">
                            <div className="space-y-4">
                                <Button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full"
                                >
                                    {submitting ? (
                                        <>
                                            <LoadingSpinner/>
                                            Updating Product...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            Update Product
                                        </>
                                    )}
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline-primary"
                                    onClick={() => setFinalRetailPrice(priceCalculation.suggestedRetailPrice)}
                                    className="w-full"
                                >
                                    Use Suggested Retail Price
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline-primary"
                                    onClick={() => setFinalWholesalePrice(priceCalculation.suggestedWholesalePrice)}
                                    className="w-full"
                                >
                                    Use Suggested Wholesale Price
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline-primary"
                                    onClick={() => {
                                        setFinalRetailPrice(priceCalculation.suggestedRetailPrice);
                                        setFinalWholesalePrice(priceCalculation.suggestedWholesalePrice);
                                    }}
                                    className="w-full"
                                >
                                    Use All Suggested Prices
                                </Button>
                            </div>
                        </DashboardCard>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default UpdateProductPage;