import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { ErpPurchaseInboundApi, ErpPurchaseOrderApi } from '#/api/erp';
import type { InputNumberProps } from 'antdv-next';

import { markRaw } from 'vue';

import { getEnterpriseOptionsApi } from '#/api/base';
import { getWarehouseOptionsApi } from '#/api/erp';
import { $t } from '#/locales';

import TraceCodeField from '../components/trace-code-field.vue';
import { inventoryAmountLabel } from '../inventory/data';

export interface PurchaseInboundFormItem {
  batchNo: string;
  expiryDate: string;
  packageUnitName?: string;
  purchaseOrderItemId: string;
  quantity: number;
  remainingQuantity?: number;
  remark?: null | string;
  skuId?: string;
  skuLabel?: string;
  traceCodes?: string[];
  traceMode?: 'NONE' | 'REQUIRED';
  unitCost?: string;
}

export interface PurchaseInboundFormValues extends Record<string, unknown> {
  inboundDate: string;
  items: PurchaseInboundFormItem[];
  purchaseOrderId: string;
  remark?: string;
}

let purchaseOrderItemsCache: ErpPurchaseOrderApi.PurchaseOrderItem[] = [];

export function setPurchaseInboundOrderItems(
  items: ErpPurchaseOrderApi.PurchaseOrderItem[],
) {
  purchaseOrderItemsCache = items.filter((item) => item.remainingQuantity > 0);
}

function purchaseOrderItemLabel(item: ErpPurchaseOrderApi.PurchaseOrderItem) {
  return [
    item.skuCode,
    item.productName,
    item.specName,
    item.packageSpecName,
    $t('erp.purchaseOrder.remainingWithUnit', [
      item.remainingQuantity,
      item.packageUnitName,
    ]),
  ]
    .filter(Boolean)
    .join(' / ');
}

