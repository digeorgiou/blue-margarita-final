import type { CustomerListItemDTO } from '../api/customerInterface.ts';
import type {ExpenseReadOnlyDTO} from "../api/expenseInterface.ts";
import type {MaterialReadOnlyDTO} from "../api/materialInterface.ts";
import type {ProcedureReadOnlyDTO} from "../api/procedureInterface.ts";
import type {ProductListItemDTO} from "../api/productInterface.ts";
import type {PurchaseReadOnlyDTO} from "../api/purchaseInterface.ts";
import type {SaleReadOnlyDTO} from "../api/saleInterface.ts";
import { StockManagementDTO, StockStatus } from "../api/stockManagementInterface.ts";
import type {SupplierReadOnlyDTO} from "../api/supplierInterface.ts";
import type {MispricedProductAlertDTO, ToDoTaskReadOnlyDTO} from "../api/dashboardInterface.ts";

export type CustomerCardProps = {
    customer: CustomerListItemDTO;
    onViewDetails: (customer: CustomerListItemDTO) => void;
    onEdit: (customer: CustomerListItemDTO) => void;
    onDelete: (customer: CustomerListItemDTO) => void;
}

export type ExpenseCardProps = {
    expense: ExpenseReadOnlyDTO;
    onViewDetails: (expense: ExpenseReadOnlyDTO) => void;
    onEdit: (expense: ExpenseReadOnlyDTO) => void;
    onDelete: (expense: ExpenseReadOnlyDTO) => void;
}

export type MaterialCardProps = {
    material: MaterialReadOnlyDTO;
    onViewDetails: (material: MaterialReadOnlyDTO) => void;
    onEdit: (material: MaterialReadOnlyDTO) => void;
    onDelete: (material: MaterialReadOnlyDTO) => void;
    onViewProducts: (material: MaterialReadOnlyDTO) => void;
}

export type MispricedProductCardProps = {
    product: MispricedProductAlertDTO;
    onUpdateRetailPrice: (product: MispricedProductAlertDTO, newPrice: number) => Promise<void>;
    onUpdateWholesalePrice: (product: MispricedProductAlertDTO, newPrice: number) => Promise<void>;
    updatingRetailPrice: boolean;
    updatingWholesalePrice: boolean;
    formatMoney: (amount: number) => string;
    getPricingIssueTypeLabel: (issueType: string) => string;
}

export type ProcedureCardProps = {
    procedure: ProcedureReadOnlyDTO;
    onViewDetails: (procedure: ProcedureReadOnlyDTO) => void;
    onEdit: (procedure: ProcedureReadOnlyDTO) => void;
    onDelete: (procedure: ProcedureReadOnlyDTO) => void;
    onViewProducts: (procedure: ProcedureReadOnlyDTO) => void;
}

export type ProductCardProps = {
    product: ProductListItemDTO;
    onViewDetails: (product: ProductListItemDTO) => void;
    onEdit: (product: ProductListItemDTO) => void;
    onDelete: (product: ProductListItemDTO) => void;
    onAnalytics: (product: ProductListItemDTO) => void;
}

export type PurchaseCardProps = {
    purchase: PurchaseReadOnlyDTO;
    onViewDetails: (purchase: PurchaseReadOnlyDTO) => void;
    onEdit: (purchase: PurchaseReadOnlyDTO) => void;
    onDelete: (purchase: PurchaseReadOnlyDTO) => void;
}

export type SaleCardProps = {
    sale: SaleReadOnlyDTO;
    onViewDetails: (sale: SaleReadOnlyDTO) => void;
    onEdit: (sale: SaleReadOnlyDTO) => void;
    onDelete: (sale: SaleReadOnlyDTO) => void;
    getPaymentMethodDisplayName: (paymentMethod: string) => string;
}

export type StockProductCardProps = {
    product: StockManagementDTO;
    onUpdateStock: (product: StockManagementDTO, newStock: number) => Promise<void>;
    updating: boolean;
    onUpdateStockLimit: (product: StockManagementDTO, newStock: number) => Promise<void>;
    updatingLimit: boolean;
    getStatusColor: (status: StockStatus) => string;
}

export type SupplierCardProps = {
    supplier: SupplierReadOnlyDTO;
    onViewDetails: (supplier: SupplierReadOnlyDTO) => void;
    onEdit: (supplier: SupplierReadOnlyDTO) => void;
    onDelete: (supplier: SupplierReadOnlyDTO) => void;
}

export type TaskCardProps = {
    task: ToDoTaskReadOnlyDTO;
    onViewDetails?: (task: ToDoTaskReadOnlyDTO) => void;
    onEdit: (task: ToDoTaskReadOnlyDTO) => void;
    onDelete: (task: ToDoTaskReadOnlyDTO) => void;
    onComplete: (taskId: number) => void;
    onRestore: (taskId: number) => void;
}