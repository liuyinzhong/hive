import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { ProductRpApi } from '#/api/product';

import { z } from '#/adapter/form';
import { updateProductRpStatusApi } from '#/api/product';
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
      component: 'Input',
      componentProps: { maxlength: 64 },
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

export function useProductRpSearchSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: $t('product.rp.keyword'),
      },
      fieldName: 'keyword',
      label: $t('product.rp.keywordLabel'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          { label: $t('common.enabled'), value: 1 },
          { label: $t('common.disabled'), value: 0 },
        ],
      },
      fieldName: 'status',
      label: $t('product.rp.status'),
    },
  ];
}

export function useProductRpColumns(): VxeTableGridOptions<ProductRpApi.ProductRp>['columns'] {
  return [
    {
      field: 'rpCode',
      fixed: 'left',
      sortable: true,
      title: $t('product.rp.rpCode'),
      width: 130,
    },
    {
      field: 'specName',
      fixed: 'left',
      minWidth: 180,
      sortable: true,
      title: $t('product.rp.specName'),
    },
    {
      field: 'dosageForm',
      minWidth: 120,
      title: $t('product.rp.dosageForm'),
    },
    {
      field: 'strengthText',
      minWidth: 140,
      title: $t('product.rp.strengthText'),
    },
    {
      field: 'description',
      minWidth: 220,
      showOverflow: 'tooltip',
      title: $t('product.rp.description'),
    },
    {
      cellRender: {
        attrs: {
          auth: 'product:rp:status',
          onChange: async (
            newStatus: 0 | 1,
            row: ProductRpApi.ProductRp,
          ) => {
            const updated = await updateProductRpStatusApi(row.rpId, {
              expectedRowVersion: row.rowVersion,
              status: newStatus,
            });
            row.rowVersion = updated.rowVersion;
            row.updateDate = updated.updateDate;
          },
        },
        name: 'CellSwitch',
      },
      field: 'status',
      sortable: true,
      title: $t('product.rp.status'),
      width: 100,
    },
    {
      field: 'updateDate',
      sortable: true,
      title: $t('product.rp.updateDate'),
      width: 180,
    },
    {
      align: 'center',
      field: 'operation',
      fixed: 'right',
      showOverflow: false,
      slots: { default: 'action' },
      title: $t('product.rp.operation'),
      width: 180,
    },
  ];
}
