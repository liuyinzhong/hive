<script lang="ts" setup>
import type { Recordable } from '@vben/types';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { ProductSpuApi } from '#/api/product';

import { useAccess } from '@vben/access';
import { Page } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button } from 'antdv-next';
import { useRouter } from 'vue-router';

import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';
import { getProductSpuListApi } from '#/api/product';
import { $t } from '#/locales';
import { formatSorts } from '#/utils';

import { useProductSpuColumns, useProductSpuSearchSchema } from './data';

const { hasAccessByCodes } = useAccess();
const router = useRouter();

const [Grid] = useVbenVxeGrid({
  formOptions: {
    schema: useProductSpuSearchSchema(),
    showCollapseButton: false,
    wrapperClass: 'sm:grid-cols-2 xl:grid-cols-3',
  },
  gridOptions: {
    columns: useProductSpuColumns(),
    height: 'auto',
    proxyConfig: {
      sort: true,
      ajax: {
        query: async ({ page, sorts }, formValues: Recordable<unknown>) => {
          return getProductSpuListApi({
            ...formValues,
            page: page.currentPage,
            pageSize: page.pageSize,
            sorts: formatSorts(sorts),
          });
        },
      },
    },
    rowConfig: { keyField: 'spuId' },
    sortConfig: { multiple: true, remote: true },
    toolbarConfig: { custom: true, refresh: true, zoom: true },
  } as VxeTableGridOptions<ProductSpuApi.ProductSpu>,
});

function openCreate() {
  router.push('/product/spu/detail/create');
}

function openDetail(row: ProductSpuApi.ProductSpu) {
  router.push(`/product/spu/detail/${row.spuId}`);
}
</script>

<template>
  <Page auto-content-height>
    <Grid :table-title="$t('product.spu.list')">
      <template #toolbar-tools>
        <Button
          v-if="hasAccessByCodes(['product:spu:create'])"
          type="primary"
          @click="openCreate"
        >
          <Plus class="size-5" />
          {{ $t('product.spu.create') }}
        </Button>
      </template>
      <template #action="{ row }">
        <VbenTableAction
          :actions="[
            {
              auth: 'product:spu:detail',
              icon: 'lucide:edit',
              text: $t('common.detail'),
              onClick: () => openDetail(row),
            },
          ]"
          align="center"
        />
      </template>
    </Grid>
  </Page>
</template>
