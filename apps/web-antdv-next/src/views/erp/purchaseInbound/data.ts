import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { ErpPurchaseInboundApi } from '#/api/erp';
import type { ProductSkuApi } from '#/api/product';
import type { InputNumberProps } from 'antdv-next';

import { getEnterpriseOptionsApi } from '#/api/base';
import { getWarehouseOptionsApi } from '#/api/erp';
import { getProductSkuOptionsApi } from '#/api/product';
import { $t } from '#/locales';

import { inventoryAmountLabel } from '../inventory/data';

export type PurchaseInboundSkuOption = ProductSkuApi.ProductSkuOption & {
  skuLabel: string;
};

export interface PurchaseInboundFormItem
  extends ErpPurchaseInboundApi.PurchaseInboundItemInput {
  packageUnitName?: string;
}

export interface PurchaseInboundFormValues extends Record<string, unknown> {
  inboundDate: string;
  items: PurchaseInboundFormItem[];
  remark?: string;
  supplierId: string;
  warehouseId: string;
}

export function purchaseInboundSkuOptionLabel(
  option: ProductSkuApi.ProductSkuOption,
) {
  return [
    option.skuCode,
    option.productName,
    option.specName,
    option.packageSpecName,
    option.enterpriseName,
  ]
    .filter(Boolean)
    .join(' / ');
}

let purchaseInboundSkuOptionsCache: PurchaseInboundSkuOption[] = [];

function getPurchaseInboundSkuOptions(): Promise<PurchaseInboundSkuOption[]> {
  return getProductSkuOptionsApi({ pageSize: 100 }).then(
    (options) =>
      (purchaseInboundSkuOptionsCache = options.map((option) => ({
        ...option,
        skuLabel: purchaseInboundSkuOptionLabel(option),
      }))),
  );
}

function getPurchaseInboundSkuPackageUnitName(skuId?: string) {
  if (!skuId) return '';
  return (
    purchaseInboundSkuOptionsCache.find((option) => option.skuId === skuId)
      ?.packageUnitName || ''
  );
}

const quantityFormatter =
  (unitName?: string): InputNumberProps['formatter'] =>
  (value) => {
    if (value === undefined || value === null || value === '') return '';
    return unitName ? `${value}${unitName}` : `${value}`;
  };

const quantityParser =
  (unitName?: string): InputNumberProps['parser'] =>
  (value) => {
    const rawValue = unitName ? value?.replace(unitName, '') : value;
    return rawValue?.replace(/[^\d]/g, '') as unknown as number;
  };

export function usePurchaseInboundSearchSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: { allowClear: true },
      fieldName: 'inboundNo',
      label: $t('erp.purchaseInbound.inboundNo'),
    },
    {
      component: 'ApiSelect',
      componentProps: {
        allowClear: true,
        api: () =>
          getEnterpriseOptionsApi({ pageSize: 100, roleType: 'SUPPLIER' }),
        labelField: 'enterpriseName',
        resultField: '',
        showSearch: true,
        valueField: 'enterpriseId',
      },
      fieldName: 'supplierId',
      label: $t('erp.purchaseInbound.supplier'),
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
      label: $t('erp.purchaseInbound.warehouse'),
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
      component: 'DatePicker',
      componentProps: { allowClear: true, valueFormat: 'YYYY-MM-DD' },
      fieldName: 'inboundDateFrom',
      label: $t('erp.purchaseInbound.inboundDateFrom'),
    },
    {
      component: 'DatePicker',
      componentProps: { allowClear: true, valueFormat: 'YYYY-MM-DD' },
      fieldName: 'inboundDateTo',
      label: $t('erp.purchaseInbound.inboundDateTo'),
    },
  ];
}

