import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { ProductMpApi } from '#/api/product';

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

export function useProductMpColumns(): VxeTableGridOptions<ProductMpApi.ProductMp>['columns'] {
  return [
    {
      field: 'mpCode',
      fixed: 'left',
      title: $t('product.mp.mpCode'),
      width: 130,
    },
    {
      field: 'enterpriseName',
      fixed: 'left',
      minWidth: 180,
      title: $t('product.mp.enterprise'),
    },
    {
      field: 'approvalNo',
      minWidth: 180,
      title: $t('product.mp.approvalNo'),
    },
    {
      field: 'brandName',
      minWidth: 140,
      title: $t('product.mp.brandName'),
    },
    {
      field: 'description',
      minWidth: 220,
      showOverflow: 'tooltip',
      title: $t('product.mp.description'),
    },
    {
      field: 'status',
      slots: { default: 'status' },
      title: $t('product.mp.status'),
      width: 100,
    },
    {
      field: 'updateDate',
      title: $t('product.mp.updateDate'),
      width: 180,
    },
    {
      align: 'center',
      field: 'operation',
      fixed: 'right',
      showOverflow: false,
      slots: { default: 'action' },
      title: $t('product.mp.operation'),
      width: 120,
    },
  ];
}
