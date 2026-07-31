import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace ErpInventoryApi {
  /** 库存来源单据类型。 */
  export type InventorySourceBillType = 'INITIAL_STOCK';

  /** 库存业务类型。 */
  export type InventoryMovementType = 'INITIAL_IN';

  /** 库存流水方向。 */
  export type InventoryDirection = 'IN';

  /** 库存余额，第一版按仓库 + 库存批次维度展示。 */
  export interface InventoryBalance {
    /** 批次 ID。 */
    batchId: string;
    /** 批号。 */
    batchNo: string;
    /** 品牌/商品名。 */
    brandName?: null | string;
    /** 库存余额 ID。 */
    balanceId: string;
    /** 创建时间。 */
    createDate?: null | string;
    /** 有效期，格式 YYYY-MM-DD。 */
    expiryDate: string;
    /** 生产企业。 */
    enterpriseName: string;
    /** 库存金额，后端按包装单位数量 * 包装单位成本价计算。 */
    inventoryAmount: string;
    /** 最小单位库存数量。 */
    minUnitCount: number;
    /** 最小单位名称。 */
    minUnitName: string;
    /** 库存流水数量。 */
    movementCount: number;
    /** 包装规格。 */
    packageSpecName: string;
    /** 通用名称。 */
    productName: string;
    /** 包装单位库存数量。 */
    packageUnitCount: number;
    /** 包装单位名称。 */
    packageUnitName: string;
    /** 数据版本号。 */
    rowVersion: number;
    /** SKU 编码。 */
    skuCode: string;
    /** SKU ID。 */
    skuId: string;
    /** 规格名称。 */
    specName: string;
    /** 批准文号/注册证号/备案号。 */
    approvalNo: string;
    /** 包装单位成本价。 */
    unitCost: string;
    /** 更新时间。 */
    updateDate?: null | string;
    /** 仓库编码。 */
    warehouseCode: string;
    /** 仓库 ID。 */
    warehouseId: string;
    /** 仓库名称。 */
    warehouseName: string;
  }

  /** 库存流水。 */
  export interface InventoryMovement {
    /** 变更后最小单位数量。 */
    afterMinUnitCount: number;
    /** 变更后包装单位数量。 */
    afterPackageUnitCount: number;
    /** 批次 ID。 */
    batchId: string;
    /** 批号。 */
    batchNo: string;
    /** 品牌/商品名。 */
    brandName?: null | string;
    /** 库存余额 ID。 */
    balanceId: string;
    /** 变更前最小单位数量。 */
    beforeMinUnitCount: number;
    /** 变更前包装单位数量。 */
    beforePackageUnitCount: number;
    /** 变更最小单位数量。 */
    changeMinUnitCount: number;
    /** 变更包装单位数量。 */
    changePackageUnitCount: number;
    /** 创建时间。 */
    createDate?: null | string;
    /** 流水方向。 */
    direction: InventoryDirection;
    /** 有效期，格式 YYYY-MM-DD。 */
    expiryDate: string;
    /** 生产企业。 */
    enterpriseName: string;
    /** 最小单位名称。 */
    minUnitName: string;
    /** 库存业务类型。 */
    movementType: InventoryMovementType;
    /** 库存流水 ID。 */
    movementId: string;
    /** 包装规格。 */
    packageSpecName: string;
    /** 通用名称。 */
    productName: string;
    /** 包装单位名称。 */
    packageUnitName: string;
    /** 备注。 */
    remark?: null | string;
    /** SKU 编码。 */
    skuCode: string;
    /** SKU ID。 */
    skuId: string;
    /** 规格名称。 */
    specName: string;
    /** 批准文号/注册证号/备案号。 */
    approvalNo: string;
    /** 来源单据 ID，初始库存为空。 */
    sourceBillId?: null | string;
    /** 来源单据号。 */
    sourceBillNo: string;
    /** 来源单据类型。 */
    sourceBillType: InventorySourceBillType;
    /** 包装单位成本价。 */
    unitCost: string;
    /** 仓库编码。 */
    warehouseCode: string;
    /** 仓库 ID。 */
    warehouseId: string;
    /** 仓库名称。 */
    warehouseName: string;
  }

  /** 初始库存明细，数量按 SKU 包装单位填写。 */
  export interface InitialStockItem {
    /** 批号。 */
    batchNo: string;
    /** 有效期，格式 YYYY-MM-DD。 */
    expiryDate: string;
    /** 包装单位入库数量。 */
    quantity: number;
    /** 备注。 */
    remark?: null | string;
    /** SKU ID。 */
    skuId: string;
    /** 包装单位成本价。 */
    unitCost: string;
  }

  /** 创建初始库存请求。 */
  export interface CreateInitialStocks {
    /** 初始库存明细，整批提交成功或失败。 */
    items: InitialStockItem[];
    /** 入库仓库 ID。 */
    warehouseId: string;
  }

  /** 创建初始库存结果。 */
  export interface CreateInitialStocksResult {
    /** 写入流水数量。 */
    movementCount: number;
    /** 来源批次号。 */
    sourceBillNo: string;
  }
}

export function getInventoryBalanceListApi(params: Recordable<unknown>) {
  return requestClient.get<{
    items: ErpInventoryApi.InventoryBalance[];
    total: number;
  }>('/erp/inventory/balances', { params });
}

export function getInventoryMovementsApi(
  balanceId: string,
  params: Recordable<unknown>,
) {
  return requestClient.get<{
    items: ErpInventoryApi.InventoryMovement[];
    total: number;
  }>(`/erp/inventory/balances/${balanceId}/movements`, { params });
}

export function createInventoryInitialStocksApi(
  data: ErpInventoryApi.CreateInitialStocks,
) {
  return requestClient.post<ErpInventoryApi.CreateInitialStocksResult>(
    '/erp/inventory/initialStocks',
    data,
  );
}
