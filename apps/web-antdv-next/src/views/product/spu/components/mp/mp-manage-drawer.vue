<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { ProductMpApi, ProductRpApi } from '#/api/product';

import { computed, nextTick, ref } from 'vue';

import { useAccess } from '@vben/access';
import { useVbenDrawer, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, Tag } from 'antdv-next';

import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';
import { getProductMpListApi } from '#/api/product';
import { $t } from '#/locales';

import MpFormModalComponent from './mp-form-modal.vue';
import { useProductMpColumns } from './mp-data';

const { hasAccessByCodes } = useAccess();

const currentRp = ref<ProductRpApi.ProductRp>();
const title = computed(() => $t('product.mp.manageTitle'));

const [MpFormModal, mpFormModalApi] = useVbenModal({
  connectedComponent: MpFormModalComponent,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {},
  gridOptions: {
    columns: useProductMpColumns(),
    height: 'auto',
    proxyConfig: {
      autoLoad: false,
      ajax: {
        query: async () => {
          if (!currentRp.value?.rpId) {
            return { items: [], total: 0 };
          }
          return getProductMpListApi({
            rpId: currentRp.value.rpId,
          });
        },
      },
    },
    rowConfig: { keyField: 'mpId' },
    toolbarConfig: { custom: true, refresh: true, zoom: true },
  } as VxeTableGridOptions<ProductMpApi.ProductMp>,
  showSearchForm: false,
});

const [Drawer, drawerApi] = useVbenDrawer({
  onOpenChange(isOpen) {
    if (!isOpen) return;

    currentRp.value = drawerApi.getData<ProductRpApi.ProductRp>();
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
  if (!currentRp.value) return;
  mpFormModalApi.setData({ rp: currentRp.value }).open();
}

function openEdit(row: ProductMpApi.ProductMp) {
  if (!currentRp.value) return;
  mpFormModalApi.setData({ mp: row, rp: currentRp.value }).open();
}

</script>

<template>
  <Drawer class="w-[1120px]" :title="title">
    <MpFormModal @success="refreshTable" />

    <div v-if="currentRp" class="mb-4 rounded border p-3">
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-base font-medium">{{ currentRp.specName }}</span>
        <Tag>{{ currentRp.rpCode }}</Tag>
        <Tag color="blue">{{ currentRp.productName }}</Tag>
        <Tag :color="currentRp.status === 1 ? 'green' : 'red'">
          {{
            currentRp.status === 1 ? $t('common.enabled') : $t('common.disabled')
          }}
        </Tag>
      </div>
    </div>

    <Grid :table-title="$t('product.mp.list')">
      <template #toolbar-tools>
        <Button
          v-if="hasAccessByCodes(['product:mp:create'])"
          type="primary"
          @click="openCreate"
        >
          <Plus class="size-5" />
          {{ $t('product.mp.create') }}
        </Button>
      </template>
      <template #action="{ row }">
        <VbenTableAction
          :actions="[
            {
              auth: 'product:mp:update',
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
