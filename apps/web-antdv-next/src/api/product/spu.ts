import type { Recordable } from '@vben/types';

import { objectOmit } from '@vueuse/core';

import { requestClient } from '#/api/request';

export namespace ProductSpuApi {
  export type ProductSpuStatus = 0 | 1;

  export type ProductType =
    | 'CONSUMABLE'
    | 'DEVICE'
    | 'DRUG'
    | 'FSMP'
    | 'OTHER';

  export interface ProductSpu {
    createDate?: null | string;
    description?: null | string;
    productName: string;
    productType: ProductType;
    rowVersion: number;
    shortName?: null | string;
    spuCode: string;
    spuId: string;
    status: ProductSpuStatus;
    updateDate?: null | string;
  }

  export interface ProductSpuDetailRow {
    allowSplit?: null | 0 | 1;
    approvalNo?: null | string;
    barcode?: null | string;
    brandName?: null | string;
    dosageForm?: null | string;
    enterpriseCode?: null | string;
    enterpriseId?: null | string;
    enterpriseName?: null | string;
    gtin?: null | string;
    minUnitName?: null | string;
    mpCode?: null | string;
    mpId?: null | string;
    mpRowVersion?: null | number;
    packageQuantity?: null | number;
    packageSpecName?: null | string;
    packageUnitName?: null | string;
    productName: string;
    productType: ProductType;
    rpCode?: null | string;
    rpId?: null | string;
    rpRowVersion?: null | number;
    shortName?: null | string;
    skuCode?: null | string;
    skuId?: null | string;
    skuRowVersion?: null | number;
    specName?: null | string;
    spuCode: string;
    spuId: string;
    status?: null | ProductSpuStatus;
    strengthText?: null | string;
    udiDi?: null | string;
  }

  export interface ProductSpuDetail extends ProductSpu {
    rows: ProductSpuDetailRow[];
  }

  export type SaveProductSpu = Partial<ProductSpu> & {
    expectedRowVersion?: number;
    productName: string;
    productType: ProductType;
    status: ProductSpuStatus;
  };

  export interface UpdateProductSpuStatus {
    expectedRowVersion: number;
    status: ProductSpuStatus;
  }

  export interface ProductSpuOption {
    productName: string;
    productType: ProductType;
    shortName?: null | string;
    spuCode: string;
    spuId: string;
  }
}

export function getProductSpuListApi(params: Recordable<unknown>) {
  return requestClient.get<{
    items: ProductSpuApi.ProductSpu[];
    total: number;
  }>('/product/spus', { params });
}

export function getProductSpuDetailApi(spuId: string) {
  return requestClient.get<ProductSpuApi.ProductSpuDetail>(
    `/product/spus/${spuId}`,
  );
}

export function createProductSpuApi(data: ProductSpuApi.SaveProductSpu) {
  const newData = objectOmit(data, [
    'createDate',
    'rowVersion',
    'spuCode',
    'spuId',
    'updateDate',
  ]);
  return requestClient.post<ProductSpuApi.ProductSpu>('/product/spus', newData);
}

export function updateProductSpuApi(
  spuId: string,
  data: ProductSpuApi.SaveProductSpu,
) {
  const newData = objectOmit(data, [
    'createDate',
    'rowVersion',
    'spuCode',
    'spuId',
    'updateDate',
  ]);
  return requestClient.put<ProductSpuApi.ProductSpu>(
    `/product/spus/${spuId}`,
    newData,
  );
}

export function updateProductSpuStatusApi(
  spuId: string,
  data: ProductSpuApi.UpdateProductSpuStatus,
) {
  return requestClient.put<ProductSpuApi.ProductSpu>(
    `/product/spus/${spuId}/status`,
    data,
  );
}

export function getProductSpuOptionsApi(params: Recordable<unknown> = {}) {
  return requestClient.get<ProductSpuApi.ProductSpuOption[]>(
    '/product/spus/options',
    { params },
  );
}