export function usePurchaseInboundFormSchema(): VbenFormSchema<PurchaseInboundFormValues>[] {
  return [
    {
      component: 'DatePicker',
      componentProps: {
        allowClear: false,
        valueFormat: 'YYYY-MM-DD',
      },
      fieldName: 'inboundDate',
      label: $t('erp.purchaseInbound.inboundDate'),
      rules: 'selectRequired',
    },
    {
      component: 'ApiSelect',
      componentProps: {
        api: () =>
          getEnterpriseOptionsApi({ pageSize: 100, roleType: 'SUPPLIER' }),
        labelField: 'enterpriseName',
        resultField: '',
        showSearch: true,
        valueField: 'enterpriseId',
      },
      fieldName: 'supplierId',
      label: $t('erp.purchaseInbound.supplier'),
      rules: 'selectRequired',
    },
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
      label: $t('erp.purchaseInbound.warehouse'),
      rules: 'selectRequired',
    },
    {
      component: 'Textarea',
      componentProps: { maxlength: 512, rows: 3, showCount: true },
      fieldName: 'remark',
      formItemClass: 'md:col-span-2',
      label: $t('erp.purchaseInbound.remark'),
    },
    {
      arrayProps: {
        addButtonText: $t('erp.purchaseInbound.addItem'),
        createRow: () => ({
          batchNo: '',
          expiryDate: undefined,
          packageUnitName: '',
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
            api: getPurchaseInboundSkuOptions,
            labelField: 'skuLabel',
            resultField: '',
            showSearch: true,
            valueField: 'skuId',
          },
          fieldName: 'skuId',
          label: $t('erp.inventory.sku'),
          rules: 'selectRequired',
          dependencies: {
            async trigger(_values, actions, _controller, ctx) {
              if (!ctx?.rowPath) return;
              await actions.setFieldValue(
                `${ctx.rowPath}.packageUnitName`,
                getPurchaseInboundSkuPackageUnitName(ctx.row?.skuId as string),
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
            placeholder: `${$t('erp.inventory.batchNo')} ${(ctx.rowIndex ?? 0) + 1}`,
          }),
          fieldName: 'batchNo',
          label: $t('erp.inventory.batchNo'),
          rules: 'required',
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
          rules: 'required',
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
            triggerFields: ['packageUnitName'],
            resolve: ({ schema }) => {
              const row = schema.row as PurchaseInboundFormItem | undefined;
              const unitName = row?.packageUnitName || '';
              return {
                componentProps: {
                  formatter: quantityFormatter(unitName),
                  parser: quantityParser(unitName),
                },
              };
            },
          },
        },
        {
          component: 'Input',
          componentProps: { maxlength: 512 },
          fieldName: 'remark',
          label: $t('erp.purchaseInbound.itemRemark'),
        },
      ],
      defaultValue: [
        {
          batchNo: '',
          expiryDate: undefined,
          packageUnitName: '',
          quantity: 1,
          remark: '',
          skuId: '',
          unitCost: '',
        },
      ],
      fieldName: 'items',
      formItemClass: 'col-span-1 md:col-span-2',
      label: $t('erp.purchaseInbound.items'),
      rules: 'required',
      type: 'array',
    },
  ];
}

export function usePurchaseInboundColumns(): VxeTableGridOptions<ErpPurchaseInboundApi.PurchaseInboundListItem>['columns'] {
  return [
    {
      field: 'inboundNo',
      fixed: 'left',
      minWidth: 170,
      sortable: true,
      title: $t('erp.purchaseInbound.inboundNo'),
    },
    {
      field: 'inboundDate',
      minWidth: 110,
      sortable: true,
      title: $t('erp.purchaseInbound.inboundDate'),
    },
    {
      field: 'supplierName',
      minWidth: 160,
      showOverflow: 'tooltip',
      sortable: true,
      title: $t('erp.purchaseInbound.supplier'),
    },
    {
      field: 'warehouseName',
      minWidth: 140,
      showOverflow: 'tooltip',
      sortable: true,
      title: $t('erp.purchaseInbound.warehouse'),
    },
    {
      field: 'lineCount',
      minWidth: 90,
      sortable: true,
      title: $t('erp.purchaseInbound.lineCount'),
    },
    {
      field: 'totalAmount',
      formatter: ({ row }) => inventoryAmountLabel(row.totalAmount),
      minWidth: 130,
      title: $t('erp.purchaseInbound.totalAmount'),
    },
    {
      field: 'remark',
      minWidth: 180,
      showOverflow: 'tooltip',
      title: $t('erp.purchaseInbound.remark'),
    },
    {
      field: 'createDate',
      minWidth: 180,
      sortable: true,
      title: $t('erp.purchaseInbound.createDate'),
    },
    {
      align: 'center',
      field: 'operation',
      fixed: 'right',
      showOverflow: false,
      slots: { default: 'action' },
      title: $t('erp.purchaseInbound.operation'),
      width: 110,
    },
  ];
}

export function usePurchaseInboundDetailColumns(): VxeTableGridOptions<ErpPurchaseInboundApi.PurchaseInboundItem>['columns'] {
  return [
    {
      field: 'lineNo',
      minWidth: 70,
      title: $t('erp.purchaseInbound.lineNo'),
    },
    {
      field: 'skuCode',
      minWidth: 130,
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
      field: 'enterpriseName',
      minWidth: 160,
      showOverflow: 'tooltip',
      title: $t('erp.inventory.enterpriseName'),
    },
    {
      field: 'packageSpecName',
      minWidth: 120,
      showOverflow: 'tooltip',
      title: $t('erp.inventory.packageSpecName'),
    },
    {
      field: 'batchNo',
      minWidth: 110,
      title: $t('erp.inventory.batchNo'),
    },
    {
      field: 'expiryDate',
      minWidth: 110,
      title: $t('erp.inventory.expiryDate'),
    },
    {
      field: 'unitCost',
      formatter: ({ row }) => inventoryAmountLabel(row.unitCost),
      minWidth: 110,
      title: $t('erp.inventory.unitCost'),
    },
    {
      field: 'quantity',
      formatter: ({ row }) => `${row.quantity}${row.packageUnitName || ''}`,
      minWidth: 120,
      title: $t('erp.inventory.quantity'),
    },
    {
      field: 'amount',
      formatter: ({ row }) => inventoryAmountLabel(row.amount),
      minWidth: 120,
      title: $t('erp.purchaseInbound.amount'),
    },
    {
      field: 'remark',
      minWidth: 180,
      showOverflow: 'tooltip',
      title: $t('erp.purchaseInbound.itemRemark'),
    },
  ];
}
