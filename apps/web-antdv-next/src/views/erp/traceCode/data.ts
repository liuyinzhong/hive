import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { ErpInventoryApi } from '#/api/erp';

import { getWarehouseOptionsApi } from '#/api/erp';
import { $t } from '#/locales';

export function inventoryTraceCodeStatusLabel(
  status?: ErpInventoryApi.InventoryTraceCodeStatus,
) {
  if (status === 'IN_STOCK') return $t('erp.traceCode.statusInStock');
  if (status === 'OUTBOUND') return $t('erp.traceCode.statusOutbound');
  return status || '-';
}

export function useInventoryTraceCodeSearchSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: { allowClear: true },
      fieldName: 'traceCode',
      label: $t('erp.traceCode.code'),
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: $t('erp.inventory.skuCodePlaceholder'),
      },
      fieldName: 'skuCode',
      label: $t('erp.inventory.skuCode'),
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: $t('erp.inventory.batchNoPlaceholder'),
      },
      fieldName: 'batchNo',
      label: $t('erp.inventory.batchNo'),
    },
    {
      component: 'ApiSelect',
      componentProps: {
        allowClear: true,
        api: () => getWarehouseOptionsApi({ pageSize: 100 }),
        labelField: 'warehouseName',
        resultField: '',
        showSearch: true,
        valueField: 'warehouseId',
      },
      fieldName: 'warehouseId',
      label: $t('erp.inventory.warehouse'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          {
            label: $t('erp.traceCode.statusInStock'),
            value: 'IN_STOCK',
          },
          {
            label: $t('erp.traceCode.statusOutbound'),
            value: 'OUTBOUND',
          },
        ],
      },
      fieldName: 'status',
      label: $t('erp.traceCode.status'),
    },
  ];
}

export function useInventoryTraceCodeColumns(): VxeTableGridOptions<ErpInventoryApi.InventoryTraceCode>['columns'] {
  return [
    {
      field: 'traceCode',
      fixed: 'left',
      minWidth: 190,
      sortable: true,
      title: $t('erp.traceCode.code'),
    },
    {
      field: 'status',
      formatter: ({ row }) => inventoryTraceCodeStatusLabel(row.status),
      minWidth: 100,
      sortable: true,
      title: $t('erp.traceCode.status'),
    },
    {
      field: 'skuCode',
      minWidth: 130,
      sortable: true,
      title: $t('erp.inventory.skuCode'),
    },
    {
      field: 'productName',
      minWidth: 160,
      showOverflow: 'tooltip',
      title: $t('erp.inventory.productName'),
    },
    {
      field: 'specName',
      minWidth: 120,
      showOverflow: 'tooltip',
      title: $t('erp.inventory.specName'),
    },
    {
      field: 'packageSpecName',
      minWidth: 130,
      showOverflow: 'tooltip',
      title: $t('erp.inventory.packageSpecName'),
    },
    {
      field: 'batchNo',
      minWidth: 120,
      sortable: true,
      title: $t('erp.inventory.batchNo'),
    },
    {
      field: 'expiryDate',
      minWidth: 110,
      sortable: true,
      title: $t('erp.inventory.expiryDate'),
    },
    {
      field: 'warehouseName',
      minWidth: 140,
      sortable: true,
      title: $t('erp.inventory.warehouseName'),
    },
    {
      field: 'createDate',
      minWidth: 180,
      sortable: true,
      title: $t('erp.inventory.createDate'),
    },
    {
      field: 'updateDate',
      minWidth: 180,
      sortable: true,
      title: $t('erp.inventory.updateDate'),
    },
    {
      align: 'center',
      field: 'operation',
      fixed: 'right',
      showOverflow: false,
      slots: { default: 'action' },
      title: $t('erp.inventory.operation'),
      width: 120,
    },
  ];
}
