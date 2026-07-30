import type { VbenFormSchema } from '#/adapter/form';

import { z } from '#/adapter/form';
import { getEnterpriseOptionsApi } from '#/api/base';
import { $t } from '#/locales';

export function useProductMpFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      dependencies: {
        show: () => false,
        triggerFields: ['mpId'],
      },
      fieldName: 'mpId',
      label: 'mpId',
    },
    {
      component: 'ApiSelect',
      componentProps: {
        api: () =>
          getEnterpriseOptionsApi({
            pageSize: 100,
            roleType: 'MANUFACTURER',
          }),
        labelField: 'enterpriseName',
        resultField: '',
        showSearch: true,
        valueField: 'enterpriseId',
      },
      dependencies: {
        show: (values) => !values.mpId,
        triggerFields: ['mpId'],
      },
      fieldName: 'enterpriseId',
      label: $t('product.mp.enterprise'),
      rules: 'selectRequired',
    },
    {
      component: 'Input',
      componentProps: {
        disabled: true,
      },
      dependencies: {
        show: (values) => Boolean(values.mpId),
        triggerFields: ['mpId'],
      },
      fieldName: 'enterpriseDisplay',
      label: $t('product.mp.enterprise'),
    },
    {
      component: 'Input',
      componentProps: { maxlength: 128 },
      fieldName: 'approvalNo',
      label: $t('product.mp.approvalNo'),
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: { maxlength: 128 },
      fieldName: 'brandName',
      label: $t('product.mp.brandName'),
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
      label: $t('product.mp.status'),
    },
    {
      component: 'Textarea',
      componentProps: { maxlength: 2000, rows: 4, showCount: true },
      fieldName: 'description',
      formItemClass: 'md:col-span-2',
      label: $t('product.mp.description'),
      rules: z.string().max(2000).nullish(),
    },
  ];
}
