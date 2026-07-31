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
    zoneCount: number;
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

  export type WarehouseZoneType =
    | 'NORMAL'
    | 'PENDING_INSPECTION'
    | 'QUALIFIED'
    | 'RETURNED'
    | 'UNQUALIFIED';

  export interface WarehouseZone {
    createDate?: null | string;
    locationCount: number;
    remark?: null | string;
    rowVersion: number;
    updateDate?: null | string;
    warehouseId: string;
    zoneCode: string;
    zoneId: string;
    zoneName: string;
    zoneType: WarehouseZoneType;
  }

  export type SaveWarehouseZone = Partial<WarehouseZone> & {
    expectedRowVersion?: number;
    zoneName: string;
    zoneType: WarehouseZoneType;
  };

  export interface DeleteWarehouseZone {
    expectedRowVersion: number;
  }

  export interface WarehouseZoneOption {
    warehouseId: string;
    zoneCode: string;
    zoneId: string;
    zoneName: string;
    zoneType: WarehouseZoneType;
  }

  export interface WarehouseLocation {
    createDate?: null | string;
    locationCode: string;
    locationId: string;
    locationName: string;
    remark?: null | string;
    rowVersion: number;
    updateDate?: null | string;
    warehouseId: string;
    zoneId: string;
  }

  export type SaveWarehouseLocation = Partial<WarehouseLocation> & {
    expectedRowVersion?: number;
    locationName: string;
  };

  export interface DeleteWarehouseLocation {
    expectedRowVersion: number;
  }

  export interface WarehouseLocationOption {
    locationCode: string;
    locationId: string;
    locationName: string;
    warehouseId: string;
    zoneId: string;
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

export function getWarehouseZoneListApi(
  warehouseId: string,
  params: Recordable<unknown>,
) {
  return requestClient.get<{
    items: ErpWarehouseApi.WarehouseZone[];
    total: number;
  }>(`/erp/warehouses/${warehouseId}/zones`, { params });
}

export function getWarehouseZoneDetailApi(
  warehouseId: string,
  zoneId: string,
) {
  return requestClient.get<ErpWarehouseApi.WarehouseZone>(
    `/erp/warehouses/${warehouseId}/zones/${zoneId}`,
  );
}

export function getWarehouseZoneOptionsApi(
  warehouseId: string,
  params: Recordable<unknown> = {},
) {
  return requestClient.get<ErpWarehouseApi.WarehouseZoneOption[]>(
    `/erp/warehouses/${warehouseId}/zones/options`,
    { params },
  );
}

export function createWarehouseZoneApi(
  warehouseId: string,
  data: ErpWarehouseApi.SaveWarehouseZone,
) {
  const newData = objectOmit(data, [
    'createDate',
    'locationCount',
    'rowVersion',
    'updateDate',
    'warehouseId',
    'zoneCode',
    'zoneId',
  ]);
  return requestClient.post<ErpWarehouseApi.WarehouseZone>(
    `/erp/warehouses/${warehouseId}/zones`,
    newData,
  );
}

export function updateWarehouseZoneApi(
  warehouseId: string,
  zoneId: string,
  data: ErpWarehouseApi.SaveWarehouseZone,
) {
  const newData = objectOmit(data, [
    'createDate',
    'locationCount',
    'rowVersion',
    'updateDate',
    'warehouseId',
    'zoneCode',
    'zoneId',
  ]);
  return requestClient.put<ErpWarehouseApi.WarehouseZone>(
    `/erp/warehouses/${warehouseId}/zones/${zoneId}`,
    newData,
  );
}

export function deleteWarehouseZoneApi(
  warehouseId: string,
  zoneId: string,
  data: ErpWarehouseApi.DeleteWarehouseZone,
) {
  return requestClient.delete(
    `/erp/warehouses/${warehouseId}/zones/${zoneId}`,
    { data },
  );
}

export function getWarehouseLocationListApi(
  warehouseId: string,
  zoneId: string,
  params: Recordable<unknown>,
) {
  return requestClient.get<{
    items: ErpWarehouseApi.WarehouseLocation[];
    total: number;
  }>(`/erp/warehouses/${warehouseId}/zones/${zoneId}/locations`, { params });
}

export function getWarehouseLocationDetailApi(
  warehouseId: string,
  zoneId: string,
  locationId: string,
) {
  return requestClient.get<ErpWarehouseApi.WarehouseLocation>(
    `/erp/warehouses/${warehouseId}/zones/${zoneId}/locations/${locationId}`,
  );
}

export function getWarehouseLocationOptionsApi(
  warehouseId: string,
  zoneId: string,
  params: Recordable<unknown> = {},
) {
  return requestClient.get<ErpWarehouseApi.WarehouseLocationOption[]>(
    `/erp/warehouses/${warehouseId}/zones/${zoneId}/locations/options`,
    { params },
  );
}

export function createWarehouseLocationApi(
  warehouseId: string,
  zoneId: string,
  data: ErpWarehouseApi.SaveWarehouseLocation,
) {
  const newData = objectOmit(data, [
    'createDate',
    'locationCode',
    'locationId',
    'rowVersion',
    'updateDate',
    'warehouseId',
    'zoneId',
  ]);
  return requestClient.post<ErpWarehouseApi.WarehouseLocation>(
    `/erp/warehouses/${warehouseId}/zones/${zoneId}/locations`,
    newData,
  );
}

export function updateWarehouseLocationApi(
  warehouseId: string,
  zoneId: string,
  locationId: string,
  data: ErpWarehouseApi.SaveWarehouseLocation,
) {
  const newData = objectOmit(data, [
    'createDate',
    'locationCode',
    'locationId',
    'rowVersion',
    'updateDate',
    'warehouseId',
    'zoneId',
  ]);
  return requestClient.put<ErpWarehouseApi.WarehouseLocation>(
    `/erp/warehouses/${warehouseId}/zones/${zoneId}/locations/${locationId}`,
    newData,
  );
}

export function deleteWarehouseLocationApi(
  warehouseId: string,
  zoneId: string,
  locationId: string,
  data: ErpWarehouseApi.DeleteWarehouseLocation,
) {
  return requestClient.delete(
    `/erp/warehouses/${warehouseId}/zones/${zoneId}/locations/${locationId}`,
    { data },
  );
}
