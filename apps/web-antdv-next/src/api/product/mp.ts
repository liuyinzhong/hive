import type { Recordable } from '@vben/types';
import type { ProductSpuApi } from './spu';

import { objectOmit } from '@vueuse/core';

import { requestClient } from '#/api/request';

export namespace ProductMpApi {
  export type ProductMpStatus = 0 | 1;

  export interface ProductMp {
    approvalNo: string;
    brandName?: null | string;
    createDate?: null | string;
    description?: null | string;
    enterpriseCode: string;
    enterpriseId: string;
    enterpriseName: string;
    mpCode: string;
    mpId: string;
    productName: string;
    productType: ProductSpuApi.ProductType;
    rowVersion: number;
    rpCode: string;
    rpId: string;
    specName: string;
    spuCode: string;
    spuId: string;
    status: ProductMpStatus;
    updateDate?: null | string;
  }

  export type SaveProductMp = Partial<ProductMp> & {
    approvalNo: string;
    enterpriseId: string;
    enterpriseDisplay?: string;
    expectedRowVersion?: number;
    rpId: string;
    status: ProductMpStatus;
  };

  export interface UpdateProductMpStatus {
    expectedRowVersion: number;
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
