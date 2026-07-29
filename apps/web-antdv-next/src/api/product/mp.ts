import type { Recordable } from '@vben/types';
import type { ProductSpuApi } from './spu';

import { objectOmit } from '@vueuse/core';

import { requestClient } from '#/api/request';

export namespace ProductMpApi {
  /** 厂家产品状态：0 停用，1 启用。 */
  export type ProductMpStatus = 0 | 1;

  /** 厂家产品基础信息。 */
  export interface ProductMp {
    /** 批准文号/注册证号/备案号。 */
    approvalNo: string;
    /** 品牌/商品名。 */
    brandName?: null | string;
    /** 创建时间。 */
    createDate?: null | string;
    /** 描述。 */
    description?: null | string;
    /** 企业编码。 */
    enterpriseCode: string;
    /** 企业主体 ID。 */
    enterpriseId: string;
    /** 企业名称。 */
    enterpriseName: string;
    /** MP 编码。 */
    mpCode: string;
    /** MP ID。 */
    mpId: string;
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
    status: ProductMpStatus;
    /** 更新时间。 */
    updateDate?: null | string;
  }

  /** 保存厂家产品请求。 */
  export type SaveProductMp = Partial<ProductMp> & {
    /** 批准文号/注册证号/备案号。 */
    approvalNo: string;
    /** 企业主体 ID。 */
    enterpriseId: string;
    /** 企业选择器展示字段，仅前端使用。 */
    enterpriseDisplay?: string;
    /** 期望数据版本号，更新时必填。 */
    expectedRowVersion?: number;
    /** 所属 RP ID。 */
    rpId: string;
    /** 状态：0 停用，1 启用。 */
    status: ProductMpStatus;
  };

  /** 更新厂家产品状态请求。 */
  export interface UpdateProductMpStatus {
    /** 期望数据版本号。 */
    expectedRowVersion: number;
    /** 状态：0 停用，1 启用。 */
    status: ProductMpStatus;
  }
}

export function getProductMpListApi(params: Recordable<unknown>) {
  return requestClient.get<{
    items: ProductMpApi.ProductMp[];
    total: number;
  }>('/product/mps', { params });
}

export function getProductMpDetailApi(mpId: string) {
  return requestClient.get<ProductMpApi.ProductMp>(`/product/mps/${mpId}`);
}

export function createProductMpApi(data: ProductMpApi.SaveProductMp) {
  const newData = objectOmit(data, [
    'createDate',
    'enterpriseCode',
    'enterpriseDisplay',
    'enterpriseName',
    'mpCode',
    'mpId',
    'productName',
    'productType',
    'rowVersion',
    'rpCode',
    'specName',
    'spuCode',
    'spuId',
    'updateDate',
  ]);
  return requestClient.post<ProductMpApi.ProductMp>('/product/mps', newData);
}

export function updateProductMpApi(
  mpId: string,
  data: ProductMpApi.SaveProductMp,
) {
  const newData = objectOmit(data, [
    'createDate',
    'enterpriseCode',
    'enterpriseDisplay',
    'enterpriseName',
    'mpCode',
    'mpId',
    'productName',
    'productType',
    'rowVersion',
    'rpCode',
    'specName',
    'spuCode',
    'spuId',
    'updateDate',
  ]);
  return requestClient.put<ProductMpApi.ProductMp>(
    `/product/mps/${mpId}`,
    newData,
  );
}

export function updateProductMpStatusApi(
  mpId: string,
  data: ProductMpApi.UpdateProductMpStatus,
) {
  return requestClient.put<ProductMpApi.ProductMp>(
    `/product/mps/${mpId}/status`,
    data,
  );
}
