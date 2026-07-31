import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { ErpInventoryApi } from '#/api/erp';
import type { ProductSkuApi } from '#/api/product';

import { z } from '#/adapter/form';
import { getWarehouseOptionsApi } from '#/api/erp';
import { getProductSkuOptionsApi } from '#/api/product';
import { $t } from '#/locales';

type InventorySkuOption = ProductSkuApi.ProductSkuOption & {
  skuLabel: string;
};

export function inventorySourceBillTypeLabel(value?: string) {
  if (value === 'INITIAL_STOCK') {
    return $t('erp.inventory.sourceBillTypeInitialStock');
  }
  return value || '-';
}

export function inventoryMovementTypeLabel(value?: string) {
  if (value === 'INITIAL_IN') {
    return $t('erp.inventory.movementTypeInitialIn');
  }
  return value || '-';
}

export function inventoryDirectionLabel(value?: string) {
  if (value === 'IN') {
    return $t('erp.inventory.directionIn');
  }
  return value || '-';
}

export function inventoryAmountLabel(value?: null | string) {
  const trimmed = String(value || '').trim();
  if (!trimmed) return '¥-';

  const [integer = '0', decimal = ''] = trimmed.split('.');
  return `¥${integer || '0'}.${`${decimal}0000`.slice(0, 4)}`;
}

export function inventoryUnitCountLabel(
  count?: null | number,
  unitName?: null | string,
) {
  if (count === undefined || count === null) return '-';
  return `${count}${unitName || ''}`;
}

let inventorySkuOptionsCache: any[] = [];

function inventorySkuOptionLabel(option: ProductSkuApi.ProductSkuOption) {
  return [
    option.productName,
    option.specName,
    option.packageSpecName,
    option.enterpriseName,
  ]
    .filter(Boolean)
    .join(' / ');
}

function getInventorySkuOptions(): Promise<InventorySkuOption[]> {
  return getProductSkuOptionsApi({ pageSize: 100 }).then(
    (options) =>
      (inventorySkuOptionsCache = options.map((option) => ({
        ...option,
        skuLabel: inventorySkuOptionLabel(option),
      }))),
  );
}

export function useInventoryBalanceSearchSchema(): VbenFormSchema[] {
  return [
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
  ];
}

