import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { ProductSkuApi } from '#/api/product';

import { getEnterpriseOptionsApi } from '#/api/base';
import { $t } from '#/locales';

export function skuPriceTypeOptions() {
  return [
    { label: $t('product.skuPrice.typeRetail'), value: 'RETAIL' },
    { label: $t('product.skuPrice.typePurchase'), value: 'PURCHASE' },
    { label: $t('product.skuPrice.typeAgreement'), value: 'AGREEMENT' },
    { label: $t('product.skuPrice.typeInsurance'), value: 'INSURANCE' },
  ];
}

export function skuPriceScopeOptions() {
  return [
    { label: $t('product.skuPrice.scopeGlobal'), value: 'GLOBAL' },
    { label: $t('product.skuPrice.scopeOrg'), value: 'ORG' },
    { label: $t('product.skuPrice.scopeCustomer'), value: 'CUSTOMER' },
    { label: $t('product.skuPrice.scopeChannel'), value: 'CHANNEL' },
  ];
}

export function skuPriceTypeLabel(value?: string) {
  return (
    skuPriceTypeOptions().find((item) => item.value === value)?.label ||
    value ||
    '-'
  );
}

export function skuPriceScopeLabel(value?: string) {
  return (
    skuPriceScopeOptions().find((item) => item.value === value)?.label ||
    value ||
    '-'
  );
}

export function skuPriceAmountLabel(value?: null | string) {
  const trimmed = String(value || '').trim();
  if (!trimmed) return '¥-';

  const [integer = '0', decimal = ''] = trimmed.split('.');
  return `¥${integer || '0'}.${`${decimal}0000`.slice(0, 4)}`;
}

export function useProductSkuPriceFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Select',
      componentProps: {
        options: skuPriceTypeOptions(),
      },
      fieldName: 'priceType',
      label: $t('product.skuPrice.priceType'),
      rules: 'selectRequired',
    },
    {
      component: 'Select',
      componentProps: {
        options: skuPriceScopeOptions(),
      },
      fieldName: 'scopeType',
      label: $t('product.skuPrice.scopeType'),
      rules: 'selectRequired',
    },
    {
      component: 'ApiSelect',
      componentProps: {
        api: () => getEnterpriseOptionsApi({ pageSize: 100 }),
        labelField: 'enterpriseName',
        resultField: '',
        showSearch: true,
        valueField: 'enterpriseId',
      },
      dependencies: {
        show: (values) => values.scopeType && values.scopeType !== 'GLOBAL',
        triggerFields: ['scopeType'],
      },
      fieldName: 'scopeId',
      label: $t('product.skuPrice.scopeObject'),
      rules: 'selectRequired',
    },
    {
      component: 'InputNumber',
      componentProps: {
        max: 99_999_999_999_999.9999,
        min: 0.0001,
        precision: 4,
        prefix: '¥',
        stringMode: true,
      },
      fieldName: 'price',
      label: $t('product.skuPrice.price'),
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        disabled: true,
        options: [{ label: $t('product.skuPrice.currencyCny'), value: 'CNY' }],
      },
      defaultValue: 'CNY',
      fieldName: 'currencyCode',
      label: $t('product.skuPrice.currencyCode'),
      rules: 'selectRequired',
    },
    {
      component: 'RadioGroup',
      componentProps: {
        options: [
          { label: $t('product.skuPrice.taxIncludedYes'), value: 1 },
          { label: $t('product.skuPrice.taxIncludedNo'), value: 0 },
        ],
      },
      defaultValue: 1,
      fieldName: 'taxIncluded',
      label: $t('product.skuPrice.taxIncluded'),
    },
    {
      component: 'DatePicker',
      componentProps: {
        allowClear: false,
        showTime: true,
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
      },
      fieldName: 'effectiveStart',
      label: $t('product.skuPrice.effectiveStart'),
      rules: 'selectRequired',
    },
    {
      component: 'DatePicker',
      componentProps: {
        allowClear: true,
        showTime: true,
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
      },
      fieldName: 'effectiveEnd',
      label: $t('product.skuPrice.effectiveEnd'),
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
      label: $t('product.skuPrice.status'),
    },
    {
      component: 'Textarea',
      componentProps: { maxlength: 512, rows: 3, showCount: true },
      fieldName: 'remark',
      formItemClass: 'md:col-span-2',
      label: $t('product.skuPrice.remark'),
    },
  ];
}

export function useProductSkuPriceColumns(): VxeTableGridOptions<ProductSkuApi.ProductSkuPrice>['columns'] {
  return [
    {
      field: 'priceType',
      formatter: ({ row }) => skuPriceTypeLabel(row.priceType),
      minWidth: 100,
      title: $t('product.skuPrice.priceType'),
    },
    {
      field: 'scopeType',
      formatter: ({ row }) => skuPriceScopeLabel(row.scopeType),
      minWidth: 100,
      title: $t('product.skuPrice.scopeType'),
    },
    {
      field: 'scopeName',
      formatter: ({ row }) =>
        row.scopeType === 'GLOBAL'
          ? $t('product.skuPrice.scopeGlobal')
          : row.scopeName || row.scopeId || '-',
      minWidth: 150,
      showOverflow: 'tooltip',
      title: $t('product.skuPrice.scopeObject'),
    },
    {
      field: 'price',
      formatter: ({ row }) => skuPriceAmountLabel(row.price),
      minWidth: 110,
      title: $t('product.skuPrice.price'),
    },
    {
      field: 'taxIncluded',
      formatter: ({ row }) =>
        row.taxIncluded === 1
          ? $t('product.skuPrice.taxIncludedYes')
          : $t('product.skuPrice.taxIncludedNo'),
      minWidth: 90,
      title: $t('product.skuPrice.taxIncluded'),
    },
    {
      field: 'effectiveStart',
      minWidth: 170,
      title: $t('product.skuPrice.effectiveStart'),
    },
    {
      field: 'effectiveEnd',
      formatter: ({ row }) =>
        row.effectiveEnd || $t('product.skuPrice.longTerm'),
      minWidth: 170,
      title: $t('product.skuPrice.effectiveEnd'),
    },
    {
      field: 'status',
      slots: { default: 'status' },
      title: $t('product.skuPrice.status'),
      width: 90,
    },
    {
      field: 'remark',
      minWidth: 160,
      showOverflow: 'tooltip',
      title: $t('product.skuPrice.remark'),
    },
    {
      align: 'center',
      field: 'operation',
      fixed: 'right',
      showOverflow: false,
      slots: { default: 'action' },
      title: $t('product.skuPrice.operation'),
      width: 170,
    },
  ];
}
