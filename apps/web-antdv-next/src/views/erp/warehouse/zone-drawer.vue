<script lang="ts" setup>
import type { Recordable } from '@vben/types';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { ErpWarehouseApi } from '#/api/erp';

import { computed, ref } from 'vue';

import { useAccess } from '@vben/access';
import { useVbenDrawer, useVbenModal } from '@vben/common-ui';

import { Button, message } from 'antdv-next';

import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';
import { deleteWarehouseZoneApi, getWarehouseZoneListApi } from '#/api/erp';
import { $t } from '#/locales';
import { formatSorts } from '#/utils/vxe-table';

import { useWarehouseZoneColumns, useWarehouseZoneSearchSchema } from './data';
import LocationDrawerComponent from './location-drawer.vue';
import ZoneFormModalComponent from './zone-form-modal.vue';

const emit = defineEmits<{ success: [] }>();

const { hasAccessByCodes } = useAccess();
const currentWarehouse =
  ref<
    Pick<
      ErpWarehouseApi.Warehouse,
      'warehouseCode' | 'warehouseId' | 'warehouseName'
    >
  >();

const title = computed(() => {
  const warehouseCode = currentWarehouse.value?.warehouseCode || '-';
  const warehouseName = currentWarehouse.value?.warehouseName || '-';
  return `${$t('erp.warehouseZone.manageTitle')}：${warehouseCode} / ${warehouseName}`;
});

const [ZoneFormModal, zoneFormModalApi] = useVbenModal({
  connectedComponent: ZoneFormModalComponent,
  destroyOnClose: true,
});

const [LocationDrawer, locationDrawerApi] = useVbenDrawer({
  connectedComponent: LocationDrawerComponent,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useWarehouseZoneSearchSchema(),
    showCollapseButton: false,
    wrapperClass: 'grid-cols-1 md:grid-cols-2',
  },
  gridOptions: {
    columns: useWarehouseZoneColumns(),
    height: 420,
    proxyConfig: {
      sort: true,
      ajax: {
        query: async ({ page, sorts }, formValues: Recordable<unknown>) => {
          if (!currentWarehouse.value?.warehouseId) {
            return { items: [], total: 0 };
          }
          return getWarehouseZoneListApi(currentWarehouse.value.warehouseId, {
            ...formValues,
            page: page.currentPage,
            pageSize: page.pageSize,
            sorts: formatSorts(sorts),
          });
        },
      },
    },
    rowConfig: { keyField: 'zoneId' },
    sortConfig: { multiple: true, remote: true },
    toolbarConfig: { custom: true, refresh: true, zoom: true },
  } as VxeTableGridOptions<ErpWarehouseApi.WarehouseZone>,
});

const [Drawer, drawerApi] = useVbenDrawer({
  async onOpenChange(isOpen) {
    if (!isOpen) return;
    currentWarehouse.value = drawerApi.getData<ErpWarehouseApi.Warehouse>();
    await gridApi.query();
  },
});

function openCreate() {
  if (!currentWarehouse.value?.warehouseId) return;
  zoneFormModalApi
    .setData({ warehouseId: currentWarehouse.value.warehouseId })
    .open();
}

function openEdit(row: ErpWarehouseApi.WarehouseZone) {
  if (!currentWarehouse.value?.warehouseId) return;
  zoneFormModalApi
    .setData({
      warehouseId: currentWarehouse.value.warehouseId,
      zone: row,
    })
    .open();
}

function openLocations(row: ErpWarehouseApi.WarehouseZone) {
  if (!currentWarehouse.value?.warehouseId) return;
  locationDrawerApi
    .setData({
      warehouse: currentWarehouse.value,
      zone: row,
    })
    .open();
}

async function handleSaved() {
  await gridApi.query();
  emit('success');
}

async function handleLocationSaved() {
  await gridApi.query();
}

async function deleteZone(row: ErpWarehouseApi.WarehouseZone) {
  if (!currentWarehouse.value?.warehouseId) return;
  await deleteWarehouseZoneApi(currentWarehouse.value.warehouseId, row.zoneId, {
    expectedRowVersion: row.rowVersion,
  });
  message.success($t('erp.warehouse.deleteSuccess'));
  await gridApi.query();
  emit('success');
}
</script>

<template>
  <Drawer :footer="false" class="w-[980px]" :title="title">
    <ZoneFormModal @success="handleSaved" />
    <LocationDrawer @success="handleLocationSaved" />
    <Grid :table-title="$t('erp.warehouseZone.list')">
      <template #toolbar-tools>
        <Button
          v-if="hasAccessByCodes(['erp:warehouseZone:create'])"
          type="primary"
          @click="openCreate"
        >
          {{ $t('erp.warehouseZone.create') }}
        </Button>
      </template>
      <template #action="{ row }">
        <VbenTableAction
          :actions="[
            {
              auth: 'erp:warehouseZone:update',
              icon: 'lucide:edit',
              text: $t('common.edit'),
              onClick: () => openEdit(row),
            },
            {
              auth: 'erp:warehouseLocation:list',
              icon: 'lucide:map-pin',
              text: `${$t('erp.warehouseLocation.title')}(${row.locationCount || 0})`,
              onClick: () => openLocations(row),
            },
            {
              auth: 'erp:warehouseZone:delete',
              danger: true,
              icon: 'lucide:trash-2',
              popConfirm: {
                title: $t('erp.warehouseZone.deleteConfirm'),
                confirm: () => deleteZone(row),
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
