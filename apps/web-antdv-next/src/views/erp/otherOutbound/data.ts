import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { ErpInventoryApi, ErpOtherOutboundApi } from '#/api/erp';
import type { InputNumberProps } from 'antdv-next';

import { Modal } from 'antdv-next';
import { ref } from 'vue';

import { z } from '#/adapter/form';
import { getInventoryBalanceListApi, getWarehouseOptionsApi } from '#/api/erp';
import { $t } from '#/locales';

import {
  inventoryAmountLabel,
  inventoryUnitCountLabel,
} from '../inventory/data';

export interface OtherOutboundFormItem
  extends ErpOtherOutboundApi.OtherOutboundItemInput {
  batchNo?: string;
  expiryDate?: string;
  enterpriseName?: string;
  packageSpecName?: string;
  packageUnitName?: string;
  packageUnitStock?: string;
  productName?: string;
  skuCode?: string;
  specName?: string;
  unitCost?: string;
}

export interface OtherOutboundFormValues extends Record<string, unknown> {
  items: OtherOutboundFormItem[];
  outboundDate: string;
  remark?: string;
  warehouseId: string;
}

export type OtherOutboundBalanceOption = ErpInventoryApi.InventoryBalance & {
  balanceLabel: string;
};

const activeWarehouseId = ref('');
let balanceOptionsWarehouseId = '';
let balanceOptions: OtherOutboundBalanceOption[] = [];
let balanceOptionsPromise: Promise<OtherOutboundBalanceOption[]> | undefined;

export function createOtherOutboundFormItem(): OtherOutboundFormItem {
  return {
    balanceId: '',
    batchNo: '',
    expiryDate: '',
    enterpriseName: '',
    packageSpecName: '',
    packageUnitName: '',
    packageUnitStock: '',
    productName: '',
    quantity: 1,
    remark: '',
    skuCode: '',
    specName: '',
    unitCost: '',
  };
}

export function setOtherOutboundActiveWarehouse(warehouseId = '') {
  const nextWarehouseId = warehouseId;
  if (nextWarehouseId === activeWarehouseId.value) return;
  activeWarehouseId.value = nextWarehouseId;
  balanceOptionsWarehouseId = '';
  balanceOptions = [];
  balanceOptionsPromise = undefined;
}

export function getOtherOutboundActiveWarehouse() {
  return activeWarehouseId.value;
}

function otherOutboundBalanceOptionLabel(
  option: ErpInventoryApi.InventoryBalance,
) {
  return [
    option.skuCode,
    option.productName,
    option.specName,
    option.packageSpecName,
    option.enterpriseName,
    `${$t('erp.inventory.batchNo')}：${option.batchNo}`,
    `${$t('erp.inventory.expiryDate')}：${option.expiryDate}`,
    inventoryAmountLabel(option.unitCost),
    `${$t('erp.inventory.packageUnitStock')}：${inventoryUnitCountLabel(option.packageUnitCount, option.packageUnitName)}`,
  ]
    .filter(Boolean)
    .join(' / ');
}

export function getOtherOutboundBalanceOptions(): Promise<
  OtherOutboundBalanceOption[]
> {
  if (!activeWarehouseId.value) return Promise.resolve([]);
  if (
    balanceOptionsWarehouseId === activeWarehouseId.value &&
    balanceOptionsPromise
  ) {
    return balanceOptionsPromise;
  }

  const warehouseId = activeWarehouseId.value;
  balanceOptionsWarehouseId = warehouseId;
  balanceOptionsPromise = getInventoryBalanceListApi({
    onlyPositive: true,
    page: 1,
    pageSize: 100,
    warehouseId,
  }).then(({ items }) => {
    const nextOptions = items.map((item) => ({
      ...item,
      balanceLabel: otherOutboundBalanceOptionLabel(item),
    }));
    if (warehouseId === activeWarehouseId.value) {
      balanceOptions = nextOptions;
    }
    return nextOptions;
  });
  return balanceOptionsPromise;
}

