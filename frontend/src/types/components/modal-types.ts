import {type CategoryDetailedViewDTO, CategoryInsertDTO, CategoryReadOnlyDTO} from "../api/categoryInterface.ts";
import {
    CustomerDetailedViewDTO,
    CustomerInsertDTO,
    CustomerListItemDTO,
    CustomerUpdateDTO
} from "../api/customerInterface.ts";
import type {ExpenseInsertDTO, ExpenseReadOnlyDTO, ExpenseTypeDTO, ExpenseUpdateDTO} from "../api/expenseInterface.ts";
import {
    type LocationDetailedViewDTO, type LocationForDropdownDTO,
    LocationInsertDTO,
    LocationReadOnlyDTO,
    LocationUpdateDTO
} from "../api/locationInterface.ts";
import {
    MaterialDetailedViewDTO,
    MaterialInsertDTO,
    MaterialReadOnlyDTO,
    MaterialUpdateDTO
} from "../api/materialInterface.ts";
import {
    ProcedureDetailedViewDTO,
    ProcedureInsertDTO,
    ProcedureReadOnlyDTO,
    ProcedureUpdateDTO
} from "../api/procedureInterface.ts";
import {ProductDetailedViewDTO} from "../api/productInterface.ts";
import type {PurchaseDetailedViewDTO, PurchaseReadOnlyDTO, PurchaseUpdateDTO} from "../api/purchaseInterface.ts";
import type {SaleReadOnlyDTO, SaleUpdateDTO} from "../api/saleInterface.ts";
import type {PaymentMethodDTO, SaleDetailedViewDTO} from "../api/recordSaleInterface.ts";
import {
    SupplierDetailedViewDTO,
    SupplierInsertDTO,
    SupplierReadOnlyDTO,
    SupplierUpdateDTO
} from "../api/supplierInterface.ts";

export type CategoryCreateModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CategoryInsertDTO) => Promise<void>;
}

export type CategoryDetailModalProps = {
    isOpen: boolean;
    onClose: () => void;
    category: CategoryDetailedViewDTO;
}

export type CategoryUpdateModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { name: string }) => Promise<void>; // Match what CategoryManagementPage expects
    category: CategoryReadOnlyDTO | null;
}

export type CustomerCreateModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CustomerInsertDTO) => Promise<void>;
}

export type CustomerDetailModalProps = {
    isOpen: boolean;
    onClose: () => void;
    customer: CustomerDetailedViewDTO | null;
    loading: boolean;
}

export type CustomerUpdateModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CustomerUpdateDTO) => Promise<void>;
    customer: CustomerListItemDTO | null;
}

export type ExpenseCreateModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (expenseData: ExpenseInsertDTO) => Promise<void>;
    expenseTypes: ExpenseTypeDTO[];
}

export type ExpenseDetailModalProps = {
    isOpen: boolean;
    onClose: () => void;
    expense: ExpenseReadOnlyDTO | null;
    loading: boolean;
    expenseTypes: ExpenseTypeDTO[];
}

export type ExpenseUpdateModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (expenseData: ExpenseUpdateDTO) => Promise<void>;
    expense: ExpenseReadOnlyDTO | null;
    expenseTypes: ExpenseTypeDTO[];
}

export type LocationCreateModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: LocationInsertDTO) => Promise<void>;
}

export type LocationDetailModalProps = {
    isOpen: boolean;
    onClose: () => void;
    location: LocationDetailedViewDTO;
}

export type LocationUpdateModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: LocationUpdateDTO) => Promise<void>;
    location: LocationReadOnlyDTO | null;
}

export type MaterialCreateModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: MaterialInsertDTO) => Promise<void>;
}

export type MaterialDetailModalProps = {
    isOpen: boolean;
    onClose: () => void;
    material: MaterialDetailedViewDTO | null;
    loading: boolean;
}

export type ProductUsageModalProps = {
    isOpen: boolean;
    onClose: () => void;
    material: MaterialReadOnlyDTO | null;
}

export type MaterialUpdateModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: MaterialUpdateDTO) => Promise<void>;
    material: MaterialReadOnlyDTO | null;
}

export type ProcedureCreateModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ProcedureInsertDTO) => Promise<void>;
}

export type ProcedureDetailModalProps = {
    isOpen: boolean;
    onClose: () => void;
    procedure: ProcedureDetailedViewDTO | null;
    loading: boolean;
}

export type ProcedureProductUsageModalProps = {
    isOpen: boolean;
    onClose: () => void;
    procedure: ProcedureReadOnlyDTO | null;
}

export type ProcedureUpdateModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ProcedureUpdateDTO) => Promise<void>;
    procedure: ProcedureReadOnlyDTO | null;
}

export type ProductDetailModalProps = {
    isOpen: boolean;
    onClose: () => void;
    product: ProductDetailedViewDTO | null;
    loading: boolean;
}

export type PurchaseDetailModalProps = {
    isOpen: boolean;
    onClose: () => void;
    purchaseDetails: PurchaseDetailedViewDTO | null;
    loading: boolean;
}

export type PurchaseUpdateModalProps = {
    isOpen: boolean;
    onClose: () => void;
    purchase: PurchaseReadOnlyDTO;
    onUpdate: (updateData: PurchaseUpdateDTO) => Promise<void>;
}

export type SaleDetailModalProps = {
    isOpen: boolean;
    onClose: () => void;
    saleDetails: SaleDetailedViewDTO | null;
    loading: boolean;
}

export type SaleUpdateModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (saleData: SaleUpdateDTO) => Promise<void>;
    sale: SaleReadOnlyDTO;
    locations: LocationForDropdownDTO[];
    paymentMethods: PaymentMethodDTO[];
}

export type SupplierCreateModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: SupplierInsertDTO) => Promise<void>;
}

export type SupplierDetailModalProps = {
    isOpen: boolean;
    onClose: () => void;
    supplier: SupplierDetailedViewDTO | null;
    loading: boolean;
}

export type SupplierUpdateModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: SupplierUpdateDTO) => Promise<void>;
    supplier: SupplierReadOnlyDTO | null;
}