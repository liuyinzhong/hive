import type { Recordable } from '@vben/types';
import type { ProductMpApi } from './mp';

import { objectOmit } from '@vueuse/core';

import { requestClient } from '#/api/request';

export namespace ProductSkuApi {
  /** SKU 状态：0 停用，1 启用。 */
  export type ProductSkuStatus = 0 | 1;
  /** 是否允许拆零：0 否，1 是。 */
  export type ProductSkuAllowSplit = 0 | 1;

  /** 产品品规（SKU）基础信息。 */
  export interface ProductSku {
    /** 是否允许拆零：0 否，1 是。 */
    allowSplit: ProductSkuAllowSplit;
    /** 批准文号/注册证号/备案号。 */
    approvalNo: string;
    /** 商品条码。 */
    barcode?: null | string;
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
    /** GTIN。 */
    gtin?: null | string;
    /** 最小单位。 */
    minUnitName: string;
    /** MP 编码。 */
    mpCode: string;
    /** MP ID。 */
    mpId: string;
    /** 包装数量。 */
    packageQuantity: number;
    /** 包装规格名称。 */
    packageSpecName: string;
    /** 包装单位。 */
    packageUnitName: string;
    /** 通用名称。 */
    productName: string;
    /** 产品类型。 */
    productType: ProductMpApi.ProductMp['productType'];
    /** 数据版本号。 */
    rowVersion: number;
    /** RP 编码。 */
    rpCode: string;
    /** RP ID。 */
    rpId: string;
    /** SKU 编码。 */
    skuCode: string;
    /** SKU ID。 */
    skuId: string;
    /** 规格名称。 */
    specName: string;
    /** SPU 编码。 */
    spuCode: string;
    /** SPU ID。 */
    spuId: string;
    /** 状态：0 停用，1 启用。 */
    status: ProductSkuStatus;
    /** UDI-DI。 */
    udiDi?: null | string;
    /** 更新时间。 */
    updateDate?: null | string;
  }

  /** 保存产品品规（SKU）请求。 */
  export type SaveProductSku = Partial<ProductSku> & {
    /** 是否允许拆零：0 否，1 是。 */
    allowSplit: ProductSkuAllowSplit;
    /** 期望数据版本号，更新时必填。 */
    expectedRowVersion?: number;
    /** 最小单位。 */
    minUnitName: string;
    /** 所属 MP ID。 */
    mpId: string;
    /** 包装数量。 */
    packageQuantity: number;
    /** 包装规格名称。 */
    packageSpecName: string;
    /** 包装单位。 */
    packageUnitName: string;
    /** 状态：0 停用，1 启用。 */
    status: ProductSkuStatus;
  };

  /** 更新产品品规（SKU）状态请求。 */
  export interface UpdateProductSkuStatus {
    /** 期望数据版本号。 */
    expectedRowVersion: number;
    /** 状态：0 停用，1 启用。 */
    status: ProductSkuStatus;
  }

  /** 产品品规（SKU）下拉选项。 */
  export interface ProductSkuOption {
    /** 是否允许拆零：0 否，1 是。 */
    allowSplit?: ProductSkuAllowSplit;
    /** 批准文号/注册证号/备案号。 */
    approvalNo: string;
    /** 品牌/商品名。 */
    brandName?: null | string;
    /** 企业主体 ID。 */
    enterpriseId: string;
    /** 企业名称。 */
    enterpriseName: string;
    /** MP 编码。 */
    mpCode: string;
    /** MP ID。 */
    mpId: string;
    /** 包装规格名称。 */
    packageSpecName: string;
    /** 通用名称。 */
    productName: string;
    /** 产品类型。 */
    productType: ProductMpApi.ProductMp['productType'];
    /** RP 编码。 */
    rpCode: string;
    /** RP ID。 */
    rpId: string;
    /** SKU 编码。 */
    skuCode: string;
    /** SKU ID。 */
    skuId: string;
    /** 规格名称。 */
    specName: string;
    /** SPU 编码。 */
    spuCode: string;
    /** SPU ID。 */
    spuId: string;
  }

  /** SKU 价格状态：0 停用，1 启用。 */
  export type ProductSkuPriceStatus = 0 | 1;
  /** SKU 价格税口径：0 不含税，1 含税。 */
  export type ProductSkuPriceTaxIncluded = 0 | 1;

  /** 产品品规价格信息。 */
  export interface ProductSkuPrice {
    /** 创建时间。 */
    createDate?: null | string;
    /** 币种，第一版仅支持 CNY。 */
    currencyCode: string;
    /** 生效结束时间，空表示长期有效。 */
    effectiveEnd?: null | string;
    /** 生效开始时间。 */
    effectiveStart: string;
    /** 价格金额，十进制定点字符串。 */
    price: string;
    /** 价格 ID。 */
    priceId: string;
    /** 价格类型。 */
    priceType: string;
    /** 备注。 */
    remark?: null | string;
    /** 数据版本号。 */
    rowVersion: number;
    /** 价格范围对象 ID，全局价为空。 */
    scopeId?: null | string;
    /** 价格范围对象名称。 */
    scopeName?: null | string;
    /** 价格范围类型。 */
    scopeType: string;
    /** SKU 编码。 */
    skuCode: string;
    /** SKU ID。 */
    skuId: string;
    /** 状态：0 停用，1 启用。 */
    status: ProductSkuPriceStatus;
    /** 是否含税：0 不含税，1 含税。 */
    taxIncluded: ProductSkuPriceTaxIncluded;
    /** 阶梯价格数量。 */
    tierCount: number;
    /** 更新时间。 */
    updateDate?: null | string;
  }

