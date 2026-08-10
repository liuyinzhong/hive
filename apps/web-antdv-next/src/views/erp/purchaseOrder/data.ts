import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { ErpPurchaseOrderApi } from '#/api/erp';
import type { ProductSkuApi } from '#/api/product';
import type { InputNumberProps } from 'antdv-next';

import { getEnterpriseOptionsApi } from '#/api/base';
import { getWarehouseOptionsApi } from '#/api/erp';
import { getProductSkuOptionsApi } from '#/api/product';
import { $t } from '#/locales';

import { inventoryAmountLabel } from '../inventory/data';
import {
  purchaseOrderStatusLabel,
  purchaseOrderStatusValues,
} from './constants';

export interface PurchaseOrderFormItem
  extends ErpPurchaseOrderApi.PurchaseOrderItemInput {
  packageUnitName?: string;
}

export interface PurchaseOrderFormValues extends Record<string, unknown> {
  expectedArrivalDate?: string;
  expectedRowVersion?: number;
  items: PurchaseOrderFormItem[];
  orderDate: string;
  purchaseOrderId?: string;
  remark?: string;
  supplierId: string;
  warehouseId: string;
}

type SkuOption = ProductSkuApi.ProductSkuOption & { skuLabel: string };
let skuOptionsCache: SkuOption[] = [];

function skuOptionLabel(option: ProductSkuApi.ProductSkuOption) {
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

function getSkuOptions() {
  return getProductSkuOptionsApi({ pageSize: 100 }).then(
    (options) =>
      (skuOptionsCache = options.map((option) => ({
        ...option,
        skuLabel: skuOptionLabel(option),
      }))),
  );
}

function getPackageUnitName(skuId?: string) {
  return skuOptionsCache.find((option) => option.skuId === skuId)
    ?.packageUnitName;
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
    return rawValue?.replaceAll(/[^\d]/g, '') as unknown as number;
  };

export function usePurchaseOrderSearchSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: { allowClear: true },
      fieldName: 'purchaseOrderNo',
      label: $t('erp.purchaseOrder.purchaseOrderNo'),
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
      label: $t('erp.purchaseOrder.supplier'),
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
      label: $t('erp.purchaseOrder.warehouse'),
    },
    {
      component: 'Input',
      componentProps: { allowClear: true },
      fieldName: 'skuCode',
      label: $t('erp.inventory.skuCode'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: purchaseOrderStatusValues.map((value) => ({
          label: purchaseOrderStatusLabel(value),
          value,
        })),
      },
      fieldName: 'status',
      label: $t('erp.purchaseOrder.status'),
    },
    {
      component: 'DatePicker',
      componentProps: { allowClear: true, valueFormat: 'YYYY-MM-DD' },
      fieldName: 'orderDateFrom',
      label: $t('erp.purchaseOrder.orderDateFrom'),
    },
    {
      component: 'DatePicker',
      componentProps: { allowClear: true, valueFormat: 'YYYY-MM-DD' },
      fieldName: 'orderDateTo',
      label: $t('erp.purchaseOrder.orderDateTo'),
    },
  ];
}

export function usePurchaseOrderFormSchema(): VbenFormSchema<PurchaseOrderFormValues>[] {
  return [
    {
      component: 'DatePicker',
      componentProps: { allowClear: false, valueFormat: 'YYYY-MM-DD' },
      fieldName: 'orderDate',
      label: $t('erp.purchaseOrder.orderDate'),
      rules: 'selectRequired',
    },
    {
      component: 'DatePicker',
      componentProps: { allowClear: true, valueFormat: 'YYYY-MM-DD' },
      fieldName: 'expectedArrivalDate',
      label: $t('erp.purchaseOrder.expectedArrivalDate'),
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
      label: $t('erp.purchaseOrder.supplier'),
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
      label: $t('erp.purchaseOrder.warehouse'),
      rules: 'selectRequired',
    },
    {
      component: 'Textarea',
      componentProps: { maxlength: 512, rows: 3, showCount: true },
      fieldName: 'remark',
      formItemClass: 'md:col-span-2',
      label: $t('erp.purchaseOrder.remark'),
    },
    {
      arrayProps: {
        addButtonText: $t('erp.purchaseOrder.addItem'),
        createRow: () => ({
          orderedQuantity: 1,
          packageUnitName: '',
          remark: '',
          skuId: '',
          unitPrice: '',
        }),
        max: 100,
        min: 1,
      },
      children: [
        {
          component: 'ApiSelect',
          componentProps: {
            api: getSkuOptions,
            labelField: 'skuLabel',
            resultField: '',
            showSearch: true,
            valueField: 'skuId',
          },
          dependencies: {
            async trigger(_values, actions, _controller, ctx) {
              if (!ctx?.rowPath) return;
              await actions.setFieldValue(
                `${ctx.rowPath}.packageUnitName`,
                getPackageUnitName(ctx.row?.skuId as string) || '',
                false,
              );
            },
            triggerFields: ['skuId'],
          },
          fieldName: 'skuId',
          label: $t('erp.inventory.sku'),
          rules: 'selectRequired',
        },
        {
          component: 'InputNumber',
          componentProps: { max: 999999999, min: 1, precision: 0 },
          dependencies: {
            resolve: ({ schema }) => {
              const row = schema.row as PurchaseOrderFormItem | undefined;
              return {
                componentProps: {
                  formatter: quantityFormatter(row?.packageUnitName),
                  parser: quantityParser(row?.packageUnitName),
                },
              };
            },
            triggerFields: ['packageUnitName'],
          },
          fieldName: 'orderedQuantity',
          label: $t('erp.purchaseOrder.orderedQuantity'),
          rules: 'required',
        },
        {
          component: 'InputNumber',
          componentProps: {
            max: 99999999999999.9999,
            min: 0.0001,
            precision: 4,
            prefix: '¥',
            stringMode: true,
          },
          fieldName: 'unitPrice',
          label: $t('erp.purchaseOrder.unitPrice'),
          rules: 'required',
        },
        {
          component: 'Input',
          componentProps: { maxlength: 512 },
          fieldName: 'remark',
          label: $t('erp.purchaseOrder.itemRemark'),
        },
      ],
      defaultValue: [
        {
          orderedQuantity: 1,
          packageUnitName: '',
          remark: '',
          skuId: '',
          unitPrice: '',
        },
      ],
      fieldName: 'items',
      formItemClass: 'col-span-1 md:col-span-2',
      label: $t('erp.purchaseOrder.items'),
      rules: 'required',
      type: 'array',
    },
  ];
}

