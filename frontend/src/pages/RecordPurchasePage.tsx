import React, { useState } from 'react';
import { recordPurchaseService } from '../services/recordPurchaseService';
import {
    RecordPurchaseRequestDTO
} from "../types/api/recordPurchaseInterface";
import { PurchaseDetailedViewDTO } from "../types/api/purchaseInterface";
import { SupplierSearchResultDTO } from "../types/api/supplierInterface";
import { MaterialSearchResultDTO } from "../types/api/materialInterface";
import { Button, LoadingSpinner, Input, Alert } from '../components/ui';
import DashboardCard from '../components/ui/DashboardCard';
import { ShoppingCart, User, Package, Calendar, Plus, Minus, Trash2 } from 'lucide-react';
import { PurchaseSuccessModal } from '../components/ui/modals/PurchaseSuccessModal';
import {materialService} from "../services/materialService.ts";

interface RecordPurchasePageProps {
    onNavigate: (page: string) => void;
}

interface MaterialCartItem {
    materialId: number;
    materialName: string;
    unitOfMeasure: string;
    currentUnitCost: number;
    quantity: number;
    pricePerUnit: number;
    lineTotal: number;
}

const RecordPurchasePage: React.FC<RecordPurchasePageProps> = () => {
    // Loading states
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Form states
    const [selectedSupplier, setSelectedSupplier] = useState<SupplierSearchResultDTO | null>(null);
    const [purchaseDate, setPurchaseDate] = useState<string>(new Date().toISOString().split('T')[0]);

    // Cart states
    const [cart, setCart] = useState<MaterialCartItem[]>([]);

    // Search states
    const [supplierSearchTerm, setSupplierSearchTerm] = useState<string>('');
    const [materialSearchTerm, setMaterialSearchTerm] = useState<string>('');
    const [supplierSearchResults, setSupplierSearchResults] = useState<SupplierSearchResultDTO[]>([]);
    const [materialSearchResults, setMaterialSearchResults] = useState<MaterialSearchResultDTO[]>([]);

    // Modal states
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [recordedPurchaseDetails, setRecordedPurchaseDetails] = useState<PurchaseDetailedViewDTO | null>(null);

    // Format money helper
    const formatMoney = (amount: number): string => {
        return `€${amount.toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    // Search suppliers
    const searchSuppliers = async (term: string) => {
        if (term.length < 2) {
            setSupplierSearchResults([]);
            return;
        }

        try {
            const results = await recordPurchaseService.searchSuppliers(term);
            setSupplierSearchResults(results);
        } catch (err) {
            console.error('Supplier search error:', err);
            setSupplierSearchResults([]);
        }
    };

    // Search materials
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

    // Add material to cart
    const addMaterialToCart = (material: MaterialSearchResultDTO) => {
        const existingItem = cart.find(item => item.materialId === material.materialId);

        if (existingItem) {
            updateMaterialQuantity(material.materialId, existingItem.quantity + 1);
        } else {
            const newItem: MaterialCartItem = {
                materialId: material.materialId,
                materialName: material.materialName,
                unitOfMeasure: material.unitOfMeasure,
                currentUnitCost: material.currentUnitCost,
                quantity: 1,
                pricePerUnit: material.currentUnitCost,
                lineTotal: material.currentUnitCost
            };
            setCart([...cart, newItem]);
        }

        setMaterialSearchTerm('');
        setMaterialSearchResults([]);
    };

    // Update material quantity
    const updateMaterialQuantity = (materialId: number, newQuantity: number) => {
        if (newQuantity <= 0) {
            removeMaterialFromCart(materialId);
            return;
        }

        setCart(cart.map(item =>
            item.materialId === materialId
                ? { ...item, quantity: newQuantity, lineTotal: item.pricePerUnit * newQuantity }
                : item
        ));
    };

    // Update material price per unit
    const updateMaterialPrice = (materialId: number, newPrice: number) => {
        if (newPrice < 0) return;

        setCart(cart.map(item =>
            item.materialId === materialId
                ? { ...item, pricePerUnit: newPrice, lineTotal: newPrice * item.quantity }
                : item
        ));
    };

    // Remove material from cart
    const removeMaterialFromCart = (materialId: number) => {
        setCart(cart.filter(item => item.materialId !== materialId));
    };

    // Calculate totals
    const calculateTotals = () => {
        const totalCost = cart.reduce((sum, item) => sum + item.lineTotal, 0);
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

        return { totalCost, totalItems };
    };

    // Validate form
    const isFormValid = (): boolean => {
        return !!(selectedSupplier && cart.length > 0 && purchaseDate);
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (!selectedSupplier) {
            setError('Παρακαλώ επιλέξτε προμηθευτή');
            return;
        }

        if (cart.length === 0) {
            setError('Παρακαλώ προσθέστε τουλάχιστον ένα υλικό');
            return;
        }

        if (!purchaseDate) {
            setError('Παρακαλώ επιλέξτε ημερομηνία αγοράς');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            const request: RecordPurchaseRequestDTO = {
                supplierId: selectedSupplier.supplierId,
                purchaseDate,
                materials: cart.map(item => ({
                    materialId: item.materialId,
                    quantity: item.quantity,
                    pricePerUnit: item.pricePerUnit
                })),
                creatorUserId: 1 // TODO: Get from auth context
            };

            const result = await recordPurchaseService.recordPurchase(request);
            setRecordedPurchaseDetails(result);
            setShowSuccessModal(true);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to record purchase');
        } finally {
            setSubmitting(false);
        }
    };

    // Reset form after successful submission
    const resetForm = () => {
        setSelectedSupplier(null);
        setCart([]);
        setPurchaseDate(new Date().toISOString().split('T')[0]);
        setSupplierSearchTerm('');
        setMaterialSearchTerm('');
        setSupplierSearchResults([]);
        setMaterialSearchResults([]);
        setError(null);
        setShowSuccessModal(false);
        setRecordedPurchaseDetails(null);
    };

    const { totalCost, totalItems } = calculateTotals();

    return (
        <div className="p-6 space-y-6">
            {/* Top Row: Filters + Summary Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    {/* Filters Card */}
                    <DashboardCard height="sm">
                        <div className="space-y-4">
                            {/* First row: Materials + Date */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Material Search */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Package className="w-4 h-4 inline mr-1" />
                                        Υλικά
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={materialSearchTerm}
                                            onChange={(e) => {
                                                setMaterialSearchTerm(e.target.value);
                                                searchMaterials(e.target.value);
                                            }}
                                            placeholder="Αναζήτηση υλικών..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />

                                        {/* Material Search Results */}
                                        {materialSearchTerm && materialSearchResults.length > 0 && (
                                            <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
                                                {materialSearchResults.map((material) => (
                                                    <button
                                                        key={material.materialId}
                                                        onClick={() => addMaterialToCart(material)}
                                                        className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0 transition-colors"
                                                    >
                                                        <div className="flex items-center">
                                                            <Package className="w-4 h-4 text-gray-400 mr-3" />
                                                            <div className="flex-1">
                                                                <div className="font-medium text-gray-900">
                                                                    {material.materialName}
                                                                </div>
                                                                <div className="text-sm text-gray-600">
                                                                    {formatMoney(material.currentUnitCost)}/{material.unitOfMeasure}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Purchase Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Calendar className="w-4 h-4 inline mr-1" />
                                        Ημερομηνία Αγοράς
                                    </label>
                                    <Input
                                        type="date"
                                        value={purchaseDate}
                                        onChange={(e) => setPurchaseDate(e.target.value)}
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            {/* Second row: Supplier Search + Selected Supplier */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Supplier Search */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <User className="w-4 h-4 inline mr-1" />
                                        Προμηθευτής
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={selectedSupplier ? selectedSupplier.supplierName : supplierSearchTerm}
                                            onChange={(e) => {
                                                if (selectedSupplier) {
                                                    setSelectedSupplier(null);
                                                }
                                                setSupplierSearchTerm(e.target.value);
                                                searchSuppliers(e.target.value);
                                            }}
                                            placeholder="Αναζήτηση προμηθευτή..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />

                                        {/* Supplier Search Results */}
                                        {supplierSearchTerm && !selectedSupplier && supplierSearchResults.length > 0 && (
                                            <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
                                                {supplierSearchResults.map((supplier) => (
                                                    <button
                                                        key={supplier.supplierId}
                                                        onClick={() => {
                                                            setSelectedSupplier(supplier);
                                                            setSupplierSearchTerm('');
                                                            setSupplierSearchResults([]);
                                                        }}
                                                        className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0 transition-colors"
                                                    >
                                                        <div className="flex items-center">
                                                            <User className="w-4 h-4 text-gray-400 mr-3" />
                                                            <div>
                                                                <div className="font-medium text-gray-900">
                                                                    {supplier.supplierName}
                                                                </div>
                                                                {supplier.email && (
                                                                    <div className="text-sm text-gray-600">
                                                                        {supplier.email}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Selected Supplier Display */}
                                <div>
                                    {selectedSupplier ? (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Επιλεγμένος Προμηθευτής
                                            </label>
                                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <User className="w-4 h-4 text-blue-600 mr-2" />
                                                        <div>
                                                            <div className="text-sm font-medium text-blue-900">
                                                                {selectedSupplier.supplierName}
                                                            </div>
                                                            {selectedSupplier.email && (
                                                                <div className="text-xs text-blue-700">
                                                                    {selectedSupplier.email}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => setSelectedSupplier(null)}
                                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                                    >
                                                        Αλλαγή
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-end h-full">
                                            <div className="text-sm text-gray-500 italic">
                                                Επιλέξτε προμηθευτή από την αναζήτηση
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </DashboardCard>
                </div>

                {/* Summary Sidebar - Same row as filters */}
                <div>
                    <DashboardCard title="Σύνοψη Αγοράς" height="sm">
                        <div className="space-y-4">
                            <div className="border-b border-gray-200 pb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-gray-600">Συνολικά Υλικά:</span>
                                    <span className="font-medium">{totalItems}</span>
                                </div>

                                <div className="flex justify-between items-center text-lg font-semibold">
                                    <span>Συνολικό Κόστος:</span>
                                    <span className="text-blue-600">{formatMoney(totalCost)}</span>
                                </div>
                            </div>

                            <div className="flex-1 flex items-end">
                                <Button
                                    onClick={handleSubmit}
                                    size="lg"
                                    disabled={!isFormValid() || submitting}
                                    className="w-full"
                                    variant="success"
                                >
                                    {submitting ? (
                                        <>
                                            <LoadingSpinner/>
                                            Καταχώρηση...
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingCart className="w-4 h-4 mr-2" />
                                            Καταχώρηση Αγοράς
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </DashboardCard>
                </div>
            </div>

            {/* Bottom Row: Material Cart - Always visible */}
            <DashboardCard title="Υλικά Αγοράς" height="sm">
                <div className="space-y-3">
                    {cart.length === 0 ? (
                        <div className="text-center text-gray-500 py-6">
                            <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            <p className="text-base font-medium">Δεν έχουν προστεθεί υλικά</p>
                            <p className="text-sm">Αναζητήστε και προσθέστε υλικά στην αγορά σας</p>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div key={item.materialId} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-900 mb-1">{item.materialName}</div>
                                        <div className="text-sm text-gray-600">
                                            Τρέχουσα τιμή: {formatMoney(item.currentUnitCost)}/{item.unitOfMeasure}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => removeMaterialFromCart(item.materialId)}
                                        className="p-1 text-red-500 hover:text-red-700 rounded ml-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-3 gap-3 items-center">
                                    {/* Quantity Controls */}
                                    <div className="justify-self-start">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">
                                            Ποσότητα
                                        </label>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => updateMaterialQuantity(item.materialId, item.quantity - 1)}
                                                className="p-1 text-gray-500 hover:text-gray-700 rounded border border-gray-300"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>

                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => updateMaterialQuantity(item.materialId, parseFloat(e.target.value) || 0)}
                                                className="w-20 px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                min="0.01"
                                                step="0.01"
                                            />

                                            <button
                                                onClick={() => updateMaterialQuantity(item.materialId, item.quantity + 1)}
                                                className="p-1 text-gray-500 hover:text-gray-700 rounded border border-gray-300"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Price Per Unit */}
                                    <div className="justify-self-center">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">
                                            Τιμή/{item.unitOfMeasure}
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                                            <input
                                                type="number"
                                                value={item.pricePerUnit}
                                                onChange={(e) => updateMaterialPrice(item.materialId, parseFloat(e.target.value) || 0)}
                                                className="w-full pl-6 pr-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                min="0.01"
                                                step="0.01"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        {item.pricePerUnit !== item.currentUnitCost && (
                                            <div className={`text-xs mt-1 ${item.pricePerUnit > item.currentUnitCost ? 'text-red-600' : 'text-green-600'}`}>
                                                {item.pricePerUnit > item.currentUnitCost ? '+' : ''}{formatMoney(item.pricePerUnit - item.currentUnitCost)} διαφορά
                                            </div>
                                        )}
                                    </div>

                                    {/* Line Total */}
                                    <div className="justify-self-end">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">
                                            Σύνολο Γραμμής
                                        </label>
                                        <div className="font-bold text-lg text-gray-900 py-1">
                                            {formatMoney(item.lineTotal)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </DashboardCard>

            {/* Error Alert */}
            {error && (
                <Alert variant="error" onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Success Modal */}
            {showSuccessModal && recordedPurchaseDetails && (
                <PurchaseSuccessModal
                    purchase={recordedPurchaseDetails}
                    onClose={resetForm}
                />
            )}
        </div>
    );
};

export default RecordPurchasePage;