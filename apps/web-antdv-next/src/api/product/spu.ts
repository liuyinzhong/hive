import type { Recordable } from '@vben/types';

import { objectOmit } from '@vueuse/core';

import { requestClient } from '#/api/request';

export namespace ProductSpuApi {
  /** 通用产品状态：0 停用，1 启用。 */
  export type ProductSpuStatus = 0 | 1;

  /** 产品类型。 */
  export type ProductType =
    | 'CONSUMABLE'
    | 'DEVICE'
    | 'DRUG'
    | 'FSMP'
    | 'OTHER';

  /** 通用产品基础信息。 */
  export interface ProductSpu {
    /** 创建时间。 */
    createDate?: null | string;
    /** 描述。 */
    description?: null | string;
    /** 通用名称。 */
    productName: string;
    /** 产品类型。 */
    productType: ProductType;
    /** 数据版本号。 */
    rowVersion: number;
    /** 简称。 */
    shortName?: null | string;
    /** SPU 编码。 */
    spuCode: string;
    /** SPU ID。 */
    spuId: string;
    /** 状态：0 停用，1 启用。 */
    status: ProductSpuStatus;
    /** 更新时间。 */
    updateDate?: null | string;
  }

  /** 通用产品详情中的规格、厂家和 SKU 扁平行。 */
  export interface ProductSpuDetailRow {
    /** 是否允许拆零：0 否，1 是。 */
    allowSplit?: null | 0 | 1;
    /** 批准文号/注册证号/备案号。 */
    approvalNo?: null | string;
    /** 商品条码。 */
    barcode?: null | string;
    /** 品牌/商品名。 */
    brandName?: null | string;
    /** 剂型/形态。 */
    dosageForm?: null | string;
    /** 企业编码。 */
    enterpriseCode?: null | string;
    /** 企业主体 ID。 */
    enterpriseId?: null | string;
    /** 企业名称。 */
    enterpriseName?: null | string;
    /** GTIN。 */
    gtin?: null | string;
    /** 最小单位。 */
    minUnitName?: null | string;
    /** 厂家产品编码。 */
    mpCode?: null | string;
    /** 厂家产品 ID。 */
    mpId?: null | string;
    /** 厂家产品数据版本号。 */
    mpRowVersion?: null | number;
    /** 包装数量。 */
    packageQuantity?: null | number;
    /** 包装规格名称。 */
    packageSpecName?: null | string;
    /** 包装单位。 */
    packageUnitName?: null | string;
    /** 通用名称。 */
    productName: string;
    /** 产品类型。 */
    productType: ProductType;
    /** 规格产品编码。 */
    rpCode?: null | string;
    /** 规格产品 ID。 */
    rpId?: null | string;
    /** 规格产品数据版本号。 */
    rpRowVersion?: null | number;
    /** 简称。 */
    shortName?: null | string;
    /** SKU 编码。 */
    skuCode?: null | string;
    /** SKU ID。 */
    skuId?: null | string;
    /** SKU 数据版本号。 */
    skuRowVersion?: null | number;
    /** 规格名称。 */
    specName?: null | string;
    /** SPU 编码。 */
    spuCode: string;
    /** SPU ID。 */
    spuId: string;
    /** SKU 状态：0 停用，1 启用。 */
    status?: null | ProductSpuStatus;
    /** 含量/规格文本。 */
    strengthText?: null | string;
    /** UDI-DI。 */
    udiDi?: null | string;
  }

  /** 通用产品详情，包含基础信息和结构行。 */
  export interface ProductSpuDetail extends ProductSpu {
    /** 规格、厂家和 SKU 结构行。 */
    rows: ProductSpuDetailRow[];
  }

  /** 保存通用产品请求。 */
  export type SaveProductSpu = Partial<ProductSpu> & {
    /** 期望数据版本号，更新时必填。 */
    expectedRowVersion?: number;
    /** 通用名称。 */
    productName: string;
    /** 产品类型。 */
    productType: ProductType;
    /** 状态：0 停用，1 启用。 */
    status: ProductSpuStatus;
  };

  /** 更新通用产品状态请求。 */
  export interface UpdateProductSpuStatus {
    /** 期望数据版本号。 */
    expectedRowVersion: number;
    /** 状态：0 停用，1 启用。 */
    status: ProductSpuStatus;
  }

  /** 通用产品下拉选项。 */
  export interface ProductSpuOption {
    /** 通用名称。 */
    productName: string;
    /** 产品类型。 */
    productType: ProductType;
    /** 简称。 */
    shortName?: null | string;
    /** SPU 编码。 */
    spuCode: string;
    /** SPU ID。 */
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