  /** 保存产品品规价格请求。 */
  export type SaveProductSkuPrice = Partial<ProductSkuPrice> & {
    /** 币种，第一版仅支持 CNY。 */
    currencyCode?: string;
    /** 生效结束时间，空表示长期有效。 */
    effectiveEnd?: null | string;
    /** 生效开始时间。 */
    effectiveStart: string;
    /** 期望数据版本号，更新时必填。 */
    expectedRowVersion?: number;
    /** 价格金额，十进制定点字符串。 */
    price: string;
    /** 价格类型。 */
    priceType: string;
    /** 价格范围对象 ID，全局价为空。 */
    scopeId?: null | string;
    /** 价格范围类型。 */
    scopeType: string;
    /** 状态：0 停用，1 启用。 */
    status: ProductSkuPriceStatus;
    /** 是否含税：0 不含税，1 含税。 */
    taxIncluded: ProductSkuPriceTaxIncluded;
  };

  /** 更新产品品规价格状态请求。 */
  export interface UpdateProductSkuPriceStatus {
    /** 期望数据版本号。 */
    expectedRowVersion: number;
    /** 状态：0 停用，1 启用。 */
    status: ProductSkuPriceStatus;
  }

  /** 删除产品品规价格请求。 */
  export interface DeleteProductSkuPrice {
    /** 期望数据版本号。 */
    expectedRowVersion: number;
  }

  /** 产品品规价格阶梯信息。 */
  export interface ProductSkuPriceTier {
    /** 创建时间。 */
    createDate?: null | string;
    /** 结束数量，空表示以上。 */
    maxQuantity?: null | number;
    /** 起始数量。 */
    minQuantity: number;
    /** 价格 ID。 */
    priceId: string;
    /** 阶梯 ID。 */
    tierId: string;
    /** 阶梯单价，十进制定点字符串。 */
    tierPrice: string;
    /** 更新时间。 */
    updateDate?: null | string;
  }

  /** 保存产品品规价格阶梯明细。 */
  export interface SaveProductSkuPriceTierItem {
    /** 结束数量，空表示以上。 */
    maxQuantity?: null | number;
    /** 起始数量。 */
    minQuantity: number;
    /** 阶梯 ID，新建时为空。 */
    tierId?: null | string;
    /** 阶梯单价，十进制定点字符串。 */
    tierPrice: string;
  }

  /** 保存产品品规价格阶梯请求。 */
  export interface SaveProductSkuPriceTiers {
    /** 期望父级价格数据版本号。 */
    expectedPriceRowVersion: number;
    /** 完整阶梯数组，空数组表示清空阶梯。 */
    tiers: SaveProductSkuPriceTierItem[];
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

export function getProductSkuPriceListApi(skuId: string) {
  return requestClient.get<ProductSkuApi.ProductSkuPrice[]>(
    `/product/skus/${skuId}/prices`,
  );
}

export function createProductSkuPriceApi(
  skuId: string,
  data: ProductSkuApi.SaveProductSkuPrice,
) {
  const newData = objectOmit(data, [
    'createDate',
    'priceId',
    'rowVersion',
    'scopeName',
    'skuCode',
    'skuId',
    'updateDate',
  ]);
  return requestClient.post<ProductSkuApi.ProductSkuPrice>(
    `/product/skus/${skuId}/prices`,
    newData,
  );
}

export function updateProductSkuPriceApi(
  skuId: string,
  priceId: string,
  data: ProductSkuApi.SaveProductSkuPrice,
) {
  const newData = objectOmit(data, [
    'createDate',
    'priceId',
    'rowVersion',
    'scopeName',
    'skuCode',
    'skuId',
    'updateDate',
  ]);
  return requestClient.put<ProductSkuApi.ProductSkuPrice>(
    `/product/skus/${skuId}/prices/${priceId}`,
    newData,
  );
}

export function updateProductSkuPriceStatusApi(
  skuId: string,
  priceId: string,
  data: ProductSkuApi.UpdateProductSkuPriceStatus,
) {
  return requestClient.put<ProductSkuApi.ProductSkuPrice>(
    `/product/skus/${skuId}/prices/${priceId}/status`,
    data,
  );
}

export function deleteProductSkuPriceApi(
  skuId: string,
  priceId: string,
  data: ProductSkuApi.DeleteProductSkuPrice,
) {
  return requestClient.delete(`/product/skus/${skuId}/prices/${priceId}`, {
    data,
  });
}

export function getProductSkuPriceTiersApi(skuId: string, priceId: string) {
  return requestClient.get<ProductSkuApi.ProductSkuPriceTier[]>(
    `/product/skus/${skuId}/prices/${priceId}/tiers`,
  );
}

export function saveProductSkuPriceTiersApi(
  skuId: string,
  priceId: string,
  data: ProductSkuApi.SaveProductSkuPriceTiers,
) {
  return requestClient.put<ProductSkuApi.ProductSkuPrice>(
    `/product/skus/${skuId}/prices/${priceId}/tiers`,
    data,
  );
}
