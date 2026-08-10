import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace ErpOtherOutboundApi {
  /** 其它出库单列表记录。 */
  export interface OtherOutboundListItem {
    /** 创建时间。 */
    createDate?: null | string;
    /** 创建人 ID。 */
    creatorId?: null | string;
    /** 明细行数。 */
    lineCount: number;
    /** 单据备注。 */
    remark?: null | string;
    /** 其它出库单业务 ID。 */
    outboundId: string;
    /** 其它出库单号。 */
    outboundNo: string;
    /** 出库日期。 */
    outboundDate: string;
    /** 仓库 ID。 */
    warehouseId: string;
    /** 仓库名称。 */
    warehouseName: string;
  }

  /** 其它出库明细请求。 */
  export interface OtherOutboundItemInput {
    /** 库存余额 ID。 */
    balanceId: string;
    /** 包装单位出库数量。 */
    quantity: number;
    /** 明细备注。 */
    remark?: null | string;
    /** 小包装追溯码。 */
    traceCodes?: string[];
  }

  /** 新增其它出库单请求。 */
  export interface CreateOtherOutbound {
    /** 明细。 */
    items: OtherOutboundItemInput[];
    /** 单据备注。 */
    remark?: null | string;
    /** 出库日期，格式 YYYY-MM-DD。 */
    outboundDate: string;
    /** 仓库 ID。 */
    warehouseId: string;
  }

  /** 其它出库单明细。 */
  export interface OtherOutboundItem extends OtherOutboundItemInput {
    /** 其它出库明细 ID。 */
    outboundItemId: string;
    /** 明细行号。 */
    lineNo: number;
    /** SKU ID。 */
    skuId: string;
    /** SKU 编码。 */
    skuCode: string;
    /** 产品名称。 */
    productName: string;
    /** 规格名称。 */
    specName: string;
    /** 生产企业。 */
    enterpriseName: string;
    /** 包装规格。 */
    packageSpecName: string;
    /** 包装单位名称。 */
    packageUnitName: string;
    /** 批号。 */
    batchNo: string;
    /** 有效期，格式 YYYY-MM-DD。 */
    expiryDate: string;
    /** 包装单位成本价。 */
    unitCost: string;
  }

  /** 其它出库单详情。 */
  export interface OtherOutbound extends OtherOutboundListItem {
    /** 明细。 */
    items: OtherOutboundItem[];
  }
}

/** 获取其它出库单列表。 */
export function getOtherOutboundListApi(params: Recordable<unknown>) {
  return requestClient.get<{
    items: ErpOtherOutboundApi.OtherOutboundListItem[];
    total: number;
  }>('/erp/otherOutbounds', { params });
}

/** 获取其它出库单详情。 */
export function getOtherOutboundDetailApi(outboundId: string) {
  return requestClient.get<ErpOtherOutboundApi.OtherOutbound>(
    `/erp/otherOutbounds/${outboundId}`,
  );
}

/** 新增其它出库单。 */
export function createOtherOutboundApi(
  data: ErpOtherOutboundApi.CreateOtherOutbound,
) {
  return requestClient.post<ErpOtherOutboundApi.OtherOutbound>(
    '/erp/otherOutbounds',
    data,
  );
}
