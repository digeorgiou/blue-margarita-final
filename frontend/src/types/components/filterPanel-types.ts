import type {CustomerListItemDTO, CustomerSearchResultDTO} from "../api/customerInterface.ts";
import type {ExpenseReadOnlyDTO, ExpenseTypeDTO} from "../api/expenseInterface.ts";
import React from "react";
import type {MaterialReadOnlyDTO, MaterialSearchResultDTO} from "../api/materialInterface.ts";
import type {ProcedureForDropdownDTO, ProcedureReadOnlyDTO} from "../api/procedureInterface.ts";
import type {CategoryForDropdownDTO} from "../api/categoryInterface.ts";
import type {ProductListItemDTO, ProductSearchResultDTO} from "../api/productInterface.ts";
import type {LocationForDropdownDTO} from "../api/locationInterface.ts";
import type {PaymentMethodDTO} from "../api/recordSaleInterface.ts";
import type {SaleReadOnlyDTO} from "../api/saleInterface.ts";
import type {SupplierReadOnlyDTO} from "../api/supplierInterface.ts";
import { PurchaseReadOnlyDTO } from "../api/purchaseInterface";
import { SupplierSearchResultDTO } from "../api/supplierInterface";

export type CustomerFilterPanelProps = {
    searchTerm: string;
    onSearchTermChange: (term: string) => void;
    tinOnlyFilter: boolean; // Changed from wholesaleOnly to tinOnlyFilter
    onTinOnlyFilterChange: (tinOnly: boolean) => void; // Changed accordingly
    searchResults: CustomerListItemDTO[];
    loading: boolean;
    onViewDetails: (customer: CustomerListItemDTO) => void;
    onEdit: (customer: CustomerListItemDTO) => void;
    onDelete: (customer: CustomerListItemDTO) => void;
}

export type ExpenseFilterPanelProps = {
    searchTerm: string;
    onSearchTermChange: (value: string) => void;
    expenseTypeFilter: string;
    onExpenseTypeFilterChange: (value: string) => void;
    dateFromFilter: string;
    onDateFromFilterChange: (value: string) => void;
    dateToFilter: string;
    onDateToFilterChange: (value: string) => void;
    expenseTypes: ExpenseTypeDTO[];
    searchResults: ExpenseReadOnlyDTO[];
    loading: boolean;
    onViewDetails: (expense: ExpenseReadOnlyDTO) => void;
    onEdit: (expense: ExpenseReadOnlyDTO) => void;
    onDelete: (expense: ExpenseReadOnlyDTO) => void;
    children?: React.ReactNode;
}

export type MaterialFilterPanelProps = {
    searchTerm: string;
    onSearchTermChange: (term: string) => void;
    searchResults: MaterialReadOnlyDTO[];
    loading: boolean;
    onViewDetails: (material: MaterialReadOnlyDTO) => void;
    onEdit: (material: MaterialReadOnlyDTO) => void;
    onDelete: (material: MaterialReadOnlyDTO) => void;
    onViewProducts: (material: MaterialReadOnlyDTO) => void;
}

export type ProcedureFilterPanelProps = {
    searchTerm: string;
    onSearchTermChange: (term: string) => void;
    searchResults: ProcedureReadOnlyDTO[];
    loading: boolean;
    onViewDetails: (procedure: ProcedureReadOnlyDTO) => void;
    onEdit: (procedure: ProcedureReadOnlyDTO) => void;
    onDelete: (procedure: ProcedureReadOnlyDTO) => void;
    onViewProducts: (procedure: ProcedureReadOnlyDTO) => void;
}


export type ProductFilterPanelProps = {
    // Basic search
    searchTerm: string;
    onSearchTermChange: (value: string) => void;

    // Category filter
    selectedCategoryId: number | undefined;
    onCategoryIdChange: (value: number | undefined) => void;
    categories: CategoryForDropdownDTO[];

    // Material filter
    materialSearchTerm: string;
    onMaterialSearchTermChange: (value: string) => void;
    materialSearchResults: MaterialSearchResultDTO[];
    selectedMaterial: MaterialSearchResultDTO | null;
    onMaterialSelect: (material: MaterialSearchResultDTO | null) => void;
    loadingMaterials: boolean;

    // Procedure filter
    procedureSearchTerm: string;
    onProcedureSearchTermChange: (value: string) => void;
    procedureSearchResults: ProcedureForDropdownDTO[];
    selectedProcedure: ProcedureForDropdownDTO | null;
    onProcedureSelect: (procedure: ProcedureForDropdownDTO | null) => void;
    loadingProcedures: boolean;

    // Stock filters
    lowStockOnly: boolean;
    onLowStockOnlyChange: (value: boolean) => void;
    minStock: number;
    onMinStockChange: (value: number) => void;
    maxStock: number;
    onMaxStockChange: (value: number) => void;

    // Price filters
    minPrice: number;
    onMinPriceChange: (value: number) => void;
    maxPrice: number;
    onMaxPriceChange: (value: number) => void;

    // Results and actions
    searchResults: ProductListItemDTO[];
    loading: boolean;
    onViewDetails: (product: ProductListItemDTO) => void;
    onEdit: (product: ProductListItemDTO) => void;
    onDelete: (product: ProductListItemDTO) => void;
    onAnalytics: (product: ProductListItemDTO) => void;
    children?: React.ReactNode;
}