function findOtherOutboundBalanceOption(balanceId?: string) {
  if (!balanceId) return undefined;
  return balanceOptions.find((item) => item.balanceId === balanceId);
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

function hasOtherOutboundFormContent(items?: OtherOutboundFormItem[]) {
  return Boolean(
    items?.length &&
    (items.length > 1 ||
      items.some(
        (item) =>
          Boolean(item.balanceId) ||
          Boolean(item.remark?.trim()) ||
          Number(item.quantity || 1) !== 1,
      )),
  );
}

function confirmWarehouseChange() {
  return new Promise<boolean>((resolve) => {
    Modal.confirm({
      content: $t('erp.otherOutbound.warehouseChangeConfirm'),
      onCancel: () => resolve(false),
      onOk: () => resolve(true),
      title: $t('erp.otherOutbound.warehouseChangeTitle'),
    });
  });
}

export function useOtherOutboundSearchSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: { allowClear: true },
      fieldName: 'outboundNo',
      label: $t('erp.otherOutbound.outboundNo'),
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
      label: $t('erp.otherOutbound.warehouse'),
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
      fieldName: 'outboundDateFrom',
      label: $t('erp.otherOutbound.outboundDateFrom'),
    },
    {
      component: 'DatePicker',
      componentProps: { allowClear: true, valueFormat: 'YYYY-MM-DD' },
      fieldName: 'outboundDateTo',
      label: $t('erp.otherOutbound.outboundDateTo'),
    },
  ];
}

export function useOtherOutboundFormSchema(): VbenFormSchema<OtherOutboundFormValues>[] {
  return [
    {
      component: 'DatePicker',
      componentProps: {
        allowClear: false,
        valueFormat: 'YYYY-MM-DD',
      },
      fieldName: 'outboundDate',
      label: $t('erp.otherOutbound.outboundDate'),
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
      dependencies: {
        async trigger(values, actions) {
          const nextWarehouseId = String(values.warehouseId || '');
          const previousWarehouseId = getOtherOutboundActiveWarehouse();
          if (nextWarehouseId === previousWarehouseId) return;

          const items = values.items as OtherOutboundFormItem[] | undefined;
          if (
            previousWarehouseId &&
            hasOtherOutboundFormContent(items) &&
            !(await confirmWarehouseChange())
          ) {
            await actions.setFieldValue(
              'warehouseId',
              previousWarehouseId,
              false,
            );
            return;
          }

          setOtherOutboundActiveWarehouse(nextWarehouseId);
          await actions.setFieldValue(
            'items',
            [createOtherOutboundFormItem()],
            false,
          );
        },
        triggerFields: ['warehouseId'],
      },
      fieldName: 'warehouseId',
      label: $t('erp.otherOutbound.warehouse'),
      rules: 'selectRequired',
    },
    {
      component: 'Textarea',
      componentProps: { maxlength: 500, rows: 3, showCount: true },
      fieldName: 'remark',
      formItemClass: 'md:col-span-2',
      label: $t('erp.otherOutbound.remark'),
    },
    {
      arrayProps: {
        addButtonText: $t('erp.otherOutbound.addItem'),
        createRow: createOtherOutboundFormItem,
        max: 100,
        min: 1,
      },
      children: [
        {
          component: 'ApiSelect',
          componentProps: () => ({
            api: getOtherOutboundBalanceOptions,
            labelField: 'balanceLabel',
            optionFilterProp: 'label',
            params: { warehouseId: activeWarehouseId.value },
            resultField: '',
            showSearch: true,
            valueField: 'balanceId',
          }),
          dependencies: {
            async trigger(_values, actions, _controller, ctx) {
              if (!ctx?.rowPath) return;
              const balance = findOtherOutboundBalanceOption(
                ctx.row?.balanceId as string,
              );
              await actions.setFieldValue(
                `${ctx.rowPath}.batchNo`,
                balance?.batchNo || '',
                false,
              );
              await actions.setFieldValue(
                `${ctx.rowPath}.expiryDate`,
                balance?.expiryDate || '',
                false,
              );
              await actions.setFieldValue(
                `${ctx.rowPath}.enterpriseName`,
                balance?.enterpriseName || '',
                false,
              );
              await actions.setFieldValue(
                `${ctx.rowPath}.packageSpecName`,
                balance?.packageSpecName || '',
                false,
              );
              await actions.setFieldValue(
                `${ctx.rowPath}.packageUnitName`,
                balance?.packageUnitName || '',
                false,
              );
              await actions.setFieldValue(
                `${ctx.rowPath}.packageUnitStock`,
                balance
                  ? inventoryUnitCountLabel(
                      balance.packageUnitCount,
                      balance.packageUnitName,
                    )
                  : '',
                false,
              );
              await actions.setFieldValue(
                `${ctx.rowPath}.productName`,
                balance?.productName || '',
                false,
              );
              await actions.setFieldValue(
                `${ctx.rowPath}.skuCode`,
                balance?.skuCode || '',
                false,
              );
              await actions.setFieldValue(
                `${ctx.rowPath}.specName`,
                balance?.specName || '',
                false,
              );
              await actions.setFieldValue(
                `${ctx.rowPath}.unitCost`,
                balance?.unitCost || '',
                false,
              );
            },
            triggerFields: ['balanceId'],
          },
          fieldName: 'balanceId',
          label: $t('erp.otherOutbound.inventoryBalance'),
          rules: 'selectRequired',
        },
        {
          component: 'Input',
          componentProps: { disabled: true },
          fieldName: 'productName',
          label: $t('erp.inventory.productName'),
        },
        {
          component: 'Input',
          componentProps: { disabled: true },
          fieldName: 'specName',
          label: $t('erp.inventory.specName'),
        },
        {
          component: 'Input',
          componentProps: { disabled: true },
          fieldName: 'packageSpecName',
          label: $t('erp.inventory.packageSpecName'),
        },
        {
          component: 'Input',
          componentProps: { disabled: true },
          fieldName: 'batchNo',
          label: $t('erp.inventory.batchNo'),
        },
        {
          component: 'Input',
          componentProps: { disabled: true },
          fieldName: 'expiryDate',
          label: $t('erp.inventory.expiryDate'),
        },
        {
          component: 'Input',
          componentProps: { disabled: true },
          fieldName: 'unitCost',
          label: $t('erp.inventory.unitCost'),
        },
        {
          component: 'Input',
          componentProps: { disabled: true },
          fieldName: 'packageUnitStock',
          label: $t('erp.otherOutbound.currentStock'),
        },
        {
          component: 'InputNumber',
          componentProps: {
            max: 999_999_999,
            min: 1,
            precision: 0,
            changeOnWheel: true,
          },
          dependencies: {
            triggerFields: ['packageUnitName'],
            resolve: ({ schema }) => {
              const row = schema.row as OtherOutboundFormItem | undefined;
              const unitName = row?.packageUnitName || '';
              return {
                componentProps: {
                  formatter: quantityFormatter(unitName),
                  parser: quantityParser(unitName),
                },
              };
            },
          },
          fieldName: 'quantity',
          label: $t('erp.otherOutbound.quantity'),
          rules: 'required',
        },
        {
          component: 'Input',
          componentProps: { maxlength: 500 },
          fieldName: 'remark',
          label: $t('erp.otherOutbound.itemRemark'),
        },
      ],
      defaultValue: [createOtherOutboundFormItem()],
      fieldName: 'items',
      formItemClass: 'col-span-1 md:col-span-2',
      label: $t('erp.otherOutbound.items'),
      rules: z.array(z.any()).min(1, $t('erp.otherOutbound.itemsRequired')),
      type: 'array',
    },
  ];
}

