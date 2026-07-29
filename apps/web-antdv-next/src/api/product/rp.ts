import type { Recordable } from '@vben/types';
import type { ProductSpuApi } from './spu';

import { objectOmit } from '@vueuse/core';

import { requestClient } from '#/api/request';

export namespace ProductRpApi {
  /** 规格产品状态：0 停用，1 启用。 */
  export type ProductRpStatus = 0 | 1;

  /** 规格产品基础信息。 */
  export interface ProductRp {
    /** 创建时间。 */
    createDate?: null | string;
    /** 描述。 */
    description?: null | string;
    /** 剂型/形态。 */
    dosageForm?: null | string;
    /** 通用名称。 */
    productName: string;
    /** 产品类型。 */
    productType: ProductSpuApi.ProductType;
    /** 数据版本号。 */
    rowVersion: number;
    /** RP 编码。 */
    rpCode: string;
    /** RP ID。 */
    rpId: string;
    /** 规格名称。 */
    specName: string;
    /** SPU 编码。 */
    spuCode: string;
    /** SPU ID。 */
    spuId: string;
    /** 状态：0 停用，1 启用。 */
    status: ProductRpStatus;
    /** 含量/规格文本。 */
    strengthText?: null | string;
    /** 更新时间。 */
    updateDate?: null | string;
  }

  /** 保存规格产品请求。 */
  export type SaveProductRp = Partial<ProductRp> & {
    /** 期望数据版本号，更新时必填。 */
    expectedRowVersion?: number;
    /** 规格名称。 */
    specName: string;
    /** 所属 SPU ID。 */
    spuId: string;
    /** 状态：0 停用，1 启用。 */
    status: ProductRpStatus;
  };

  /** 更新规格产品状态请求。 */
  export interface UpdateProductRpStatus {
    /** 期望数据版本号。 */
    expectedRowVersion: number;
    /** 状态：0 停用，1 启用。 */
    status: ProductRpStatus;
  }

  /** 规格产品下拉选项。 */
  export interface ProductRpOption {
    /** 通用名称。 */
    productName: string;
    /** 产品类型。 */
    productType: ProductSpuApi.ProductType;
    /** RP 编码。 */
    rpCode: string;
    /** RP ID。 */
    rpId: string;
    /** 规格名称。 */
    specName: string;
    /** SPU 编码。 */
    spuCode: string;
    /** SPU ID。 */
    spuId: string;
  }
}

export function getProductRpListApi(params: Recordable<unknown>) {
  return requestClient.get<{
    items: ProductRpApi.ProductRp[];
    total: number;
  }>('/product/rps', { params });
}

export function getProductRpDetailApi(rpId: string) {
  return requestClient.get<ProductRpApi.ProductRp>(`/product/rps/${rpId}`);
}

export function createProductRpApi(data: ProductRpApi.SaveProductRp) {
  const newData = objectOmit(data, [
    'createDate',
    'productName',
    'productType',
    'rowVersion',
    'rpCode',
    'rpId',
    'spuCode',
    'updateDate',
  ]);
  return requestClient.post<ProductRpApi.ProductRp>('/product/rps', newData);
}

export function updateProductRpApi(
  rpId: string,
  data: ProductRpApi.SaveProductRp,
) {
  const newData = objectOmit(data, [
    'createDate',
    'productName',
    'productType',
    'rowVersion',
    'rpCode',
    'rpId',
    'spuCode',
    'updateDate',
  ]);
  return requestClient.put<ProductRpApi.ProductRp>(
    `/product/rps/${rpId}`,
    newData,
  );
}

export function updateProductRpStatusApi(
  rpId: string,
  data: ProductRpApi.UpdateProductRpStatus,
) {
  return requestClient.put<ProductRpApi.ProductRp>(
    `/product/rps/${rpId}/status`,
    data,
  );
}

export function getProductRpOptionsApi(params: Recordable<unknown> = {}) {
  return requestClient.get<ProductRpApi.ProductRpOption[]>(
    '/product/rps/options',
    { params },
  );
}
