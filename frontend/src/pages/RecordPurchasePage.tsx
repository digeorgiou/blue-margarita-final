import React, { useState } from 'react';
import { recordPurchaseService } from '../services/recordPurchaseService';
import {
    RecordPurchaseRequestDTO
} from "../types/api/recordPurchaseInterface";
import { PurchaseDetailedViewDTO } from "../types/api/purchaseInterface";
import { SupplierSearchResultDTO } from "../types/api/supplierInterface";
import { MaterialSearchResultDTO } from "../types/api/materialInterface";
import { Button, LoadingSpinner, Alert } from '../components/ui';
import CustomCard from '../components/ui/common/CustomCard.tsx';
import { FlexibleHeightCard } from "../components/ui";
import { ShoppingCart, Package, Calendar, Trash2, Truck, Mail, X } from 'lucide-react';
import { PurchaseSuccessModal } from '../components/ui/modals/PurchaseSuccessModal';
import { materialService } from "../services/materialService.ts";
import { CustomNumberInput, CustomDateInput, CustomSearchDropdown  } from "../components/ui/inputs";
import { IoHammerOutline } from "react-icons/io5";

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
    const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false);
    const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);

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

    // Transform data for SearchDropdown components
    const transformedSupplierResults = supplierSearchResults.map(supplier => ({
        id: supplier.supplierId,
        name: supplier.supplierName,
        subtitle: supplier.email || 'No email',
        additionalInfo: supplier.phoneNumber || 'No phone'
    }));

    const transformedMaterialResults = materialSearchResults.map(material => ({
        id: material.materialId,
        name: material.materialName,
        subtitle: `${material.currentUnitCost}€/${material.unitOfMeasure}`,
        additionalInfo: material.unitOfMeasure
    }));

    // Search functions
    const searchSuppliers = async (searchTerm: string): Promise<void> => {
        if (searchTerm.length < 2) {
            setSupplierSearchResults([]);
            return;
        }

        setIsLoadingSuppliers(true);
        try {
            const results = await recordPurchaseService.searchSuppliers(searchTerm);
            setSupplierSearchResults(results);
        } catch (err) {
            console.error('Supplier search error:', err);
            setSupplierSearchResults([]);
        } finally {
            setIsLoadingSuppliers(false);
        }
    };

    const searchMaterials = async (searchTerm: string): Promise<void> => {
        if (searchTerm.length < 2) {
            setMaterialSearchResults([]);
            return;
        }

        setIsLoadingMaterials(true);
        try {
            const results = await materialService.searchMaterialsForAutocomplete(searchTerm);
            setMaterialSearchResults(results);
        } catch (err) {
            console.error('Material search error:', err);
            setMaterialSearchResults([]);
        } finally {
            setIsLoadingMaterials(false);
        }
    };

    // Cart management functions
    const addMaterialToCart = (material: MaterialSearchResultDTO, quantity: number = 1, pricePerUnit?: number) => {
        const effectivePrice = pricePerUnit || material.currentUnitCost;

        const existingIndex = cart.findIndex(item => item.materialId === material.materialId);
        if (existingIndex >= 0) {
            // Update existing item
            const updatedCart = [...cart];
            updatedCart[existingIndex] = {
                ...updatedCart[existingIndex],
                quantity: updatedCart[existingIndex].quantity + quantity,
                lineTotal: (updatedCart[existingIndex].quantity + quantity) * updatedCart[existingIndex].pricePerUnit
            };
            setCart(updatedCart);
        } else {
            // Add new item
            const newItem: MaterialCartItem = {
                materialId: material.materialId,
                materialName: material.materialName,
                unitOfMeasure: material.unitOfMeasure,
                currentUnitCost: material.currentUnitCost,
                quantity,
                pricePerUnit: effectivePrice,
                lineTotal: quantity * effectivePrice
            };
            setCart([...cart, newItem]);
        }

        // Clear search
        setMaterialSearchTerm('');
        setMaterialSearchResults([]);
    };

    const updateCartItemQuantity = (materialId: number, newQuantity: number) => {
        if (newQuantity <= 0) {
            removeFromCart(materialId);
            return;
        }

        setCart(cart.map(item =>
            item.materialId === materialId
                ? { ...item, quantity: newQuantity, lineTotal: newQuantity * item.pricePerUnit }
                : item
        ));
    };

    const updateCartItemPrice = (materialId: number, newPrice: number) => {
        setCart(cart.map(item =>
            item.materialId === materialId
                ? { ...item, pricePerUnit: newPrice, lineTotal: item.quantity * newPrice }
                : item
        ));
    };

    const removeFromCart = (materialId: number) => {
        setCart(cart.filter(item => item.materialId !== materialId));
    };

    // Calculate totals
    const calculateTotals = () => {
        const totalCost = cart.reduce((sum, item) => sum + item.lineTotal, 0);
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        return { totalCost, totalItems };
    };

    // Validation
    const isFormValid = () => {
        return selectedSupplier && cart.length > 0 && purchaseDate;
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
        <div className="min-h-screen p-4">
            <div className="max-w-7xl mx-auto">
                {error && (
                    <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <CustomCard height="md">
                                <div className="space-y-4 pl-2 pr-2 pb-2">

                                    {/* Row 1: Material Search, Purchase Date */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

                                        {/* Material Search */}
                                        <div>
                                            <CustomSearchDropdown
                                                label="Υλικό"
                                                searchTerm={materialSearchTerm}
                                                onSearchTermChange={(term: string) => {
                                                    setMaterialSearchTerm(term);
                                                    searchMaterials(term);
                                                }}
                                                searchResults={transformedMaterialResults}
                                                onSelect={(item: { id: number; name: string; subtitle?: string; additionalInfo?: string }) => {
                                                    const material = materialSearchResults.find(m => m.materialId === item.id);
                                                    if (material) {
                                                        addMaterialToCart(material, 1);
                                                    }
                                                }}
                                                placeholder="Αναζήτηση υλικού..."
                                                entityType="material"
                                                isLoading={isLoadingMaterials}
                                                emptyMessage="Δεν βρέθηκαν υλικά"
                                                emptySubMessage="Δοκιμάστε διαφορετικό όρο αναζήτησης"
                                                icon={<IoHammerOutline className="w-4 h-4 text-emerald-500" />}
                                            />
                                        </div>

                                        {/* Supplier Search */}
                                        <div>
                                            <CustomSearchDropdown
                                                label="Προμηθευτής"
                                                searchTerm={supplierSearchTerm}
                                                onSearchTermChange={(term: string) => {
                                                    setSupplierSearchTerm(term);
                                                    searchSuppliers(term);
                                                }}
                                                searchResults={transformedSupplierResults}
                                                onSelect={(item: { id: number; name: string; subtitle?: string; additionalInfo?: string }) => {
                                                    const supplier = supplierSearchResults.find(s => s.supplierId === item.id);
                                                    if (supplier) {
                                                        setSelectedSupplier(supplier);
                                                        setSupplierSearchTerm('');
                                                        setSupplierSearchResults([]);
                                                    }
                                                }}
                                                placeholder="Αναζήτηση προμηθευτή..."
                                                entityType="supplier"
                                                isLoading={isLoadingSuppliers}
                                                emptyMessage="Δεν βρέθηκαν προμηθευτές"
                                                emptySubMessage="Δοκιμάστε διαφορετικό όρο αναζήτησης"
                                                icon={<Truck className="w-4 h-4 text-blue-500" />}
                                            />
                                        </div>


                                    </div>

                                    {/* Row 2: Supplier Search, Selected Supplier Display */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">


                                        {/* Purchase Date */}
                                        <div>
                                            <CustomDateInput
                                                label={
                                                    <span className="flex items-center">
                                                        <Calendar className="w-4 h-4 mr-1" />
                                                        Ημερομηνία Αγοράς
                                                    </span>
                                                }
                                                value={purchaseDate}
                                                onChange={setPurchaseDate}
                                                icon={<Calendar className="w-5 h-5 text-purple-500" />}
                                            />
                                        </div>

                                        {/* Selected Supplier Display */}
                                        <div className="h-[72px] flex items-start mt-7">
                                            {selectedSupplier ? (
                                                <div className="w-full p-3 pr-5 bg-blue-50 rounded-lg border border-blue-200">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-2">
                                                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                                <Truck className="w-3 h-3 text-blue-600" />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="font-medium text-blue-900 text-xs truncate">{selectedSupplier.supplierName}</p>
                                                                <p className="text-xs text-blue-700 flex items-center truncate">
                                                                    <Mail className="w-2 h-2 mr-1 flex-shrink-0" />
                                                                    <span className="truncate">{selectedSupplier.email || 'No email'}</span>
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => setSelectedSupplier(null)}
                                                            className="text-blue-600 hover:text-blue-800 transition-colors p-1 hover:bg-blue-100 rounded flex-shrink-0 ml-2"
                                                            title="Clear selection"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="w-full h-full"></div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CustomCard>
                        </div>

                        {/* Cart Items Card */}
                        <div className="lg:col-span-1">
                            <CustomCard
                                title={`Καλάθι Υλικών (${cart.length})`}
                                icon={<ShoppingCart className="w-5 h-5" />}
                                height="md"
                            >
                                <div className="h-full overflow-y-auto pr-2 pb-2">
                                    {cart.length === 0 ? (
                                        <div className="text-center text-gray-500 py-6">
                                            <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                            <p className="text-sm">Άδειο καλάθι</p>
                                            <p className="text-xs">Προσθέστε υλικά στο καλάθι</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {cart.map((item) => (
                                                <div key={item.materialId} className="bg-gray-50 rounded-lg p-3 border">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-medium text-gray-900 truncate">{item.materialName}</h4>
                                                        </div>
                                                        <button
                                                            onClick={() => removeFromCart(item.materialId)}
                                                            className="text-red-500 hover:text-red-700 p-1"
                                                            title="Remove item"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                                        <div>
                                                            <CustomNumberInput
                                                                label = {`Ποσότητα (${item.unitOfMeasure})`}
                                                                value={item.quantity}
                                                                onChange={(value) => updateCartItemQuantity(item.materialId, value)}
                                                                min={0}
                                                                step={0.01}
                                                                className="text-sm"
                                                            />
                                                        </div>

                                                        <div>
                                                            <CustomNumberInput
                                                                label = "Τιμή (€)"
                                                                value={item.pricePerUnit}
                                                                onChange={(value) => updateCartItemPrice(item.materialId, value)}
                                                                min={0}
                                                                step={0.01}
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="text-right">
                                                        <span className="text-sm font-semibold text-gray-900">
                                                            Σύνολο: €{item.lineTotal.toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </CustomCard>
                        </div>
                    </div>

                    {/* Purchase Summary Card */}
                    <FlexibleHeightCard
                        title="Σύνοψη Αγοράς"
                        icon={<Package className="w-5 h-5" />}
                    >
                        <div className="space-y-6 p-6">
                            {cart.length > 0 ? (
                                <>
                                    {/* Totals Display */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="text-center">
                                                <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
                                                <p className="text-sm text-gray-600">Συνολικά Αντικείμενα</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-2xl font-bold text-green-600">€{totalCost.toFixed(2)}</p>
                                                <p className="text-sm text-gray-600">Συνολικό Κόστος</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Purchase Details */}
                                    <div className="space-y-3">
                                        <h4 className="font-semibold text-gray-800">Λεπτομέρειες Αγοράς:</h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 mr-3">Προμηθευτής:</span>
                                                <span className="font-medium">{selectedSupplier?.supplierName || 'Δεν επιλέχθηκε'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Ημερομηνία:</span>
                                                <span className="font-medium">{purchaseDate}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Record Purchase Button */}
                                    <div className="pt-4 border-t border-gray-200">
                                        <Button
                                            onClick={handleSubmit}
                                            disabled={submitting || !isFormValid()}
                                            variant="success"
                                            size="lg"
                                            className="w-full h-20 text-lg font-bold"
                                        >
                                            {submitting ? (
                                                <>
                                                    <LoadingSpinner />
                                                    <span>Recording Purchase...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Package className="w-6 h-6 mr-2" />
                                                    Καταγραφή Αγοράς
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center justify-center py-12">
                                    <div className="text-center text-gray-500">
                                        <Package className="w-24 h-24 mx-auto mb-4 opacity-30" />
                                        <p className="text-xl font-semibold mb-2">Δεν έχουν προστεθεί υλικά</p>
                                        <p className="text-lg">Προσθέστε υλικά για να συνεχίσετε</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </FlexibleHeightCard>
                </div>
            </div>

            {showSuccessModal && recordedPurchaseDetails && (
                <PurchaseSuccessModal
                    purchase={recordedPurchaseDetails}
                    onClose={() => {
                        setShowSuccessModal(false);
                        resetForm();
                    }}
                />
            )}
        </div>
    );
};

export default RecordPurchasePage;