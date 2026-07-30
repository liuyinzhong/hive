<script lang="ts" setup>
import type { ProductSkuApi } from '#/api/product';
import type { ProductSpuDetailGridRow } from '../structure/structure-data';

import { computed, ref } from 'vue';

import { useAccess } from '@vben/access';
import { useVbenDrawer, useVbenModal } from '@vben/common-ui';

import { Button, message } from 'antdv-next';

import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';
import {
  deleteProductSkuPriceApi,
  getProductSkuPriceListApi,
} from '#/api/product';
import { $t } from '#/locales';

import { useProductSkuPriceColumns } from './sku-price-data';
import SkuPriceFormModalComponent from './sku-price-form-modal.vue';

const emit = defineEmits<{
  success: [];
}>();

const { hasAccessByCodes } = useAccess();

const currentSku =
  ref<Pick<ProductSpuDetailGridRow, 'packageSpecName' | 'skuCode' | 'skuId'>>();
const loading = ref(false);

const title = computed(() => {
  const skuCode = currentSku.value?.skuCode || '-';
  const packageSpecName = currentSku.value?.packageSpecName || '-';
  return `${$t('product.skuPrice.manageTitle')}：${skuCode} / ${packageSpecName}`;
});

const [Grid, gridApi] = useVbenVxeGrid<ProductSkuApi.ProductSkuPrice>({
  gridOptions: {
    columns: useProductSkuPriceColumns(),
    height: 320,
    pagerConfig: { enabled: false },
    rowConfig: {
      isHover: true,
      keyField: 'priceId',
    },
    showOverflow: true,
    toolbarConfig: { custom: true, zoom: true },
  },
  tableData: [],
});

const [Drawer, drawerApi] = useVbenDrawer({
  async onOpenChange(isOpen) {
    if (!isOpen) return;
    const data = drawerApi.getData<ProductSpuDetailGridRow>();
    currentSku.value = {
      packageSpecName: data.packageSpecName,
      skuCode: data.skuCode,
      skuId: data.skuId,
    };
    await loadPrices();
  },
});

const [SkuPriceFormModal, skuPriceFormModalApi] = useVbenModal({
  connectedComponent: SkuPriceFormModalComponent,
  destroyOnClose: true,
});

async function loadPrices() {
  if (!currentSku.value?.skuId) return;
  loading.value = true;
  try {
    const prices = await getProductSkuPriceListApi(currentSku.value.skuId);
    await gridApi.grid?.loadData?.(prices);
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  if (!currentSku.value?.skuId) return;
  skuPriceFormModalApi.setData({ skuId: currentSku.value.skuId }).open();
}

function openEdit(row: ProductSkuApi.ProductSkuPrice) {
  if (!currentSku.value?.skuId) return;
  skuPriceFormModalApi
    .setData({ price: row, skuId: currentSku.value.skuId })
    .open();
}

async function handlePriceSaved() {
  await loadPrices();
  emit('success');
}

async function deletePrice(row: ProductSkuApi.ProductSkuPrice) {
  if (!currentSku.value?.skuId) return;
  await deleteProductSkuPriceApi(currentSku.value.skuId, row.priceId, {
    expectedRowVersion: row.rowVersion,
  });
  message.success($t('product.skuPrice.deleteSuccess'));
  await loadPrices();
  emit('success');
}
</script>

<template>
  <Drawer :footer="false" class="w-[980px]" :title="title">
    <SkuPriceFormModal @success="handlePriceSaved" />
    <div class="space-y-4">
      <Grid :loading="loading" :table-title="$t('product.skuPrice.list')">
        <template #toolbar-tools>
          <Button
            v-if="hasAccessByCodes(['product:skuPrice:create'])"
            type="primary"
            @click="openCreate"
          >
            {{ $t('product.skuPrice.create') }}
          </Button>
        </template>
        <template #action="{ row }">
          <VbenTableAction
            :actions="[
              {
                auth: 'product:skuPrice:update',
                icon: 'lucide:edit',
                text: $t('common.edit'),
                onClick: () => openEdit(row),
              },
              {
                auth: 'product:skuPrice:delete',
                icon: 'lucide:trash-2',
                text: $t('common.delete'),
                danger: true,
                popConfirm: {
                  title: $t('product.skuPrice.deleteConfirm'),
                  confirm: () => deletePrice(row),
                },
              },
            ]"
            align="center"
          />
        </template>
      </Grid>
    </div>
  </Drawer>
</template>