function getPurchaseOrderItem(purchaseOrderItemId?: string) {
  return purchaseOrderItemsCache.find(
    (item) => item.purchaseOrderItemId === purchaseOrderItemId,
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
    return rawValue?.replaceAll(/[^\d]/g, '') as unknown as number;
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
      componentProps: { allowClear: true },
      fieldName: 'skuCode',
      label: $t('erp.inventory.skuCode'),
    },
    {
      component: 'Input',
      componentProps: { allowClear: true },
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
      componentProps: { allowClear: false, valueFormat: 'YYYY-MM-DD' },
      fieldName: 'inboundDate',
      label: $t('erp.purchaseInbound.inboundDate'),
      rules: 'selectRequired',
    },
    {
      component: 'Textarea',
      componentProps: { maxlength: 512, rows: 3, showCount: true },
      fieldName: 'remark',
      label: $t('erp.purchaseInbound.remark'),
    },
    {
      arrayProps: {
        addButtonText: $t('erp.purchaseInbound.addItem'),
        createRow: () => ({
          batchNo: '',
          expiryDate: undefined,
          packageUnitName: '',
          purchaseOrderItemId: '',
          quantity: 1,
          remainingQuantity: 0,
          remark: '',
          skuId: '',
          skuLabel: '',
          traceCodes: [],
          traceMode: 'NONE',
          unitCost: '',
        }),
        max: 100,
        min: 1,
      },
      children: [
        {
          component: 'Select',
          componentProps: () => ({
            options: purchaseOrderItemsCache.map((item) => ({
              label: purchaseOrderItemLabel(item),
              value: item.purchaseOrderItemId,
            })),
            showSearch: true,
          }),
          dependencies: {
            async trigger(_values, actions, _controller, ctx) {
              if (!ctx?.rowPath) return;
              const item = getPurchaseOrderItem(
                ctx.row?.purchaseOrderItemId as string,
              );
              const values: Record<string, unknown> = {
                packageUnitName: item?.packageUnitName || '',
                quantity: item?.traceMode === 'REQUIRED' ? 0 : 1,
                remainingQuantity: item?.remainingQuantity || 0,
                skuId: item?.skuId || '',
                skuLabel: item ? purchaseOrderItemLabel(item) : '',
                traceCodes: [],
                traceMode: item?.traceMode || 'NONE',
                unitCost: item?.unitPrice || '',
              };
              for (const [field, value] of Object.entries(values)) {
                await actions.setFieldValue(
                  `${ctx.rowPath}.${field}`,
                  value,
                  false,
                );
              }
            },
            triggerFields: ['purchaseOrderItemId'],
          },
          fieldName: 'purchaseOrderItemId',
          label: $t('erp.purchaseInbound.purchaseOrderItem'),
          rules: 'selectRequired',
        },
        {
          component: 'Input',
          componentProps: { disabled: true },
          fieldName: 'unitCost',
          label: $t('erp.inventory.unitCost'),
        },
        {
          component: 'InputNumber',
          componentProps: { disabled: true, min: 0, precision: 0 },
          dependencies: {
            resolve: ({ schema }) => {
              const row = schema.row as PurchaseInboundFormItem | undefined;
              return {
                componentProps: {
                  disabled: true,
                  formatter: quantityFormatter(row?.packageUnitName),
                  parser: quantityParser(row?.packageUnitName),
                },
              };
            },
            triggerFields: ['packageUnitName'],
          },
          fieldName: 'remainingQuantity',
          label: $t('erp.purchaseOrder.remainingQuantity'),
        },
        {
          component: 'Input',
          componentProps: { maxlength: 64 },
          fieldName: 'batchNo',
          label: $t('erp.inventory.batchNo'),
          rules: 'required',
        },
        {
          component: 'DatePicker',
          componentProps: { allowClear: false, valueFormat: 'YYYY-MM-DD' },
          fieldName: 'expiryDate',
          label: $t('erp.inventory.expiryDate'),
          rules: 'selectRequired',
        },
        {
          changeEventFallback: true,
          component: markRaw(TraceCodeField),
          componentProps: (ctx) => ({
            contextLabel: ctx.row?.skuLabel || '',
            disabled:
              !ctx.row?.purchaseOrderItemId ||
              ctx.row?.traceMode !== 'REQUIRED',
          }),
          defaultValue: [],
          dependencies: {
            async trigger(_values, actions, _controller, ctx) {
              if (!ctx?.rowPath || ctx.row?.traceMode !== 'REQUIRED') return;
              await actions.setFieldValue(
                `${ctx.rowPath}.quantity`,
                Array.isArray(ctx.row?.traceCodes)
                  ? ctx.row.traceCodes.length
                  : 0,
                false,
              );
            },
            triggerFields: ['traceCodes'],
          },
          fieldName: 'traceCodes',
          label: $t('erp.inventory.traceCodes'),
        },
        {
          component: 'InputNumber',
          componentProps: { max: 999999999, min: 1, precision: 0 },
          dependencies: {
            resolve: ({ schema }) => {
              const row = schema.row as PurchaseInboundFormItem | undefined;
              return {
                componentProps: {
                  disabled: row?.traceMode === 'REQUIRED',
                  formatter: quantityFormatter(row?.packageUnitName),
                  max: row?.remainingQuantity || 999999999,
                  parser: quantityParser(row?.packageUnitName),
                },
              };
            },
            triggerFields: [
              'packageUnitName',
              'remainingQuantity',
              'traceMode',
            ],
          },
          fieldName: 'quantity',
          label: $t('erp.inventory.quantity'),
          rules: 'required',
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
          purchaseOrderItemId: '',
          quantity: 1,
          remainingQuantity: 0,
          remark: '',
          skuId: '',
          skuLabel: '',
          traceCodes: [],
          traceMode: 'NONE',
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
      minWidth: 160,
      sortable: true,
      title: $t('erp.purchaseInbound.inboundNo'),
    },
    {
      field: 'purchaseOrderNo',
      minWidth: 150,
      title: $t('erp.purchaseOrder.purchaseOrderNo'),
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
      slots: { default: 'action' },
      title: $t('erp.purchaseInbound.operation'),
      width: 150,
    },
  ];
}

export function usePurchaseInboundDetailColumns(): VxeTableGridOptions<ErpPurchaseInboundApi.PurchaseInboundItem>['columns'] {
  return [
    { field: 'lineNo', minWidth: 70, title: $t('erp.purchaseInbound.lineNo') },
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
