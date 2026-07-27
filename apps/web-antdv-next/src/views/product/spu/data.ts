import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { ProductSpuApi } from '#/api/product';

import { z } from '#/adapter/form';
import { updateProductSpuStatusApi } from '#/api/product';
import { $t } from '#/locales';

export const productTypeOptions = () => [
  { label: $t('product.spu.typeDrug'), value: 'DRUG' },
  { label: $t('product.spu.typeDevice'), value: 'DEVICE' },
  { label: $t('product.spu.typeConsumable'), value: 'CONSUMABLE' },
  { label: $t('product.spu.typeFsmp'), value: 'FSMP' },
  { label: $t('product.spu.typeOther'), value: 'OTHER' },
];

export function productTypeLabel(type?: string) {
  return (
    productTypeOptions().find((item) => item.value === type)?.label ||
    type ||
    '-'
  );
}

export function useProductSpuFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: { maxlength: 128 },
      fieldName: 'productName',
      label: $t('product.spu.productName'),
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: { maxlength: 64 },
      fieldName: 'shortName',
      label: $t('product.spu.shortName'),
      rules: z.string().max(64).optional(),
    },
    {
      component: 'Select',
      componentProps: { options: productTypeOptions() },
      defaultValue: 'DRUG',
      fieldName: 'productType',
      label: $t('product.spu.productType'),
      rules: 'selectRequired',
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
      label: $t('product.spu.status'),
    },
    {
      component: 'Textarea',
      componentProps: { maxlength: 2000, rows: 4, showCount: true },
      fieldName: 'description',
      formItemClass: 'md:col-span-2',
      label: $t('product.spu.description'),
      rules: z.string().max(2000).optional(),
    },
  ];
}

export function useProductSpuSearchSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: $t('product.spu.keyword'),
      },
      fieldName: 'keyword',
      label: $t('product.spu.keywordLabel'),
    },
    {
      component: 'Select',
      componentProps: { allowClear: true, options: productTypeOptions() },
      fieldName: 'productType',
      label: $t('product.spu.productType'),
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
      label: $t('product.spu.status'),
    },
  ];
}

export function useProductSpuColumns(): VxeTableGridOptions<ProductSpuApi.ProductSpu>['columns'] {
  return [
    {
      field: 'spuCode',
      fixed: 'left',
      sortable: true,
      title: $t('product.spu.spuCode'),
      width: 130,
    },
    {
      field: 'productName',
      fixed: 'left',
      minWidth: 180,
      sortable: true,
      title: $t('product.spu.productName'),
    },
    {
      field: 'shortName',
      minWidth: 120,
      title: $t('product.spu.shortName'),
    },
    {
      field: 'productType',
      formatter: ({ cellValue }) => productTypeLabel(cellValue),
      minWidth: 130,
      sortable: true,
      title: $t('product.spu.productType'),
    },
    {
      field: 'description',
      minWidth: 220,
      showOverflow: 'tooltip',
      title: $t('product.spu.description'),
    },
    {
      cellRender: {
        attrs: {
          onChange: async (
            newStatus: 0 | 1,
            row: ProductSpuApi.ProductSpu,
          ) => {
            const updated = await updateProductSpuStatusApi(row.spuId, {
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
      title: $t('product.spu.status'),
      width: 100,
    },
    {
      field: 'updateDate',
      sortable: true,
      title: $t('product.spu.updateDate'),
      width: 180,
    },
    {
      align: 'center',
      field: 'operation',
      fixed: 'right',
      showOverflow: false,
      slots: { default: 'action' },
      title: $t('product.spu.operation'),
      width: 120,
    },
  ];
}
