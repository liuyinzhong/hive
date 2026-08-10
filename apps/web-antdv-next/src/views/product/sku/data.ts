import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { ProductSkuApi } from '#/api/product';

import { updateProductSkuStatusApi } from '#/api/product';
import { $t } from '#/locales';

import { productTypeLabel, productTypeOptions } from '../spu/data';

export function useProductSkuArchiveSearchSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: { allowClear: true },
      fieldName: 'skuCode',
      label: $t('product.sku.skuCode'),
    },
    {
      component: 'Input',
      componentProps: { allowClear: true },
      fieldName: 'productName',
      label: $t('product.spu.productName'),
    },
    {
      component: 'Input',
      componentProps: { allowClear: true },
      fieldName: 'shortName',
      label: $t('product.spu.shortName'),
    },
    {
      component: 'Input',
      componentProps: { allowClear: true },
      fieldName: 'approvalNo',
      label: $t('product.mp.approvalNo'),
    },
    {
      component: 'Input',
      componentProps: { allowClear: true },
      fieldName: 'enterpriseName',
      label: $t('product.mp.enterprise'),
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
      label: $t('product.sku.status'),
    },
  ];
}

export function useProductSkuArchiveColumns(
  onStatusChanged?: () => void,
): VxeTableGridOptions<ProductSkuApi.ProductSku>['columns'] {
  return [
    {
      field: 'skuCode',
      fixed: 'left',
      minWidth: 130,
      sortable: true,
      title: $t('product.sku.skuCode'),
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
      minWidth: 130,
      sortable: true,
      title: $t('product.spu.shortName'),
    },
    {
      field: 'productType',
      formatter: ({ cellValue }) => productTypeLabel(cellValue),
      minWidth: 120,
      sortable: true,
      title: $t('product.spu.productType'),
    },
    {
      cellRender: {
        name: 'DictTag',
        props: { type: 'PRODUCT_DOSAGE_FORM' },
      },
      field: 'dosageForm',
      minWidth: 120,
      sortable: true,
      title: $t('product.rp.dosageForm'),
    },
    {
      field: 'specName',
      minWidth: 130,
      sortable: true,
      title: $t('product.rp.specName'),
    },
    {
      field: 'enterpriseName',
      minWidth: 180,
      showOverflow: 'tooltip',
      sortable: true,
      title: $t('product.mp.enterprise'),
    },
    {
      field: 'approvalNo',
      minWidth: 180,
      showOverflow: 'tooltip',
      sortable: true,
      title: $t('product.mp.approvalNo'),
    },
    {
      field: 'brandName',
      minWidth: 130,
      showOverflow: 'tooltip',
      sortable: true,
      title: $t('product.mp.brandName'),
    },
    {
      field: 'packageSpecName',
      minWidth: 140,
      sortable: true,
      title: $t('product.sku.packageSpecName'),
    },
    {
      field: 'cartonSpecName',
      minWidth: 150,
      sortable: true,
      title: $t('product.sku.cartonSpecName'),
    },
    {
      field: 'fullChainSpecName',
      minWidth: 190,
      sortable: true,
      title: $t('product.sku.fullChainSpecName'),
    },
    {
      field: 'barcode',
      minWidth: 160,
      sortable: true,
      title: $t('product.sku.barcode'),
    },
    {
      field: 'gtin',
      minWidth: 170,
      sortable: true,
      title: $t('product.sku.gtin'),
    },
    {
      field: 'udiDi',
      minWidth: 180,
      sortable: true,
      title: $t('product.sku.udiDi'),
    },
    {
      field: 'allowSplit',
      formatter: ({ cellValue }) =>
        cellValue === 1
          ? $t('product.sku.allowSplitYes')
          : $t('product.sku.allowSplitNo'),
      minWidth: 110,
      sortable: true,
      title: $t('product.sku.allowSplit'),
    },
    {
      cellRender: {
        attrs: {
          auth: 'product:sku:status',
          onChange: async (
            status: ProductSkuApi.ProductSkuStatus,
            row: ProductSkuApi.ProductSku,
          ) => {
            const updated = await updateProductSkuStatusApi(row.skuId, {
              expectedRowVersion: row.rowVersion,
              status,
            });
            row.rowVersion = updated.rowVersion;
            row.updateDate = updated.updateDate;
            onStatusChanged?.();
          },
        },
        name: 'CellSwitch',
      },
      field: 'status',
      fixed: 'right',
      minWidth: 100,
      sortable: true,
      title: $t('product.sku.status'),
    },
    {
      align: 'center',
      field: 'operation',
      fixed: 'right',
      minWidth: 190,
      showOverflow: false,
      slots: { default: 'action' },
      title: $t('product.sku.operation'),
    },
  ];
}
