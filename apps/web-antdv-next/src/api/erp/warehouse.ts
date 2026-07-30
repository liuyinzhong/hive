import type { Recordable } from '@vben/types';

import { objectOmit } from '@vueuse/core';

import { requestClient } from '#/api/request';

export namespace ErpWarehouseApi {
  export type WarehouseStatus = 0 | 1;

  export type WarehouseStorageType =
    | 'COOL'
    | 'FROZEN'
    | 'HAZARDOUS'
    | 'NORMAL'
    | 'REFRIGERATED';

  export type WarehouseBusinessScope =
    | 'COMPREHENSIVE'
    | 'CONSUMABLE'
    | 'DEVICE'
    | 'DRUG';

  export interface Warehouse {
    address?: null | string;
    businessScope: WarehouseBusinessScope;
    createDate?: null | string;
    remark?: null | string;
    rowVersion: number;
    status: WarehouseStatus;
    storageType: WarehouseStorageType;
    updateDate?: null | string;
    warehouseCode: string;
    warehouseId: string;
    warehouseName: string;
  }

  export type SaveWarehouse = Partial<Warehouse> & {
    businessScope: WarehouseBusinessScope;
    expectedRowVersion?: number;
    status: WarehouseStatus;
    storageType: WarehouseStorageType;
    warehouseName: string;
  };

  export interface UpdateWarehouseStatus {
    expectedRowVersion: number;
    status: WarehouseStatus;
  }

  export interface DeleteWarehouse {
    expectedRowVersion: number;
  }

  export interface WarehouseOption {
    businessScope: WarehouseBusinessScope;
    storageType: WarehouseStorageType;
    warehouseCode: string;
    warehouseId: string;
    warehouseName: string;
  }
}

export function getWarehouseListApi(params: Recordable<unknown>) {
  return requestClient.get<{
    items: ErpWarehouseApi.Warehouse[];
    total: number;
  }>('/erp/warehouses', { params });
}

export function getWarehouseDetailApi(warehouseId: string) {
  return requestClient.get<ErpWarehouseApi.Warehouse>(
    `/erp/warehouses/${warehouseId}`,
  );
}

export function getWarehouseOptionsApi(params: Recordable<unknown> = {}) {
  return requestClient.get<ErpWarehouseApi.WarehouseOption[]>(
    '/erp/warehouses/options',
    { params },
  );
}

export function createWarehouseApi(data: ErpWarehouseApi.SaveWarehouse) {
  const newData = objectOmit(data, [
    'createDate',
    'rowVersion',
    'updateDate',
    'warehouseCode',
    'warehouseId',
  ]);
  return requestClient.post<ErpWarehouseApi.Warehouse>(
    '/erp/warehouses',
    newData,
  );
}

export function updateWarehouseApi(
  warehouseId: string,
  data: ErpWarehouseApi.SaveWarehouse,
) {
  const newData = objectOmit(data, [
    'createDate',
    'rowVersion',
    'updateDate',
    'warehouseCode',
    'warehouseId',
  ]);
  return requestClient.put<ErpWarehouseApi.Warehouse>(
    `/erp/warehouses/${warehouseId}`,
    newData,
  );
}

export function updateWarehouseStatusApi(
  warehouseId: string,
  data: ErpWarehouseApi.UpdateWarehouseStatus,
) {
  return requestClient.put<ErpWarehouseApi.Warehouse>(
    `/erp/warehouses/${warehouseId}/status`,
    data,
  );
}

export function deleteWarehouseApi(
  warehouseId: string,
  data: ErpWarehouseApi.DeleteWarehouse,
) {
  return requestClient.delete(`/erp/warehouses/${warehouseId}`, { data });
}
