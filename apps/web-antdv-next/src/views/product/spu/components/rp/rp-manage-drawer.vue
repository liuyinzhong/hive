<script lang="ts" setup>
import type { Recordable } from '@vben/types';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { ProductRpApi, ProductSpuApi } from '#/api/product';

import { computed, nextTick, ref } from 'vue';

import { useAccess } from '@vben/access';
import { useVbenDrawer, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Modal, Switch, Tag } from 'antdv-next';

import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';
import { getProductRpListApi, updateProductRpStatusApi } from '#/api/product';
import { $t } from '#/locales';
import { formatSorts } from '#/utils';

import { productTypeLabel } from '../../data';
import MpManageDrawerComponent from '../mp/mp-manage-drawer.vue';
import RpFormModalComponent from './rp-form-modal.vue';
import { useProductRpColumns, useProductRpSearchSchema } from './rp-data';

type ProductRpRow = ProductRpApi.ProductRp & {
  __loading_status?: boolean;
};

const { hasAccessByCodes } = useAccess();

const currentSpu = ref<ProductSpuApi.ProductSpu>();
const title = computed(() => $t('product.rp.manageTitle'));

const [RpFormModal, rpFormModalApi] = useVbenModal({
  connectedComponent: RpFormModalComponent,
  destroyOnClose: true,
});

const [MpManageDrawer, mpManageDrawerApi] = useVbenDrawer({
  connectedComponent: MpManageDrawerComponent,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useProductRpSearchSchema(),
    showCollapseButton: false,
    wrapperClass: 'sm:grid-cols-2',
  },
  gridOptions: {
    columns: useProductRpColumns(),
    height: 'auto',
    proxyConfig: {
      autoLoad: false,
      sort: true,
      ajax: {
        query: async ({ page, sorts }, formValues: Recordable<unknown>) => {
          if (!currentSpu.value?.spuId) {
            return { items: [], total: 0 };
          }
          return getProductRpListApi({
            ...formValues,
            page: page.currentPage,
            pageSize: page.pageSize,
            sorts: formatSorts(sorts),
            spuId: currentSpu.value.spuId,
          });
        },
      },
    },
    rowConfig: { keyField: 'rpId' },
    sortConfig: { multiple: true, remote: true },
    toolbarConfig: { custom: true, refresh: true, zoom: true },
  } as VxeTableGridOptions<ProductRpApi.ProductRp>,
});

const [Drawer, drawerApi] = useVbenDrawer({
  onOpenChange(isOpen) {
    if (!isOpen) return;

    currentSpu.value = drawerApi.getData<ProductSpuApi.ProductSpu>();
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
  if (!currentSpu.value) return;
  rpFormModalApi.setData({ spu: currentSpu.value }).open();
}

function openEdit(row: ProductRpApi.ProductRp) {
  if (!currentSpu.value) return;
  rpFormModalApi.setData({ rp: row, spu: currentSpu.value }).open();
}

function openMpManage(row: ProductRpApi.ProductRp) {
  mpManageDrawerApi.setData(row).open();
}

function confirmStatusChange(newStatus: 0 | 1) {
  const statusText =
    newStatus === 1 ? $t('common.enabled') : $t('common.disabled');
  return new Promise<boolean>((resolve) => {
    Modal.confirm({
      content: $t('ui.actionMessage.statusChangeConfirm', [statusText]),
      onCancel: () => resolve(false),
      onOk: () => resolve(true),
    });
  });
}

function getStatusLoading(row: ProductRpApi.ProductRp) {
  return Boolean((row as ProductRpRow).__loading_status);
}

function setStatusLoading(row: ProductRpApi.ProductRp, loading: boolean) {
  (row as ProductRpRow).__loading_status = loading;
}

async function handleStatusChange(value: unknown, row: ProductRpApi.ProductRp) {
  const newStatus: 0 | 1 = value === 1 ? 1 : 0;
  if (!(await confirmStatusChange(newStatus))) return;

  setStatusLoading(row, true);
  try {
    const updated = await updateProductRpStatusApi(row.rpId, {
      expectedRowVersion: row.rowVersion,
      status: newStatus,
    });
    row.status = newStatus;
    row.rowVersion = updated.rowVersion;
    row.updateDate = updated.updateDate;
    message.success($t('ui.actionMessage.operationSuccess'));
  } catch {
    // 接口错误提示由统一请求拦截器处理。
  } finally {
    setStatusLoading(row, false);
  }
}
</script>

<template>
  <Drawer class="w-[1120px]" :title="title">
    <RpFormModal @success="refreshTable" />
    <MpManageDrawer />

    <div v-if="currentSpu" class="mb-4 rounded border p-3">
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-base font-medium">{{ currentSpu.productName }}</span>
        <Tag>{{ currentSpu.spuCode }}</Tag>
        <Tag color="blue">{{ productTypeLabel(currentSpu.productType) }}</Tag>
        <Tag :color="currentSpu.status === 1 ? 'green' : 'red'">
          {{
            currentSpu.status === 1 ? $t('common.enabled') : $t('common.disabled')
          }}
        </Tag>
      </div>
    </div>

    <Grid :table-title="$t('product.rp.list')">
      <template #toolbar-tools>
        <Button
          v-if="hasAccessByCodes(['product:rp:create'])"
          type="primary"
          @click="openCreate"
        >
          <Plus class="size-5" />
          {{ $t('product.rp.create') }}
        </Button>
      </template>
      <template #status="{ row }">
        <Switch
          :checked="row.status"
          :checked-children="$t('common.enabled')"
          :checked-value="1"
          :disabled="!hasAccessByCodes(['product:rp:status'])"
          :loading="getStatusLoading(row)"
          :un-checked-children="$t('common.disabled')"
          :un-checked-value="0"
          @update:checked="(value) => handleStatusChange(value, row)"
        />
      </template>
      <template #action="{ row }">
        <VbenTableAction
          :actions="[
            {
              auth: 'product:mp:list',
              icon: 'lucide:factory',
              text: $t('product.mp.title'),
              onClick: () => openMpManage(row),
            },
            {
              auth: 'product:rp:update',
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
