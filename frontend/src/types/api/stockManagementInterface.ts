export interface StockUpdateDTO{
    productId : number;
    updateType : 'ADD' | 'REMOVE' | 'SET';
    quantity: number;
    updaterUserId : number;
}

export interface StockUpdateResultDTO {
    productId : number;
    productCode : number;
    previousStockId : number;
    newStock : number;
    changeAmount : number;
    success : boolean;
    operationType : string;
    updatedAt : number;
}