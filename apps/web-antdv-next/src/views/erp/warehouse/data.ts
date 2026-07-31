import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { ErpWarehouseApi } from '#/api/erp';

import { z } from '#/adapter/form';
import { updateWarehouseStatusApi } from '#/api/erp';
import { $t } from '#/locales';

export const warehouseStorageTypeOptions = () => [
  { label: $t('erp.warehouse.storageTypeNormal'), value: 'NORMAL' },
  {
    label: $t('erp.warehouse.storageTypeRefrigerated'),
    value: 'REFRIGERATED',
  },
  { label: $t('erp.warehouse.storageTypeFrozen'), value: 'FROZEN' },
  { label: $t('erp.warehouse.storageTypeCool'), value: 'COOL' },
  { label: $t('erp.warehouse.storageTypeHazardous'), value: 'HAZARDOUS' },
];

export const warehouseBusinessScopeOptions = () => [
  { label: $t('erp.warehouse.businessScopeDrug'), value: 'DRUG' },
  { label: $t('erp.warehouse.businessScopeConsumable'), value: 'CONSUMABLE' },
  { label: $t('erp.warehouse.businessScopeDevice'), value: 'DEVICE' },
  {
    label: $t('erp.warehouse.businessScopeComprehensive'),
    value: 'COMPREHENSIVE',
  },
];

export const warehouseZoneTypeOptions = () => [
  { label: $t('erp.warehouseZone.typeNormal'), value: 'NORMAL' },
  {
    label: $t('erp.warehouseZone.typePendingInspection'),
    value: 'PENDING_INSPECTION',
  },
  { label: $t('erp.warehouseZone.typeQualified'), value: 'QUALIFIED' },
  { label: $t('erp.warehouseZone.typeUnqualified'), value: 'UNQUALIFIED' },
  { label: $t('erp.warehouseZone.typeReturned'), value: 'RETURNED' },
];

export function warehouseStorageTypeLabel(type?: string) {
  return (
    warehouseStorageTypeOptions().find((item) => item.value === type)?.label ||
    type ||
    '-'
  );
}

export function warehouseBusinessScopeLabel(scope?: string) {
  return (
    warehouseBusinessScopeOptions().find((item) => item.value === scope)
      ?.label ||
    scope ||
    '-'
  );
}

export function warehouseZoneTypeLabel(type?: string) {
  return (
    warehouseZoneTypeOptions().find((item) => item.value === type)?.label ||
    type ||
    '-'
  );
}

export function useWarehouseFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: { maxlength: 128 },
      fieldName: 'warehouseName',
      label: $t('erp.warehouse.warehouseName'),
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: { options: warehouseStorageTypeOptions() },
      defaultValue: 'NORMAL',
      fieldName: 'storageType',
      label: $t('erp.warehouse.storageType'),
      rules: 'selectRequired',
    },
    {
      component: 'Select',
      componentProps: { options: warehouseBusinessScopeOptions() },
      defaultValue: 'COMPREHENSIVE',
      fieldName: 'businessScope',
      label: $t('erp.warehouse.businessScope'),
      rules: 'selectRequired',
    },
    {
      component: 'RadioGroup',
      componentProps: {
        options: [
          { label: $t('common.enabled'), value: 1 },
          { label: $t('common.disabled'), value: 0 },
        ],
      },
      defaultValue: 1,
      fieldName: 'status',
      label: $t('erp.warehouse.status'),
    },
    {
      component: 'Input',
      componentProps: { maxlength: 512 },
      fieldName: 'address',
      formItemClass: 'md:col-span-2',
      label: $t('erp.warehouse.address'),
    },
    {
      component: 'Textarea',
      componentProps: { maxlength: 512, rows: 3, showCount: true },
      fieldName: 'remark',
      formItemClass: 'md:col-span-2',
      label: $t('erp.warehouse.remark'),
      rules: z.string().max(512).nullish(),
    },
  ];
}

export function useWarehouseZoneFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: { maxlength: 128 },
      fieldName: 'zoneName',
      label: $t('erp.warehouseZone.zoneName'),
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: { options: warehouseZoneTypeOptions() },
      defaultValue: 'NORMAL',
      fieldName: 'zoneType',
      label: $t('erp.warehouseZone.zoneType'),
      rules: 'selectRequired',
    },
    {
      component: 'Textarea',
      componentProps: { maxlength: 512, rows: 3, showCount: true },
      fieldName: 'remark',
      formItemClass: 'md:col-span-2',
      label: $t('erp.warehouse.remark'),
      rules: z.string().max(512).nullish(),
    },
  ];
}

export function useWarehouseLocationFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: { maxlength: 128 },
      fieldName: 'locationName',
      label: $t('erp.warehouseLocation.locationName'),
      rules: 'required',
    },
    {
      component: 'Textarea',
      componentProps: { maxlength: 512, rows: 3, showCount: true },
      fieldName: 'remark',
      formItemClass: 'md:col-span-2',
      label: $t('erp.warehouse.remark'),
      rules: z.string().max(512).nullish(),
    },
  ];
}

