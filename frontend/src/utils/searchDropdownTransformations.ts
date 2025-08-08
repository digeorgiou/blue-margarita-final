import type { SearchResult } from '../types/components/input-types';
import type {
    SupplierSearchResultDTO,
} from '../types/api/supplierInterface';
import type {
    MaterialSearchResultDTO,
} from '../types/api/materialInterface';
import type {
    CustomerSearchResultDTO,
} from '../types/api/customerInterface';
import type {
    ProductSearchResultDTO,
} from '../types/api/productInterface';


export const transformSuppliersForDropdown = (suppliers: SupplierSearchResultDTO[]): SearchResult[] => {
    return suppliers.map(supplier => ({
        id: supplier.supplierId,
        name: supplier.supplierName,
        subtitle: `${supplier.supplierTin? `ΑΦΜ: ${supplier.supplierTin}` : ''}`,
        additionalInfo: `${supplier.email? `email: ${supplier.email}` : ''}`
    }));
};

export const transformSelectedSupplierForDropdown = (selectedSupplier: SupplierSearchResultDTO | null): SearchResult | null => {
    return selectedSupplier ? {
        id: selectedSupplier.supplierId,
        name: selectedSupplier.supplierName,
        subtitle: `${selectedSupplier.supplierTin? `ΑΦΜ: ${selectedSupplier.supplierTin}` : ''}`,
        additionalInfo: `${selectedSupplier.email? `email: ${selectedSupplier.email}` : ''}`
    } : null;
};

export const transformMaterialsForDropdown = (materials: MaterialSearchResultDTO[]): SearchResult[] => {
    return materials.map(material => ({
        id: material.materialId,
        name: material.materialName,
        subtitle: `Μονάδα μέτρησης: ${material.unitOfMeasure}`,
        additionalInfo: `Κόστος: ${material.currentUnitCost}`
    }));
};

export const transformSelectedMaterialForDropdown = (selectedMaterial: MaterialSearchResultDTO | null): SearchResult | null => {
    return selectedMaterial ? {
        id: selectedMaterial.materialId,
        name: selectedMaterial.materialName,
        subtitle: `Μονάδα μέτρησης: ${selectedMaterial.unitOfMeasure}`,
        additionalInfo: `Κόστος: ${selectedMaterial.currentUnitCost}`
    } : null;
};

export const transformProductsForDropdown = (products: ProductSearchResultDTO[]): SearchResult[] => {
    return products.map(product => ({
        id: product.id,
        name: product.name,
        subtitle: `Κωδικός: ${product.code}`,
        additionalInfo: product.categoryName
    }));
};

export const transformSelectedProductForDropdown = (selectedProduct: ProductSearchResultDTO | null): SearchResult | null => {
    return selectedProduct ? {
        id: selectedProduct.id,
        name: selectedProduct.name,
        subtitle: `Κωδικός: ${selectedProduct.code}`,
        additionalInfo: selectedProduct.categoryName
    } : null;
};

export const transformCustomersForDropdown = (customers: CustomerSearchResultDTO[]): SearchResult[] => {
    return customers.map(customer => ({
        id: customer.id,
        name: customer.fullName,
        subtitle: customer.email || 'Χωρίς email',
        additionalInfo: 'Πελάτης'
    }));
};

export const transformSelectedCustomerForDropdown = (selectedCustomer: CustomerSearchResultDTO | null): SearchResult | null => {
    return selectedCustomer ? {
        id: selectedCustomer.id,
        name: selectedCustomer.fullName,
        subtitle: selectedCustomer.email || 'Χωρίς email',
        additionalInfo: 'Πελάτης'
    } : null;
};