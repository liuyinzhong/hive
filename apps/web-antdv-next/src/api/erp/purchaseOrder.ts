import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace ErpPurchaseOrderApi {
  export type PurchaseOrderStatus =
    | 'CANCELLED'
    | 'CLOSED'
    | 'COMPLETED'
    | 'DRAFT'
    | 'PARTIAL_RECEIPT'
    | 'WAITING_RECEIPT';

  export type PurchaseOrderLogAction =
    | 'CANCEL'
    | 'CLOSE'
    | 'CONFIRM'
    | 'CREATE'
    | 'INBOUND'
    | 'UPDATE';

  export interface PurchaseOrderListItem {
    createDate?: null | string;
    creatorId?: null | string;
    expectedArrivalDate?: null | string;
    lineCount: number;
    orderDate: string;
    purchaseOrderId: string;
    purchaseOrderNo: string;
    remark?: null | string;
    rowVersion: number;
    status: PurchaseOrderStatus;
    supplierId: string;
    supplierName: string;
    totalAmount: string;
    updateDate?: null | string;
    warehouseId: string;
    warehouseName: string;
  }

  export interface PurchaseOrderItemInput {
    orderedQuantity: number;
    remark?: null | string;
    skuId: string;
    unitPrice: string;
  }

  export interface SavePurchaseOrder {
    expectedArrivalDate?: null | string;
    expectedRowVersion?: number;
    items: PurchaseOrderItemInput[];
    orderDate: string;
    remark?: null | string;
    supplierId: string;
    warehouseId: string;
  }

  export interface PurchaseOrderItem extends PurchaseOrderItemInput {
    amount: string;
    inboundQuantity: number;
    lineNo: number;
    packageSpecName: string;
    packageUnitName: string;
    productName: string;
    purchaseOrderItemId: string;
    remainingQuantity: number;
    skuCode: string;
    specName: string;
    traceMode: 'NONE' | 'REQUIRED';
  }

  export interface PurchaseOrder extends PurchaseOrderListItem {
    confirmedAt?: null | string;
    confirmedBy?: null | string;
    items: PurchaseOrderItem[];
  }

  export interface PurchaseOrderLog {
    actionType: PurchaseOrderLogAction;
    fromStatus?: null | PurchaseOrderStatus;
    operatedAt: string;
    operatorId?: null | string;
    operatorName?: null | string;
    purchaseOrderLogId: string;
    reason?: null | string;
    relatedInboundId?: null | string;
    relatedInboundNo?: null | string;
    summary: string;
    toStatus?: null | PurchaseOrderStatus;
  }
}

export function getPurchaseOrderListApi(params: Recordable<unknown>) {
  return requestClient.get<{
    items: ErpPurchaseOrderApi.PurchaseOrderListItem[];
    total: number;
  }>('/erp/purchaseOrders', { params });
}

export function getPurchaseOrderDetailApi(purchaseOrderId: string) {
  return requestClient.get<ErpPurchaseOrderApi.PurchaseOrder>(
    `/erp/purchaseOrders/${purchaseOrderId}`,
  );
}

export function createPurchaseOrderApi(
  data: ErpPurchaseOrderApi.SavePurchaseOrder,
) {
  return requestClient.post<ErpPurchaseOrderApi.PurchaseOrder>(
    '/erp/purchaseOrders',
    data,
  );
}

export function updatePurchaseOrderApi(
  purchaseOrderId: string,
  data: ErpPurchaseOrderApi.SavePurchaseOrder,
) {
  return requestClient.put<ErpPurchaseOrderApi.PurchaseOrder>(
    `/erp/purchaseOrders/${purchaseOrderId}`,
    data,
  );
}

export function confirmPurchaseOrderApi(purchaseOrderId: string) {
  return requestClient.post<ErpPurchaseOrderApi.PurchaseOrder>(
    `/erp/purchaseOrders/${purchaseOrderId}/confirm`,
  );
}

export function cancelPurchaseOrderApi(
  purchaseOrderId: string,
  reason: string,
) {
  return requestClient.post<ErpPurchaseOrderApi.PurchaseOrder>(
    `/erp/purchaseOrders/${purchaseOrderId}/cancel`,
    { reason },
  );
}

export function closePurchaseOrderApi(
  purchaseOrderId: string,
  reason: string,
) {
  return requestClient.post<ErpPurchaseOrderApi.PurchaseOrder>(
    `/erp/purchaseOrders/${purchaseOrderId}/close`,
    { reason },
  );
}

export function getPurchaseOrderLogsApi(purchaseOrderId: string) {
  return requestClient.get<ErpPurchaseOrderApi.PurchaseOrderLog[]>(
    `/erp/purchaseOrders/${purchaseOrderId}/logs`,
  );
}
