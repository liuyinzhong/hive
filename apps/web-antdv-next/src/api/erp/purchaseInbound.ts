import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace ErpPurchaseInboundApi {
  /** 采购入库单列表记录。 */
  export interface PurchaseInboundListItem {
    /** 创建时间。 */
    createDate?: null | string;
    /** 创建人 ID。 */
    creatorId?: null | string;
    /** 入库日期。 */
    inboundDate: string;
    /** 入库单 ID。 */
    inboundId: string;
    /** 入库单号。 */
    inboundNo: string;
    /** 明细行数。 */
    lineCount: number;
    /** 单据备注。 */
    remark?: null | string;
    /** 供应商 ID。 */
    supplierId: string;
    /** 供应商名称。 */
    supplierName: string;
    /** 入库合计金额。 */
    totalAmount: string;
    /** 仓库 ID。 */
    warehouseId: string;
    /** 仓库名称。 */
    warehouseName: string;
  }

  /** 采购入库单明细请求。 */
  export interface PurchaseInboundItemInput {
    /** 批号。 */
    batchNo: string;
    /** 有效期，格式 YYYY-MM-DD。 */
    expiryDate: string;
    /** 明细备注。 */
    remark?: null | string;
    /** 包装单位入库数量。 */
    quantity: number;
    /** SKU ID。 */
    skuId: string;
    /** 包装单位成本价。 */
    unitCost: string;
  }

  /** 新增采购入库单请求。 */
  export interface CreatePurchaseInbound {
    /** 入库日期，格式 YYYY-MM-DD。 */
    inboundDate: string;
    /** 采购入库明细。 */
    items: PurchaseInboundItemInput[];
    /** 单据备注。 */
    remark?: null | string;
    /** 供应商企业主体 ID。 */
    supplierId: string;
    /** 入库仓库 ID。 */
    warehouseId: string;
  }

  /** 采购入库单明细。 */
  export interface PurchaseInboundItem extends PurchaseInboundItemInput {
    /** 明细金额。 */
    amount: string;
    /** 生产企业名称。 */
    enterpriseName: string;
    /** 采购入库明细 ID。 */
    inboundItemId: string;
    /** 明细行号。 */
    lineNo: number;
    /** 最小单位名称。 */
    minUnitName: string;
    /** 包装单位名称。 */
    packageUnitName: string;
    /** 包装规格。 */
    packageSpecName: string;
    /** 产品名称。 */
    productName: string;
    /** 规格名称。 */
    specName: string;
    /** SKU 编码。 */
    skuCode: string;
  }

  /** 采购入库单详情。 */
  export interface PurchaseInbound extends PurchaseInboundListItem {
    /** 采购入库明细。 */
    items: PurchaseInboundItem[];
  }
}

/** 获取采购入库单列表。 */
export function getPurchaseInboundListApi(params: Recordable<unknown>) {
  return requestClient.get<{
    items: ErpPurchaseInboundApi.PurchaseInboundListItem[];
    total: number;
  }>('/erp/purchaseInbounds', { params });
}

/** 获取采购入库单详情。 */
export function getPurchaseInboundDetailApi(inboundId: string) {
  return requestClient.get<ErpPurchaseInboundApi.PurchaseInbound>(
    `/erp/purchaseInbounds/${inboundId}`,
  );
}

/** 新增采购入库单。 */
export function createPurchaseInboundApi(
  data: ErpPurchaseInboundApi.CreatePurchaseInbound,
) {
  return requestClient.post<ErpPurchaseInboundApi.PurchaseInbound>(
    '/erp/purchaseInbounds',
    data,
  );
}
