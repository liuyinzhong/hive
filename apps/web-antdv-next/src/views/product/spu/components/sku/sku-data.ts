import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { ProductSkuApi } from '#/api/product';

import { z } from '#/adapter/form';
import { updateProductSkuStatusApi } from '#/api/product';
import { $t } from '#/locales';

export function useProductSkuFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: { maxlength: 128 },
      fieldName: 'packageSpecName',
      label: $t('product.sku.packageSpecName'),
      rules: 'required',
    },
    {
      component: 'InputNumber',
      componentProps: {
        max: 999_999,
        min: 1,
        precision: 0,
        step: 1,
      },
      fieldName: 'packageQuantity',
      label: $t('product.sku.packageQuantity'),
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: { maxlength: 32 },
      fieldName: 'minUnitName',
      label: $t('product.sku.minUnitName'),
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: { maxlength: 32 },
      fieldName: 'packageUnitName',
      label: $t('product.sku.packageUnitName'),
      rules: 'required',
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

export function useProductSkuColumns(): VxeTableGridOptions<ProductSkuApi.ProductSku>['columns'] {
  return [
    {
      field: 'skuCode',
      fixed: 'left',
      sortable: true,
      title: $t('product.sku.skuCode'),
      width: 130,
    },
    {
      field: 'packageSpecName',
      fixed: 'left',
      minWidth: 160,
      sortable: true,
      title: $t('product.sku.packageSpecName'),
    },
    {
      field: 'packageQuantity',
      minWidth: 110,
      title: $t('product.sku.packageQuantity'),
    },
    {
      field: 'minUnitName',
      minWidth: 100,
      title: $t('product.sku.minUnitName'),
    },
    {
      field: 'packageUnitName',
      minWidth: 100,
      title: $t('product.sku.packageUnitName'),
    },
    {
      field: 'barcode',
      minWidth: 150,
      title: $t('product.sku.barcode'),
    },
    {
      field: 'gtin',
      minWidth: 150,
      title: $t('product.sku.gtin'),
    },
    {
      field: 'udiDi',
      minWidth: 180,
      title: $t('product.sku.udiDi'),
    },
    {
      field: 'allowSplit',
      formatter: ({ cellValue }) =>
        cellValue === 1
          ? $t('product.sku.allowSplitYes')
          : $t('product.sku.allowSplitNo'),
      minWidth: 110,
      title: $t('product.sku.allowSplit'),
    },
    {
      cellRender: {
        attrs: {
          auth: 'product:sku:status',
          onChange: async (newStatus: 0 | 1, row: ProductSkuApi.ProductSku) => {
            const updated = await updateProductSkuStatusApi(row.skuId, {
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
      title: $t('product.sku.status'),
      width: 100,
    },
    {
      field: 'description',
      minWidth: 220,
      showOverflow: 'tooltip',
      title: $t('product.sku.description'),
    },
    {
      field: 'updateDate',
      sortable: true,
      title: $t('product.sku.updateDate'),
      width: 180,
    },
    {
      align: 'center',
      field: 'operation',
      fixed: 'right',
      showOverflow: false,
      slots: { default: 'action' },
      title: $t('product.sku.operation'),
      width: 120,
    },
  ];
}