export type SaleFilterPanelProps = {
    // Customer filter
    customerSearchTerm: string;
    onCustomerSearchTermChange: (value: string) => void;
    customerSearchResults: CustomerSearchResultDTO[];
    selectedCustomer: CustomerSearchResultDTO | null;
    onCustomerSelect: (customer: CustomerSearchResultDTO | null) => void;
    loadingCustomers: boolean;

    // Product filter
    productSearchTerm: string;
    onProductSearchTermChange: (value: string) => void;
    productSearchResults: ProductSearchResultDTO[];
    selectedProduct: ProductSearchResultDTO | null;
    onProductSelect: (product: ProductSearchResultDTO | null) => void;
    loadingProducts: boolean;

    // Location filter
    selectedLocationId: number | undefined;
    onLocationIdChange: (value: number | undefined) => void;
    locations: LocationForDropdownDTO[];

    // Category filter
    selectedCategoryId: number | undefined;
    onCategoryIdChange: (value: number | undefined) => void;
    categories: CategoryForDropdownDTO[];

    // Payment method filter
    paymentMethodFilter: string;
    onPaymentMethodFilterChange: (value: string) => void;
    paymentMethods: PaymentMethodDTO[];

    // Wholesale filter
    isWholesaleFilter: boolean | undefined;
    onIsWholesaleFilterChange: (value: boolean | undefined) => void;

    // Date filters
    dateFromFilter: string;
    onDateFromFilterChange: (value: string) => void;
    dateToFilter: string;
    onDateToFilterChange: (value: string) => void;

    // Results and actions
    searchResults: SaleReadOnlyDTO[];
    loading: boolean;
    onViewDetails: (sale: SaleReadOnlyDTO) => void;
    onEdit: (sale: SaleReadOnlyDTO) => void;
    onDelete: (sale: SaleReadOnlyDTO) => void;
    children?: React.ReactNode;
}

export type SupplierFilterPanelProps = {
    searchTerm: string;
    onSearchTermChange: (term: string) => void;
    searchResults: SupplierReadOnlyDTO[];
    loading: boolean;
    onViewDetails: (supplier: SupplierReadOnlyDTO) => void;
    onEdit: (supplier: SupplierReadOnlyDTO) => void;
    onDelete: (supplier: SupplierReadOnlyDTO) => void;
}

export type PurchaseFilterPanelProps = {
    // Supplier filter
    supplierSearchTerm: string;
    onSupplierSearchTermChange: (value: string) => void;
    supplierSearchResults: SupplierSearchResultDTO[];
    selectedSupplier: SupplierSearchResultDTO | null;
    onSupplierSelect: (supplier: SupplierSearchResultDTO | null) => void;
    loadingSuppliers: boolean;

    // Material filter
    materialSearchTerm: string;
    onMaterialSearchTermChange: (value: string) => void;
    materialSearchResults: MaterialSearchResultDTO[];
    selectedMaterial: MaterialSearchResultDTO | null;
    onMaterialSelect: (material: MaterialSearchResultDTO | null) => void;
    loadingMaterials: boolean;

    // Date filters
    dateFromFilter: string;
    onDateFromFilterChange: (value: string) => void;
    dateToFilter: string;
    onDateToFilterChange: (value: string) => void;

    // Results and actions
    searchResults: PurchaseReadOnlyDTO[];
    loading: boolean;
    onViewDetails: (purchase: PurchaseReadOnlyDTO) => void;
    onEdit: (purchase: PurchaseReadOnlyDTO) => void;
    onDelete: (purchase: PurchaseReadOnlyDTO) => void;
    children?: React.ReactNode;
}