import type { Recordable } from '@vben/types';
import type { ProductMpApi } from './mp';

import { objectOmit } from '@vueuse/core';

import { requestClient } from '#/api/request';

export namespace ProductSkuApi {
  export type ProductSkuStatus = 0 | 1;
  export type ProductSkuAllowSplit = 0 | 1;

  export interface ProductSku {
    allowSplit: ProductSkuAllowSplit;
    approvalNo: string;
    barcode?: null | string;
    brandName?: null | string;
    createDate?: null | string;
    description?: null | string;
    enterpriseCode: string;
    enterpriseId: string;
    enterpriseName: string;
    gtin?: null | string;
    minUnitName: string;
    mpCode: string;
    mpId: string;
    packageQuantity: number;
    packageSpecName: string;
    packageUnitName: string;
    productName: string;
    productType: ProductMpApi.ProductMp['productType'];
    rowVersion: number;
    rpCode: string;
    rpId: string;
    skuCode: string;
    skuId: string;
    specName: string;
    spuCode: string;
    spuId: string;
    status: ProductSkuStatus;
    udiDi?: null | string;
    updateDate?: null | string;
  }

  export type SaveProductSku = Partial<ProductSku> & {
    allowSplit: ProductSkuAllowSplit;
    expectedRowVersion?: number;
    minUnitName: string;
    mpId: string;
    packageQuantity: number;
    packageSpecName: string;
    packageUnitName: string;
    status: ProductSkuStatus;
  };

  export interface UpdateProductSkuStatus {
    expectedRowVersion: number;
    status: ProductSkuStatus;
  }

  export interface ProductSkuOption {
    allowSplit?: ProductSkuAllowSplit;
    approvalNo: string;
    brandName?: null | string;
    enterpriseId: string;
    enterpriseName: string;
    mpCode: string;
    mpId: string;
    packageSpecName: string;
    productName: string;
    productType: ProductMpApi.ProductMp['productType'];
    rpCode: string;
    rpId: string;
    skuCode: string;
    skuId: string;
    specName: string;
    spuCode: string;
    spuId: string;
  }
}

export function getProductSkuListApi(params: Recordable<unknown>) {
  return requestClient.get<{
    items: ProductSkuApi.ProductSku[];
    total: number;
  }>('/product/skus', { params });
}

export function getProductSkuDetailApi(skuId: string) {
  return requestClient.get<ProductSkuApi.ProductSku>(`/product/skus/${skuId}`);
}

export function createProductSkuApi(data: ProductSkuApi.SaveProductSku) {
  const newData = objectOmit(data, [
    'approvalNo',
    'brandName',
    'createDate',
    'enterpriseCode',
    'enterpriseId',
    'enterpriseName',
    'mpCode',
    'productName',
    'productType',
    'rowVersion',
    'rpCode',
    'rpId',
    'skuCode',
    'skuId',
    'specName',
    'spuCode',
    'spuId',
    'updateDate',
  ]);
  return requestClient.post<ProductSkuApi.ProductSku>('/product/skus', newData);
}

export function updateProductSkuApi(
  skuId: string,
  data: ProductSkuApi.SaveProductSku,
) {
  const newData = objectOmit(data, [
    'approvalNo',
    'brandName',
    'createDate',
    'enterpriseCode',
    'enterpriseId',
    'enterpriseName',
    'mpCode',
    'productName',
    'productType',
    'rowVersion',
    'rpCode',
    'rpId',
    'skuCode',
    'skuId',
    'specName',
    'spuCode',
    'spuId',
    'updateDate',
  ]);
  return requestClient.put<ProductSkuApi.ProductSku>(
    `/product/skus/${skuId}`,
    newData,
  );
}

export function updateProductSkuStatusApi(
  skuId: string,
  data: ProductSkuApi.UpdateProductSkuStatus,
) {
  return requestClient.put<ProductSkuApi.ProductSku>(
    `/product/skus/${skuId}/status`,
    data,
  );
}

export function getProductSkuOptionsApi(params: Recordable<unknown> = {}) {
  return requestClient.get<ProductSkuApi.ProductSkuOption[]>(
    '/product/skus/options',
    { params },
  );
}