export function usePurchaseOrderColumns(): VxeTableGridOptions<ErpPurchaseOrderApi.PurchaseOrderListItem>['columns'] {
  return [
    {
      field: 'purchaseOrderNo',
      fixed: 'left',
      minWidth: 150,
      sortable: true,
      title: $t('erp.purchaseOrder.purchaseOrderNo'),
    },
    {
      field: 'orderDate',
      minWidth: 110,
      sortable: true,
      title: $t('erp.purchaseOrder.orderDate'),
    },
    {
      field: 'supplierName',
      minWidth: 160,
      showOverflow: 'tooltip',
      sortable: true,
      title: $t('erp.purchaseOrder.supplier'),
    },
    {
      field: 'warehouseName',
      minWidth: 140,
      showOverflow: 'tooltip',
      sortable: true,
      title: $t('erp.purchaseOrder.warehouse'),
    },
    {
      field: 'status',
      minWidth: 110,
      slots: { default: 'status' },
      sortable: true,
      title: $t('erp.purchaseOrder.status'),
    },
    {
      field: 'lineCount',
      minWidth: 90,
      sortable: true,
      title: $t('erp.purchaseOrder.lineCount'),
    },
    {
      field: 'totalAmount',
      formatter: ({ row }) => inventoryAmountLabel(row.totalAmount),
      minWidth: 120,
      sortable: true,
      title: $t('erp.purchaseOrder.totalAmount'),
    },
    {
      field: 'expectedArrivalDate',
      minWidth: 120,
      title: $t('erp.purchaseOrder.expectedArrivalDate'),
    },
    {
      field: 'remark',
      minWidth: 160,
      showOverflow: 'tooltip',
      title: $t('erp.purchaseOrder.remark'),
    },
    {
      align: 'center',
      field: 'operation',
      fixed: 'right',
      slots: { default: 'action' },
      title: $t('erp.purchaseOrder.operation'),
      width: 310,
    },
  ];
}

export function usePurchaseOrderDetailColumns(): VxeTableGridOptions<ErpPurchaseOrderApi.PurchaseOrderItem>['columns'] {
  return [
    { field: 'lineNo', minWidth: 70, title: $t('erp.purchaseOrder.lineNo') },
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
      title: $t('erp.inventory.specName'),
    },
    {
      field: 'packageSpecName',
      minWidth: 120,
      title: $t('erp.inventory.packageSpecName'),
    },
    {
      field: 'unitPrice',
      formatter: ({ row }) => inventoryAmountLabel(row.unitPrice),
      minWidth: 110,
      title: $t('erp.purchaseOrder.unitPrice'),
    },
    {
      field: 'orderedQuantity',
      formatter: ({ row }) =>
        `${row.orderedQuantity}${row.packageUnitName || ''}`,
      minWidth: 110,
      title: $t('erp.purchaseOrder.orderedQuantity'),
    },
    {
      field: 'inboundQuantity',
      formatter: ({ row }) =>
        `${row.inboundQuantity}${row.packageUnitName || ''}`,
      minWidth: 110,
      title: $t('erp.purchaseOrder.inboundQuantity'),
    },
    {
      field: 'remainingQuantity',
      formatter: ({ row }) =>
        `${row.remainingQuantity}${row.packageUnitName || ''}`,
      minWidth: 110,
      title: $t('erp.purchaseOrder.remainingQuantity'),
    },
    {
      field: 'amount',
      formatter: ({ row }) => inventoryAmountLabel(row.amount),
      minWidth: 120,
      title: $t('erp.purchaseOrder.amount'),
    },
    {
      field: 'remark',
      minWidth: 160,
      showOverflow: 'tooltip',
      title: $t('erp.purchaseOrder.itemRemark'),
    },
  ];
}
