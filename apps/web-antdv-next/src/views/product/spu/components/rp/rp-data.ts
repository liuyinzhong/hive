import type { VbenFormSchema } from '#/adapter/form';

import { z } from '#/adapter/form';
import { getLocalDictList } from '#/dicts';
import { $t } from '#/locales';

export function useProductRpFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: { maxlength: 128 },
      fieldName: 'specName',
      label: $t('product.rp.specName'),
      rules: 'required',
    },
    {
      component: 'ApiSelect',
      componentProps: {
        allowClear: true,
        api: () => getLocalDictList('PRODUCT_DOSAGE_FORM'),
        showSearch: true,
      },
      fieldName: 'dosageForm',
      label: $t('product.rp.dosageForm'),
      rules: z.string().max(64).nullish(),
    },
    {
      component: 'Input',
      componentProps: { maxlength: 128 },
      fieldName: 'strengthText',
      label: $t('product.rp.strengthText'),
      rules: z.string().max(128).nullish(),
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
      label: $t('product.rp.status'),
    },
    {
      component: 'Textarea',
      componentProps: { maxlength: 2000, rows: 4, showCount: true },
      fieldName: 'description',
      formItemClass: 'md:col-span-2',
      label: $t('product.rp.description'),
      rules: z.string().max(2000).nullish(),
    },
  ];
}
