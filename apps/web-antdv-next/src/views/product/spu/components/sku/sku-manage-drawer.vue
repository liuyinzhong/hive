<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { ProductMpApi, ProductSkuApi } from '#/api/product';

import { computed, nextTick, ref } from 'vue';

import { useAccess } from '@vben/access';
import { useVbenDrawer, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, Tag } from 'antdv-next';

import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';
import { getProductSkuListApi } from '#/api/product';
import { $t } from '#/locales';
import { formatSorts } from '#/utils';

import SkuFormModalComponent from './sku-form-modal.vue';
import { useProductSkuColumns } from './sku-data';

const { hasAccessByCodes } = useAccess();

const currentMp = ref<ProductMpApi.ProductMp>();
const title = computed(() => $t('product.sku.manageTitle'));

const [SkuFormModal, skuFormModalApi] = useVbenModal({
  connectedComponent: SkuFormModalComponent,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {},
  gridOptions: {
    columns: useProductSkuColumns(),
    height: 'auto',
    proxyConfig: {
      autoLoad: false,
      sort: true,
      ajax: {
        query: async ({ page, sorts }) => {
          if (!currentMp.value?.mpId) {
            return { items: [], total: 0 };
          }
          return getProductSkuListApi({
            mpId: currentMp.value.mpId,
            page: page.currentPage,
            pageSize: page.pageSize,
            sorts: formatSorts(sorts),
          });
        },
      },
    },
    rowConfig: { keyField: 'skuId' },
    sortConfig: { multiple: true, remote: true },
    toolbarConfig: { custom: true, refresh: true, zoom: true },
  } as VxeTableGridOptions<ProductSkuApi.ProductSku>,
  showSearchForm: false,
});

const [Drawer, drawerApi] = useVbenDrawer({
  onOpenChange(isOpen) {
    if (!isOpen) return;

    currentMp.value = drawerApi.getData<ProductMpApi.ProductMp>();
  },
  async onOpened() {
    await refreshTable();
  },
});

async function refreshTable() {
  await nextTick();
  await gridApi.query();
}

function openCreate() {
  if (!currentMp.value) return;
  skuFormModalApi.setData({ mp: currentMp.value }).open();
}

function openEdit(row: ProductSkuApi.ProductSku) {
  if (!currentMp.value) return;
  skuFormModalApi.setData({ mp: currentMp.value, sku: row }).open();
}
</script>

<template>
  <Drawer class="w-[1280px]" :title="title">
    <SkuFormModal @success="refreshTable" />

    <div v-if="currentMp" class="mb-4 rounded border p-3">
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-base font-medium">
          {{ currentMp.enterpriseName }}
        </span>
        <Tag>{{ currentMp.mpCode }}</Tag>
        <Tag color="blue">{{ currentMp.approvalNo }}</Tag>
        <Tag v-if="currentMp.brandName" color="purple">
          {{ currentMp.brandName }}
        </Tag>
        <Tag :color="currentMp.status === 1 ? 'green' : 'red'">
          {{
            currentMp.status === 1 ? $t('common.enabled') : $t('common.disabled')
          }}
        </Tag>
      </div>
      <div class="mt-2 text-sm text-muted-foreground">
        {{ currentMp.productName }} / {{ currentMp.specName }}
      </div>
    </div>

    <Grid :table-title="$t('product.sku.list')">
      <template #toolbar-tools>
        <Button
          v-if="hasAccessByCodes(['product:sku:create'])"
          type="primary"
          @click="openCreate"
        >
          <Plus class="size-5" />
          {{ $t('product.sku.create') }}
        </Button>
      </template>
      <template #action="{ row }">
        <VbenTableAction
          :actions="[
            {
              auth: 'product:sku:update',
              icon: 'lucide:edit',
              text: $t('common.edit'),
              onClick: () => openEdit(row),
            },
          ]"
          align="center"
        />
      </template>
    </Grid>
  </Drawer>
</template>