export function useInventoryInitialStockFormSchema(): VbenFormSchema<{
  items: ErpInventoryApi.InitialStockItem[];
  warehouseId: string;
}>[] {
  return [
    {
      component: 'ApiSelect',
      componentProps: {
        api: () => getWarehouseOptionsApi({ pageSize: 100 }),
        labelField: 'warehouseName',
        resultField: '',
        showSearch: true,
        valueField: 'warehouseId',
      },
      fieldName: 'warehouseId',
      label: $t('erp.inventory.warehouse'),
      rules: 'selectRequired',
    },
    {
      arrayProps: {
        addButtonText: $t('erp.inventory.addInitialStockItem'),
        createRow: () => ({
          batchNo: '',
          expiryDate: undefined,
          quantity: 1,
          remark: '',
          skuId: '',
          unitCost: '',
        }),
        max: 100,
        min: 1,
      },
      children: [
        {
          component: 'ApiSelect',
          componentProps: {
            api: getInventorySkuOptions,
            labelField: 'skuLabel',
            resultField: '',
            valueField: 'skuId',
            onSelect: (value, option) => {
              console.log(value, option);
            },
          },
          fieldName: 'skuId',
          label: $t('erp.inventory.sku'),
          rules: 'selectRequired',
          dependencies: {
            async trigger(_values, actions, _controller, ctx) {
              if (!ctx?.rowPath) return;
              const option = inventorySkuOptionsCache.find(
                (item) => item.skuId === ctx.row?.skuId,
              );
              await actions.setFieldValue(
                `${ctx.rowPath}.packageUnitName`,
                option?.packageUnitName,
                false,
              );
            },
            triggerFields: ['skuId'],
          },
        },
        {
          component: 'Input',
          componentProps: (ctx) => ({
            maxlength: 64,
            placeholder: `${$t('erp.inventory.batchNo')} ${
              (ctx.rowIndex ?? 0) + 1
            }`,
          }),
          fieldName: 'batchNo',
          label: $t('erp.inventory.batchNo'),
          rules: z.string().trim().min(1, $t('erp.inventory.batchNoRequired')),
        },
        {
          component: 'DatePicker',
          componentProps: {
            allowClear: false,
            valueFormat: 'YYYY-MM-DD',
          },
          fieldName: 'expiryDate',
          label: $t('erp.inventory.expiryDate'),
          rules: 'selectRequired',
        },
        {
          component: 'InputNumber',
          componentProps: {
            max: 9999.9999,
            min: 0.0001,
            precision: 4,
            prefix: '¥',
            stringMode: true,
          },
          fieldName: 'unitCost',
          label: $t('erp.inventory.unitCost'),
          rules: z.string().trim().min(1, $t('erp.inventory.unitCostRequired')),
        },
        {
          component: 'InputNumber',
          componentProps: {
            max: 9999,
            min: 1,
            precision: 0,
            changeOnWheel: true,
          },
          fieldName: 'quantity',
          label: $t('erp.inventory.quantity'),
          rules: 'required',
          dependencies: {
            triggerFields: ['skuId'],
            resolve: ({ schema }) => {
              const row = schema.row;
              return {
                renderComponentContent: {
                  suffix: () => row?.packageUnitName || '',
                },
              };
            },
          },
        },
        {
          component: 'Input',
          componentProps: { maxlength: 512 },
          fieldName: 'remark',
          label: $t('erp.inventory.remark'),
        },
      ],
      defaultValue: [
        {
          batchNo: '',
          expiryDate: undefined,
          quantity: 1,
          remark: '',
          skuId: '',
          unitCost: '',
        },
      ],
      fieldName: 'items',
      formItemClass: 'col-span-1 md:col-span-2',
      label: $t('erp.inventory.initialStockItems'),
      rules: z.array(z.any()).min(1, $t('erp.inventory.initialStockRequired')),
      type: 'array',
    },
  ];
}

export function useInventoryBalanceColumns(): VxeTableGridOptions<ErpInventoryApi.InventoryBalance>['columns'] {
  return [
    {
      field: 'warehouseCode',
      fixed: 'left',
      minWidth: 130,
      sortable: true,
      title: $t('erp.inventory.warehouseCode'),
      visible: false,
    },
    {
      field: 'warehouseName',
      fixed: 'left',
      minWidth: 100,
      sortable: true,
      title: $t('erp.inventory.warehouseName'),
    },
    {
      field: 'skuCode',
      minWidth: 100,
      sortable: true,
      title: $t('erp.inventory.skuCode'),
    },
    {
      field: 'productName',
      minWidth: 100,
      sortable: true,
      title: $t('erp.inventory.productName'),
    },
    {
      field: 'specName',
      minWidth: 80,
      sortable: true,
      title: $t('erp.inventory.specName'),
    },
    {
      field: 'enterpriseName',
      minWidth: 100,
      showOverflow: 'tooltip',
      sortable: true,
      title: $t('erp.inventory.enterpriseName'),
    },
    {
      field: 'packageSpecName',
      minWidth: 80,
      showOverflow: 'tooltip',
      title: $t('erp.inventory.packageSpecName'),
    },
    {
      field: 'approvalNo',
      minWidth: 100,
      showOverflow: 'tooltip',
      title: $t('erp.inventory.approvalNo'),
    },
    {
      field: 'batchNo',
      minWidth: 100,
      showOverflow: 'tooltip',
      sortable: true,
      title: $t('erp.inventory.batchNo'),
    },
    {
      field: 'expiryDate',
      minWidth: 100,
      sortable: true,
      title: $t('erp.inventory.expiryDate'),
    },
    {
      field: 'unitCost',
      formatter: ({ row }) => inventoryAmountLabel(row.unitCost),
      minWidth: 100,
      sortable: true,
      title: $t('erp.inventory.unitCost'),
    },
    {
      field: 'packageUnitCount',
      formatter: ({ row }) =>
        inventoryUnitCountLabel(row.packageUnitCount, row.packageUnitName),
      minWidth: 140,
      sortable: true,
      title: $t('erp.inventory.packageUnitStock'),
    },
    {
      field: 'minUnitCount',
      formatter: ({ row }) =>
        inventoryUnitCountLabel(row.minUnitCount, row.minUnitName),
      minWidth: 140,
      sortable: true,
      title: $t('erp.inventory.minUnitStock'),
    },
    {
      field: 'inventoryAmount',
      formatter: ({ row }) => inventoryAmountLabel(row.inventoryAmount),
      minWidth: 130,
      sortable: true,
      title: $t('erp.inventory.inventoryAmount'),
    },
    {
      field: 'updateDate',
      minWidth: 100,
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
      width: 100,
    },
  ];
}

