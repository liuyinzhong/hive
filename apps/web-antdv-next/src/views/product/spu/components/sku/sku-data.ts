import type { VbenFormSchema } from '#/adapter/form';

import { z } from '#/adapter/form';
import { getLocalDictList } from '#/dicts';
import { $t } from '#/locales';

export function useProductSkuFormSchema(
  onSpecSourceChange?: () => void,
): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: {
        disabled: true,
      },
      fieldName: 'packageSpecName',
      label: $t('product.sku.packageSpecName'),
    },
    {
      component: 'Input',
      componentProps: {
        disabled: true,
      },
      fieldName: 'cartonSpecName',
      label: $t('product.sku.cartonSpecName'),
    },
    {
      component: 'Input',
      componentProps: {
        disabled: true,
      },
      fieldName: 'fullChainSpecName',
      label: $t('product.sku.fullChainSpecName'),
    },
    {
      component: 'InputNumber',
      componentProps: {
        max: 999_999,
        min: 1,
        onChange: () => onSpecSourceChange?.(),
        precision: 0,
        step: 1,
      },
      fieldName: 'packConversion',
      label: $t('product.sku.packConversion'),
      rules: 'required',
    },
    {
      component: 'ApiSelect',
      componentProps: {
        api: () => getLocalDictList('PRODUCT_MIN_UNIT'),
        onChange: () => onSpecSourceChange?.(),
        showSearch: true,
      },
      fieldName: 'minUnitName',
      label: $t('product.sku.minUnitName'),
      rules: 'selectRequired',
    },
    {
      component: 'ApiSelect',
      componentProps: {
        api: () => getLocalDictList('PRODUCT_PACKAGE_UNIT'),
        onChange: () => onSpecSourceChange?.(),
        showSearch: true,
      },
      fieldName: 'packageUnitName',
      label: $t('product.sku.packageUnitName'),
      rules: 'selectRequired',
    },

    {
      component: 'InputNumber',
      componentProps: {
        max: 999_999,
        min: 1,
        onChange: () => onSpecSourceChange?.(),
        precision: 0,
        step: 1,
      },
      fieldName: 'cartonConversion',
      label: $t('product.sku.cartonConversion'),
      rules: 'required',
    },
    {
      component: 'ApiSelect',
      componentProps: {
        api: () => getLocalDictList('PRODUCT_CARTON_UNIT'),
        onChange: () => onSpecSourceChange?.(),
        showSearch: true,
      },
      fieldName: 'cartonUnitName',
      label: $t('product.sku.cartonUnitName'),
      rules: 'selectRequired',
    },

    {
      component: 'Input',
      componentProps: { maxlength: 64 },
      fieldName: 'barcode',
      label: $t('product.sku.barcode'),
      rules: z.string().max(64).nullish(),
    },
    {
      component: 'Input',
      componentProps: { maxlength: 64 },
      fieldName: 'gtin',
      label: $t('product.sku.gtin'),
      rules: z.string().max(64).nullish(),
    },
    {
      component: 'Input',
      componentProps: { maxlength: 128 },
      fieldName: 'udiDi',
      label: $t('product.sku.udiDi'),
      rules: z.string().max(128).nullish(),
    },
    {
      component: 'RadioGroup',
      componentProps: {
        options: [
          { label: $t('product.sku.allowSplitNo'), value: 0 },
          { label: $t('product.sku.allowSplitYes'), value: 1 },
        ],
      },
      defaultValue: 0,
      fieldName: 'allowSplit',
      label: $t('product.sku.allowSplit'),
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
      label: $t('product.sku.status'),
    },
    {
      component: 'Textarea',
      componentProps: { maxlength: 2000, rows: 4, showCount: true },
      fieldName: 'description',
      formItemClass: 'md:col-span-2',
      label: $t('product.sku.description'),
      rules: z.string().max(2000).nullish(),
    },
  ];
}
