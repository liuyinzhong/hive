<script lang="ts" setup>
import type {
  VxeGridListeners,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { ProductSpuApi } from '#/api/product';

import type { DemoSkuRow } from './data';

import { Page } from '@vben/common-ui';

import { tableData } from './data';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { $t } from '#/locales';

type MergeKeyField = 'mpId' | 'rpId' | 'spuId';

const spuFields = new Set([
  'spuCode',
  'productName',
  'shortName',
  'productType',
]);
const rpFields = new Set(['rpCode', 'specName', 'dosageForm', 'strengthText']);
const mpFields = new Set([
  'mpCode',
  'enterpriseName',
  'approvalNo',
  'brandName',
]);
const mergeFieldsByKey: Record<MergeKeyField, string[]> = {
  mpId: [...mpFields],
  rpId: [...rpFields],
  spuId: [...spuFields],
};
const mergeHoverCells = new Set<HTMLTableCellElement>();
const mergeHoverRows = new Set<HTMLTableRowElement>();

const productTypeLabels: Record<ProductSpuApi.ProductType, string> = {
  CONSUMABLE: $t('product.spu.typeConsumable'),
  DEVICE: $t('product.spu.typeDevice'),
  DRUG: $t('product.spu.typeDrug'),
  FSMP: $t('product.spu.typeFsmp'),
  OTHER: $t('product.spu.typeOther'),
};

function getMergeKeyField(field?: string): MergeKeyField | undefined {
  if (!field) return undefined;
  if (spuFields.has(field)) return 'spuId';
  if (rpFields.has(field)) return 'rpId';
  if (mpFields.has(field)) return 'mpId';
  return undefined;
}

function calcRowspan(
  rows: DemoSkuRow[],
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

function clearMergeHoverCells() {
  mergeHoverCells.forEach((cell) => {
    cell.classList.remove('demo-merge-cell--hover');
  });
  mergeHoverCells.clear();
}

function clearMergeHoverRows() {
  mergeHoverRows.forEach((row) => {
    row.classList.remove('demo-merge-row--hover');
  });
  mergeHoverRows.clear();
}

function clearMergeHoverState() {
  clearMergeHoverCells();
  clearMergeHoverRows();
}

function getMergeStartRow(
  rows: DemoSkuRow[],
  rowIndex: number,
  keyField: MergeKeyField,
) {
  let startIndex = rowIndex;
  const currentKey = rows[rowIndex]?.[keyField];
  while (startIndex > 0 && rows[startIndex - 1]?.[keyField] === currentKey) {
    startIndex -= 1;
  }
  return rows[startIndex];
}

function setMergeHoverCells(rows: DemoSkuRow[], rowIndex: number) {
  (Object.keys(mergeFieldsByKey) as MergeKeyField[]).forEach((keyField) => {
    const startRow = getMergeStartRow(rows, rowIndex, keyField);
    mergeFieldsByKey[keyField].forEach((field) => {
      const column = gridApi.grid.getColumnByField(field);
      const cell = column && gridApi.grid.getCellElement(startRow, column);
      if (!cell) return;
      cell.classList.add('demo-merge-cell--hover');
      mergeHoverCells.add(cell);
    });
  });
}

function setMergeHoverRows(
  rows: DemoSkuRow[],
  rowIndex: number,
  keyField: MergeKeyField,
) {
  const skuCodeColumn = gridApi.grid.getColumnByField('skuCode');
  const currentKey = rows[rowIndex]?.[keyField];
  if (!skuCodeColumn || !currentKey) return;

  rows.forEach((row) => {
    if (row[keyField] !== currentKey) return;

    const skuCodeCell = gridApi.grid.getCellElement(row, skuCodeColumn);
    const rowElement = skuCodeCell?.closest('.vxe-body--row');
    if (!(rowElement instanceof HTMLTableRowElement)) return;

    rowElement.classList.add('demo-merge-row--hover');
    mergeHoverRows.add(rowElement);
  });
}

const gridOptions: VxeTableGridOptions<DemoSkuRow> = {
  columns: [
    {
      children: [
        {
          field: 'spuCode',
          minWidth: 130,
          title: $t('product.spu.spuCode'),
        },
        {
          field: 'productName',
          minWidth: 190,
          title: $t('product.spu.productName'),
        },
        {
          field: 'shortName',
          minWidth: 120,
          title: $t('product.spu.shortName'),
        },
        {
          field: 'productType',
          formatter: ({ cellValue }) =>
            productTypeLabels[cellValue as ProductSpuApi.ProductType] ||
            cellValue,
          minWidth: 120,
          title: $t('product.spu.productType'),
        },
      ],
      title: $t('product.spu.title'),
    },
    {
      children: [
        {
          field: 'rpCode',
          minWidth: 130,
          title: $t('product.rp.rpCode'),
        },
        {
          field: 'specName',
          minWidth: 130,
          title: $t('product.rp.specName'),
        },
        {
          field: 'dosageForm',
          minWidth: 120,
          title: $t('product.rp.dosageForm'),
        },
        {
          field: 'strengthText',
          minWidth: 220,
          showOverflow: 'tooltip',
          title: $t('product.rp.strengthText'),
        },
      ],
      title: $t('product.rp.title'),
    },
    {
      children: [
        {
          field: 'mpCode',
          minWidth: 130,
          title: $t('product.mp.mpCode'),
        },
        {
          field: 'enterpriseName',
          minWidth: 190,
          title: $t('product.mp.enterprise'),
        },
        {
          field: 'approvalNo',
          minWidth: 190,
          title: $t('product.mp.approvalNo'),
        },
        {
          field: 'brandName',
          minWidth: 140,
          title: $t('product.mp.brandName'),
        },
      ],
      title: $t('product.mp.title'),
    },
    {
      children: [
        {
          field: 'skuCode',
          minWidth: 130,
          title: $t('product.sku.skuCode'),
        },
        {
          field: 'packageSpecName',
          minWidth: 150,
          title: $t('product.sku.packageSpecName'),
        },
        {
          field: 'packageQuantity',
          minWidth: 110,
          title: $t('product.sku.packageQuantity'),
        },
        {
          field: 'packageUnitName',
          minWidth: 110,
          title: $t('product.sku.packageUnitName'),
        },
        {
          field: 'minUnitName',
          minWidth: 100,
          title: $t('product.sku.minUnitName'),
        },
        {
          field: 'barcode',
          minWidth: 150,
          title: $t('product.sku.barcode'),
        },
        {
          field: 'allowSplit',
          formatter: ({ cellValue }) =>
            cellValue === 1
              ? $t('product.sku.allowSplitYes')
              : $t('product.sku.allowSplitNo'),
          minWidth: 120,
          title: $t('product.sku.allowSplit'),
        },
        {
          field: 'status',
          formatter: ({ cellValue }) =>
            cellValue === 1 ? $t('common.enabled') : $t('common.disabled'),
          minWidth: 100,
          title: $t('product.sku.status'),
        },
      ],
      title: $t('product.sku.title'),
    },
  ],
  pagerConfig: { enabled: false },
  rowConfig: {
    keyField: 'skuId',
    isCurrent: true,
    isHover: true,
  },
  showOverflow: true,
  spanMethod({ column, rowIndex, visibleData }) {
    const keyField = getMergeKeyField(column.field);
    if (!keyField) return undefined;

    const rowspan = calcRowspan(visibleData, rowIndex, keyField);
    return rowspan === 0
      ? { colspan: 0, rowspan: 0 }
      : { colspan: 1, rowspan };
  },
  toolbarConfig: { custom: true, zoom: true },
};

const gridEvents: VxeGridListeners<DemoSkuRow> = {
  cellMouseenter: ({ column, row }) => {
    const rowIndex = tableData.findIndex((item) => item.skuId === row.skuId);
    if (rowIndex === -1) return;

    clearMergeHoverState();
    setMergeHoverCells(tableData, rowIndex);

    const keyField = getMergeKeyField(column.field);
    if (!keyField) return;
    setMergeHoverRows(tableData, rowIndex, keyField);
  },
};

const [Grid, gridApi] = useVbenVxeGrid({
  gridEvents,
  gridOptions,
  tableData,
});
</script>

<template>
  <Page auto-content-height>
    <div class="product-sku-merge-demo h-full" @mouseleave="clearMergeHoverState">
      <Grid :table-title="$t('product.sku.list')" />
    </div>
  </Page>
</template>

<style scoped>
:deep(.demo-merge-row--hover > .vxe-body--column),
:deep(.demo-merge-cell--hover) {
  background-color: var(--vxe-ui-table-row-hover-background-color);
}
</style>

