import type { Recordable } from '@vben/types';
import type { ProductSpuApi } from './spu';

import { objectOmit } from '@vueuse/core';

import { requestClient } from '#/api/request';

export namespace ProductRpApi {
  export type ProductRpStatus = 0 | 1;

  export interface ProductRp {
    createDate?: null | string;
    description?: null | string;
    dosageForm?: null | string;
    productName: string;
    productType: ProductSpuApi.ProductType;
    rowVersion: number;
    rpCode: string;
    rpId: string;
    specName: string;
    spuCode: string;
    spuId: string;
    status: ProductRpStatus;
    strengthText?: null | string;
    updateDate?: null | string;
  }

  export type SaveProductRp = Partial<ProductRp> & {
    expectedRowVersion?: number;
    specName: string;
    spuId: string;
    status: ProductRpStatus;
  };

  export interface UpdateProductRpStatus {
    expectedRowVersion: number;
    status: ProductRpStatus;
  }

  export interface ProductRpOption {
    productName: string;
    productType: ProductSpuApi.ProductType;
    rpCode: string;
    rpId: string;
    specName: string;
    spuCode: string;
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