export function useWarehouseSearchSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: $t('erp.warehouse.keyword'),
      },
      fieldName: 'keyword',
      label: $t('erp.warehouse.keywordLabel'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: warehouseStorageTypeOptions(),
      },
      fieldName: 'storageType',
      label: $t('erp.warehouse.storageType'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: warehouseBusinessScopeOptions(),
      },
      fieldName: 'businessScope',
      label: $t('erp.warehouse.businessScope'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          { label: $t('common.enabled'), value: 1 },
          { label: $t('common.disabled'), value: 0 },
        ],
      },
      fieldName: 'status',
      label: $t('erp.warehouse.status'),
    },
  ];
}

export function useWarehouseZoneSearchSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: $t('erp.warehouseZone.keyword'),
      },
      fieldName: 'keyword',
      label: $t('erp.warehouse.keywordLabel'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: warehouseZoneTypeOptions(),
      },
      fieldName: 'zoneType',
      label: $t('erp.warehouseZone.zoneType'),
    },
  ];
}

export function useWarehouseLocationSearchSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: $t('erp.warehouseLocation.keyword'),
      },
      fieldName: 'keyword',
      label: $t('erp.warehouse.keywordLabel'),
    },
  ];
}

export function useWarehouseColumns(): VxeTableGridOptions<ErpWarehouseApi.Warehouse>['columns'] {
  return [
    {
      field: 'warehouseCode',
      fixed: 'left',
      sortable: true,
      title: $t('erp.warehouse.warehouseCode'),
      width: 130,
    },
    {
      field: 'warehouseName',
      fixed: 'left',
      minWidth: 180,
      sortable: true,
      title: $t('erp.warehouse.warehouseName'),
    },
    {
      field: 'storageType',
      formatter: ({ row }) => warehouseStorageTypeLabel(row.storageType),
      minWidth: 120,
      sortable: true,
      title: $t('erp.warehouse.storageType'),
    },
    {
      field: 'businessScope',
      formatter: ({ row }) => warehouseBusinessScopeLabel(row.businessScope),
      minWidth: 120,
      sortable: true,
      title: $t('erp.warehouse.businessScope'),
    },
    {
      field: 'address',
      minWidth: 180,
      showOverflow: 'tooltip',
      title: $t('erp.warehouse.address'),
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          auth: 'erp:warehouse:status',
          onChange: async (
            newStatus: ErpWarehouseApi.WarehouseStatus,
            row: ErpWarehouseApi.Warehouse,
          ) => {
            const updated = await updateWarehouseStatusApi(row.warehouseId, {
              expectedRowVersion: row.rowVersion,
              status: newStatus,
            });
            row.rowVersion = updated.rowVersion;
            row.status = updated.status;
            row.updateDate = updated.updateDate;
          },
        },
        name: 'CellSwitch',
      },
      field: 'status',
      sortable: true,
      title: $t('erp.warehouse.status'),
      width: 100,
    },
    {
      field: 'updateDate',
      sortable: true,
      title: $t('erp.warehouse.updateDate'),
      width: 180,
    },
    {
      align: 'center',
      field: 'operation',
      fixed: 'right',
      showOverflow: false,
      slots: { default: 'action' },
      title: $t('erp.warehouse.operation'),
      width: 240,
    },
  ];
}

export function useWarehouseZoneColumns(): VxeTableGridOptions<ErpWarehouseApi.WarehouseZone>['columns'] {
  return [
    {
      field: 'zoneCode',
      fixed: 'left',
      sortable: true,
      title: $t('erp.warehouseZone.zoneCode'),
      width: 130,
    },
    {
      field: 'zoneName',
      fixed: 'left',
      minWidth: 180,
      sortable: true,
      title: $t('erp.warehouseZone.zoneName'),
    },
    {
      field: 'zoneType',
      formatter: ({ row }) => warehouseZoneTypeLabel(row.zoneType),
      minWidth: 140,
      sortable: true,
      title: $t('erp.warehouseZone.zoneType'),
    },
    {
      field: 'remark',
      minWidth: 180,
      showOverflow: 'tooltip',
      title: $t('erp.warehouse.remark'),
    },
    {
      field: 'updateDate',
      sortable: true,
      title: $t('erp.warehouse.updateDate'),
      width: 180,
    },
    {
      align: 'center',
      field: 'operation',
      fixed: 'right',
      showOverflow: false,
      slots: { default: 'action' },
      title: $t('erp.warehouse.operation'),
      width: 240,
    },
  ];
}

export function useWarehouseLocationColumns(): VxeTableGridOptions<ErpWarehouseApi.WarehouseLocation>['columns'] {
  return [
    {
      field: 'locationCode',
      fixed: 'left',
      sortable: true,
      title: $t('erp.warehouseLocation.locationCode'),
      width: 130,
    },
    {
      field: 'locationName',
      fixed: 'left',
      minWidth: 180,
      sortable: true,
      title: $t('erp.warehouseLocation.locationName'),
    },
    {
      field: 'remark',
      minWidth: 200,
      showOverflow: 'tooltip',
      title: $t('erp.warehouse.remark'),
    },
    {
      field: 'updateDate',
      sortable: true,
      title: $t('erp.warehouse.updateDate'),
      width: 180,
    },
    {
      align: 'center',
      field: 'operation',
      fixed: 'right',
      showOverflow: false,
      slots: { default: 'action' },
      title: $t('erp.warehouse.operation'),
      width: 150,
    },
  ];
}
