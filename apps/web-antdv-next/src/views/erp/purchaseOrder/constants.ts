import type { ErpPurchaseOrderApi } from '#/api/erp';

import { $t } from '#/locales';

export const purchaseOrderStatusValues: ErpPurchaseOrderApi.PurchaseOrderStatus[] =
  [
    'DRAFT',
    'WAITING_RECEIPT',
    'PARTIAL_RECEIPT',
    'COMPLETED',
    'CANCELLED',
    'CLOSED',
  ];

export function purchaseOrderStatusLabel(
  status: ErpPurchaseOrderApi.PurchaseOrderStatus,
) {
  return $t(`erp.purchaseOrder.status${status}`);
}

export function purchaseOrderStatusColor(
  status: ErpPurchaseOrderApi.PurchaseOrderStatus,
) {
  const colors: Record<ErpPurchaseOrderApi.PurchaseOrderStatus, string> = {
    CANCELLED: 'default',
    CLOSED: 'volcano',
    COMPLETED: 'green',
    DRAFT: 'default',
    PARTIAL_RECEIPT: 'cyan',
    WAITING_RECEIPT: 'blue',
  };
  return colors[status];
}

export function purchaseOrderLogActionLabel(
  action: ErpPurchaseOrderApi.PurchaseOrderLogAction,
) {
  return $t(`erp.purchaseOrder.logAction${action}`);
}
