import type { VbenFormSchema } from '#/adapter/form';

import { markRaw } from 'vue';

import { z } from '#/adapter/form';
import { $t } from '#/locales';

import SkuPackChainField from './sku-pack-chain-field.vue';

export function useProductSkuFormSchema(
  onSpecSourceChange?: () => void,
): VbenFormSchema[] {
  return [
    {
      changeEventFallback: true,
      component: markRaw(SkuPackChainField),
      componentProps: {
        onChange: () => onSpecSourceChange?.(),
      },
      defaultValue: {},
      fieldName: 'packChain',
      formItemClass: 'md:col-span-2',
      label: $t('product.sku.packChain'),
      rules: z
        .object({
          cartonConversion: z.number().optional(),
          cartonUnitName: z.string().optional(),
          minUnitName: z.string().optional(),
          packConversion: z.number().optional(),
          packageUnitName: z.string().optional(),
        })
        .refine(
          (value) =>
            !!value.packConversion &&
            !!value.minUnitName &&
            !!value.packageUnitName &&
            !!value.cartonConversion &&
            !!value.cartonUnitName,
          {
            message: $t('product.sku.packChainRequired'),
          },
        ),
    },
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
          { label: $t('product.sku.traceModeNone'), value: 'NONE' },
          { label: $t('product.sku.traceModeRequired'), value: 'REQUIRED' },
        ],
      },
      defaultValue: 'NONE',
      fieldName: 'traceMode',
      label: $t('product.sku.traceMode'),
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
