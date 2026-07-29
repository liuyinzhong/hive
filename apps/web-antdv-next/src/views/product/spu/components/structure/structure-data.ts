import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { ProductSpuApi } from '#/api/product';

import { updateProductSkuStatusApi } from '#/api/product';
import { $t } from '#/locales';

export type ProductSpuDetailGridRow = ProductSpuApi.ProductSpuDetailRow & {
  mpOperation?: string;
  rowKey: string;
  rpOperation?: string;
  skuOperation?: string;
};

type MergeKeyField = 'mpId' | 'rpId';

const rpFields = new Set([
  'rpCode',
  'specName',
  'dosageForm',
  'strengthText',
  'rpOperation',
]);
const mpFields = new Set([
  'mpCode',
  'enterpriseName',
  'approvalNo',
  'brandName',
  'mpOperation',
]);

export function getStructureMergeKeyField(
  field?: string,
): MergeKeyField | undefined {
  if (!field) return undefined;
  if (rpFields.has(field)) return 'rpId';
  if (mpFields.has(field)) return 'mpId';
  return undefined;
}

export function calcStructureRowspan(
  rows: ProductSpuDetailGridRow[],
  rowIndex: number,
  keyField: MergeKeyField,
) {
  const currentKey = rows[rowIndex]?.[keyField];
  if (!currentKey) return 1;
  if (rowIndex > 0 && rows[rowIndex - 1]?.[keyField] === currentKey) {
    return 0;
  }

  let rowspan = 1;
  for (let index = rowIndex + 1; index < rows.length; index += 1) {
    if (rows[index]?.[keyField] !== currentKey) break;
    rowspan += 1;
  }
  return rowspan;
}

export function useProductSpuStructureColumns(): VxeTableGridOptions<ProductSpuDetailGridRow>['columns'] {
  return [
    {
      children: [
        {
          field: 'rpCode',
          title: $t('product.rp.rpCode'),
          minWidth: 120,
          slots: { default: 'rpCode' },
        },
        {
          field: 'specName',
          title: $t('product.rp.specName'),
          minWidth: 100,
        },
        {
          field: 'dosageForm',
          title: $t('product.rp.dosageForm'),
          minWidth: 100,
        },
        {
          field: 'strengthText',
          showOverflow: 'tooltip',
          title: $t('product.rp.strengthText'),
          minWidth: 100,
        },
        {
          align: 'center',
          field: 'rpOperation',
          minWidth: 90,
          slots: { default: 'rpAction' },
          title: $t('product.rp.operation'),
        },
      ],
      title: $t('product.rp.title'),
      align: 'center',
    },
    {
      children: [
        {
          field: 'mpCode',
          minWidth: 120,
          title: $t('product.mp.mpCode'),
          slots: { default: 'mpCode' },
        },
        {
          field: 'enterpriseName',
          minWidth: 100,
          showOverflow: 'tooltip',
          title: $t('product.mp.enterprise'),
        },
        {
          field: 'approvalNo',
          minWidth: 100,
          showOverflow: 'tooltip',
          title: $t('product.mp.approvalNo'),
        },
        {
          field: 'brandName',
          minWidth: 100,
          title: $t('product.mp.brandName'),
        },
        {
          align: 'center',
          field: 'mpOperation',
          minWidth: 90,
          slots: { default: 'mpAction' },
          title: $t('product.mp.operation'),
        },
      ],
      title: $t('product.mp.title'),
      align: 'center',
    },
    {
      children: [
        {
          field: 'skuCode',
          minWidth: 100,
          title: $t('product.sku.skuCode'),
        },
        {
          field: 'packageSpecName',
          minWidth: 100,
          title: $t('product.sku.packageSpecName'),
        },
        {
          field: 'packageQuantity',
          minWidth: 70,
          title: $t('product.sku.packageQuantity'),
        },
        {
          field: 'minUnitName',
          minWidth: 70,
          title: $t('product.sku.minUnitName'),
        },
        {
          field: 'packageUnitName',
          minWidth: 70,
          title: $t('product.sku.packageUnitName'),
        },
        {
          field: 'barcode',
          minWidth: 70,
          title: $t('product.sku.barcode'),
          visible: false,
        },
        {
          field: 'gtin',
          minWidth: 70,
          title: $t('product.sku.gtin'),
          visible: false,
        },
        {
          field: 'udiDi',
          minWidth: 70,
          title: $t('product.sku.udiDi'),
          visible: false,
        },
        {
          field: 'allowSplit',
          formatter: ({ cellValue }) => {
            if (cellValue === null || cellValue === undefined) return '-';
            return cellValue === 1
              ? $t('product.sku.allowSplitYes')
              : $t('product.sku.allowSplitNo');
          },
          minWidth: 100,
          title: $t('product.sku.allowSplit'),
        },
        {
          align: 'center',
          cellRender: {
            attrs: {
              auth: 'product:sku:status',
              onChange: async (
                newStatus: 0 | 1,
                row: ProductSpuDetailGridRow,
              ) => {
                if (!row.skuId || !row.skuRowVersion) return;
                const updated = await updateProductSkuStatusApi(row.skuId, {
                  expectedRowVersion: row.skuRowVersion,
                  status: newStatus,
                });
                row.skuRowVersion = updated.rowVersion;
              },
              visible: (row: ProductSpuDetailGridRow) => Boolean(row.skuId),
            },
            name: 'CellSwitch',
          },
          field: 'status',
          minWidth: 100,
          title: $t('product.sku.status'),
          fixed: 'right',
        },
        {
          align: 'center',
          field: 'skuOperation',
          fixed: 'right',
          minWidth: 90,
          slots: { default: 'skuAction' },
          title: $t('product.sku.operation'),
        },
      ],
      title: $t('product.sku.title'),
      align: 'center',
    },
  ];
}