export function useInventoryMovementColumns(): VxeTableGridOptions<ErpInventoryApi.InventoryMovement>['columns'] {
  return [
    {
      field: 'sourceBillNo',
      fixed: 'left',
      minWidth: 150,
      sortable: true,
      title: $t('erp.inventory.sourceBillNo'),
    },
    {
      field: 'productName',
      minWidth: 180,
      showOverflow: 'tooltip',
      title: $t('erp.inventory.productName'),
    },
    {
      field: 'specName',
      minWidth: 120,
      title: $t('erp.inventory.specName'),
    },
    {
      field: 'sourceBillType',
      formatter: ({ row }) => inventorySourceBillTypeLabel(row.sourceBillType),
      minWidth: 130,
      sortable: true,
      title: $t('erp.inventory.sourceBillType'),
    },
    {
      field: 'movementType',
      formatter: ({ row }) => inventoryMovementTypeLabel(row.movementType),
      minWidth: 130,
      sortable: true,
      title: $t('erp.inventory.movementType'),
    },
    {
      field: 'direction',
      formatter: ({ row }) => inventoryDirectionLabel(row.direction),
      minWidth: 90,
      sortable: true,
      title: $t('erp.inventory.direction'),
    },
    {
      field: 'changePackageUnitCount',
      formatter: ({ row }) =>
        inventoryUnitCountLabel(
          row.changePackageUnitCount,
          row.packageUnitName,
        ),
      minWidth: 140,
      title: $t('erp.inventory.packageUnitChange'),
    },
    {
      field: 'beforePackageUnitCount',
      formatter: ({ row }) =>
        inventoryUnitCountLabel(
          row.beforePackageUnitCount,
          row.packageUnitName,
        ),
      minWidth: 140,
      title: $t('erp.inventory.packageUnitBefore'),
    },
    {
      field: 'afterPackageUnitCount',
      formatter: ({ row }) =>
        inventoryUnitCountLabel(row.afterPackageUnitCount, row.packageUnitName),
      minWidth: 140,
      title: $t('erp.inventory.packageUnitAfter'),
    },
    {
      field: 'changeMinUnitCount',
      formatter: ({ row }) =>
        inventoryUnitCountLabel(row.changeMinUnitCount, row.minUnitName),
      minWidth: 140,
      title: $t('erp.inventory.minUnitChange'),
    },
    {
      field: 'remark',
      minWidth: 180,
      showOverflow: 'tooltip',
      title: $t('erp.inventory.remark'),
    },
    {
      field: 'createDate',
      minWidth: 180,
      sortable: true,
      title: $t('erp.inventory.createDate'),
    },
  ];
}
