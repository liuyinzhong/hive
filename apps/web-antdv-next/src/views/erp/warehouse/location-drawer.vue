<script lang="ts" setup>
import type { Recordable } from '@vben/types';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { ErpWarehouseApi } from '#/api/erp';

import { computed, ref } from 'vue';

import { useAccess } from '@vben/access';
import { useVbenDrawer, useVbenModal } from '@vben/common-ui';

import { Button, message } from 'antdv-next';

import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';
import {
  deleteWarehouseLocationApi,
  getWarehouseLocationListApi,
} from '#/api/erp';
import { $t } from '#/locales';
import { formatSorts } from '#/utils';

import {
  useWarehouseLocationColumns,
  useWarehouseLocationSearchSchema,
} from './data';
import LocationFormModalComponent from './location-form-modal.vue';

interface DrawerData {
  warehouse: Pick<
    ErpWarehouseApi.Warehouse,
    'warehouseCode' | 'warehouseId' | 'warehouseName'
  >;
  zone: Pick<
    ErpWarehouseApi.WarehouseZone,
    'zoneCode' | 'zoneId' | 'zoneName'
  >;
}

const emit = defineEmits<{ success: [] }>();

const { hasAccessByCodes } = useAccess();
const currentWarehouse = ref<DrawerData['warehouse']>();
const currentZone = ref<DrawerData['zone']>();

const title = computed(() => {
  const warehouseName = currentWarehouse.value?.warehouseName || '-';
  const zoneName = currentZone.value?.zoneName || '-';
  return `${$t('erp.warehouseLocation.manageTitle')}：${warehouseName} / ${zoneName}`;
});

const [LocationFormModal, locationFormModalApi] = useVbenModal({
  connectedComponent: LocationFormModalComponent,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useWarehouseLocationSearchSchema(),
    showCollapseButton: false,
    wrapperClass: 'grid-cols-1',
  },
  gridOptions: {
    columns: useWarehouseLocationColumns(),
    height: 420,
    proxyConfig: {
      sort: true,
      ajax: {
        query: async ({ page, sorts }, formValues: Recordable<unknown>) => {
          if (!currentWarehouse.value?.warehouseId || !currentZone.value?.zoneId) {
            return { items: [], total: 0 };
          }
          return getWarehouseLocationListApi(
            currentWarehouse.value.warehouseId,
            currentZone.value.zoneId,
            {
              ...formValues,
              page: page.currentPage,
              pageSize: page.pageSize,
              sorts: formatSorts(sorts),
            },
          );
        },
      },
    },
    rowConfig: { keyField: 'locationId' },
    sortConfig: { multiple: true, remote: true },
    toolbarConfig: { custom: true, refresh: true, zoom: true },
  } as VxeTableGridOptions<ErpWarehouseApi.WarehouseLocation>,
});

const [Drawer, drawerApi] = useVbenDrawer({
  async onOpenChange(isOpen) {
    if (!isOpen) return;
    const data = drawerApi.getData<DrawerData>();
    currentWarehouse.value = data.warehouse;
    currentZone.value = data.zone;
    await gridApi.query();
  },
});

function openCreate() {
  if (!currentWarehouse.value?.warehouseId || !currentZone.value?.zoneId) return;
  locationFormModalApi
    .setData({
      warehouseId: currentWarehouse.value.warehouseId,
      zoneId: currentZone.value.zoneId,
    })
    .open();
}

function openEdit(row: ErpWarehouseApi.WarehouseLocation) {
  if (!currentWarehouse.value?.warehouseId || !currentZone.value?.zoneId) return;
  locationFormModalApi
    .setData({
      location: row,
      warehouseId: currentWarehouse.value.warehouseId,
      zoneId: currentZone.value.zoneId,
    })
    .open();
}

async function handleSaved() {
  await gridApi.query();
  emit('success');
}

async function deleteLocation(row: ErpWarehouseApi.WarehouseLocation) {
  if (!currentWarehouse.value?.warehouseId || !currentZone.value?.zoneId) return;
  await deleteWarehouseLocationApi(
    currentWarehouse.value.warehouseId,
    currentZone.value.zoneId,
    row.locationId,
    {
      expectedRowVersion: row.rowVersion,
    },
  );
  message.success($t('erp.warehouse.deleteSuccess'));
  await gridApi.query();
  emit('success');
}
</script>

<template>
  <Drawer :footer="false" class="w-[920px]" :title="title">
    <LocationFormModal @success="handleSaved" />
    <Grid :table-title="$t('erp.warehouseLocation.list')">
      <template #toolbar-tools>
        <Button
          v-if="hasAccessByCodes(['erp:warehouseLocation:create'])"
          type="primary"
          @click="openCreate"
        >
          {{ $t('erp.warehouseLocation.create') }}
        </Button>
      </template>
      <template #action="{ row }">
        <VbenTableAction
          :actions="[
            {
              auth: 'erp:warehouseLocation:update',
              icon: 'lucide:edit',
              text: $t('common.edit'),
              onClick: () => openEdit(row),
            },
            {
              auth: 'erp:warehouseLocation:delete',
              danger: true,
              icon: 'lucide:trash-2',
              popConfirm: {
                title: $t('erp.warehouseLocation.deleteConfirm'),
                confirm: () => deleteLocation(row),
              },
              text: $t('common.delete'),
            },
          ]"
          align="center"
        />
      </template>
    </Grid>
  </Drawer>
</template>
