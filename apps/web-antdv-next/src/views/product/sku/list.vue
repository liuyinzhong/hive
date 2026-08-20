<script lang="ts" setup>
import type { Recordable } from '@vben/types';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { ProductSkuApi } from '#/api/product';

import { useAccess } from '@vben/access';
import { Page, useVbenModal } from '@vben/common-ui';
import { useRouter } from 'vue-router';

import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';
import { getProductSkuListApi } from '#/api/product';
import { $t } from '#/locales';
import { formatVxeTableSorts } from '#/utils';

import SkuFormModalComponent from '../spu/components/sku/sku-form-modal.vue';
import {
  useProductSkuArchiveColumns,
  useProductSkuArchiveSearchSchema,
} from './data';

const router = useRouter();
const { hasAccessByCodes } = useAccess();

const [SkuFormModal, skuFormModalApi] = useVbenModal({
  connectedComponent: SkuFormModalComponent,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid<ProductSkuApi.ProductSku>({
  formOptions: {
    schema: useProductSkuArchiveSearchSchema(),
    showCollapseButton: true,
    wrapperClass: 'sm:grid-cols-2 xl:grid-cols-4',
  },
  gridOptions: {
    columns: useProductSkuArchiveColumns(() => {
      void refreshCurrentPage();
    }),
    height: 'auto',
    proxyConfig: {
      sort: true,
      ajax: {
        query: async ({ page, sorts }, formValues: Recordable<unknown>) => {
          return getProductSkuListApi({
            ...formValues,
            page: page.currentPage,
            pageSize: page.pageSize,
            sorts: formatVxeTableSorts(sorts),
          });
        },
      },
    },
    rowConfig: { keyField: 'skuId' },
    sortConfig: { multiple: true, remote: true },
    toolbarConfig: { custom: true, refresh: true, zoom: true },
  } as VxeTableGridOptions<ProductSkuApi.ProductSku>,
});

async function refreshCurrentPage() {
  const previousPage = gridApi.grid.getProxyInfo()?.pager.currentPage ?? 1;
  await gridApi.query();
  const proxyInfo = gridApi.grid.getProxyInfo();
  if (
    proxyInfo &&
    proxyInfo.data.length === 0 &&
    proxyInfo.pager.total > 0 &&
    proxyInfo.pager.currentPage < previousPage
  ) {
    await gridApi.query();
  }
}

function openEdit(row: ProductSkuApi.ProductSku) {
  skuFormModalApi.setData({ mpId: row.mpId, skuId: row.skuId }).open();
}

function openProduct(row: ProductSkuApi.ProductSku) {
  router.push({
    name: 'productSpuDetail',
    params: { spuId: row.spuId },
  });
}
</script>

<template>
  <Page auto-content-height>
    <SkuFormModal @success="refreshCurrentPage" />

    <Grid :table-title="$t('product.sku.archiveList')">
      <template #action="{ row }">
        <VbenTableAction
          :actions="[
            {
              auth: 'product:sku:update',
              icon: 'lucide:pencil',
              ifShow:
                hasAccessByCodes(['product:sku:update']) &&
                hasAccessByCodes(['product:sku:detail']),
              text: $t('product.sku.edit'),
              onClick: () => openEdit(row),
            },
            {
              auth: 'product:spu:detail',
              icon: 'lucide:external-link',
              text: $t('product.sku.viewProduct'),
              onClick: () => openProduct(row),
            },
          ]"
          align="center"
        />
      </template>
    </Grid>
  </Page>
</template>