export function useOtherOutboundColumns(): VxeTableGridOptions<ErpOtherOutboundApi.OtherOutboundListItem>['columns'] {
  return [
    {
      field: 'outboundNo',
      fixed: 'left',
      minWidth: 170,
      sortable: true,
      title: $t('erp.otherOutbound.outboundNo'),
    },
    {
      field: 'outboundDate',
      minWidth: 110,
      sortable: true,
      title: $t('erp.otherOutbound.outboundDate'),
    },
    {
      field: 'warehouseName',
      minWidth: 140,
      showOverflow: 'tooltip',
      sortable: true,
      title: $t('erp.otherOutbound.warehouse'),
    },
    {
      field: 'lineCount',
      minWidth: 90,
      sortable: true,
      title: $t('erp.otherOutbound.lineCount'),
    },
    {
      field: 'remark',
      minWidth: 180,
      showOverflow: 'tooltip',
      title: $t('erp.otherOutbound.remark'),
    },
    {
      field: 'createDate',
      minWidth: 180,
      sortable: true,
      title: $t('erp.otherOutbound.createDate'),
    },
    {
      align: 'center',
      field: 'operation',
      fixed: 'right',
      showOverflow: false,
      slots: { default: 'action' },
      title: $t('erp.otherOutbound.operation'),
      width: 150,
    },
  ];
}

export function useOtherOutboundDetailColumns(): VxeTableGridOptions<ErpOtherOutboundApi.OtherOutboundItem>['columns'] {
  return [
    {
      field: 'lineNo',
      minWidth: 70,
      title: $t('erp.otherOutbound.lineNo'),
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
      formatter: ({ row }) =>
        inventoryUnitCountLabel(row.quantity, row.packageUnitName),
      minWidth: 120,
      title: $t('erp.otherOutbound.quantity'),
    },
    {
      field: 'remark',
      minWidth: 180,
      showOverflow: 'tooltip',
      title: $t('erp.otherOutbound.itemRemark'),
    },
  ];
}
