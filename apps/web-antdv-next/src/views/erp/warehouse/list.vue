<script lang="ts" setup>
import type { Recordable } from '@vben/types';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { ErpWarehouseApi } from '#/api/erp';

import { useAccess } from '@vben/access';
import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message } from 'antdv-next';

import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';
import { deleteWarehouseApi, getWarehouseListApi } from '#/api/erp';
import { $t } from '#/locales';
import { formatVxeTableSorts } from '#/utils';

import { useWarehouseColumns, useWarehouseSearchSchema } from './data';
import FormModalComponent from './form-modal.vue';
import ZoneDrawerComponent from './zone-drawer.vue';

const { hasAccessByCodes } = useAccess();

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: FormModalComponent,
  destroyOnClose: true,
});

const [ZoneDrawer, zoneDrawerApi] = useVbenDrawer({
  connectedComponent: ZoneDrawerComponent,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useWarehouseSearchSchema(),
    showCollapseButton: false,
    wrapperClass: 'sm:grid-cols-2 xl:grid-cols-4',
  },
  gridOptions: {
    columns: useWarehouseColumns(),
    height: 'auto',
    proxyConfig: {
      sort: true,
      ajax: {
        query: async ({ page, sorts }, formValues: Recordable<unknown>) => {
          return getWarehouseListApi({
            ...formValues,
            page: page.currentPage,
            pageSize: page.pageSize,
            sorts: formatVxeTableSorts(sorts),
          });
        },
      },
    },
    rowConfig: { keyField: 'warehouseId' },
    sortConfig: { multiple: true, remote: true },
    toolbarConfig: { custom: true, refresh: true, zoom: true },
  } as VxeTableGridOptions<ErpWarehouseApi.Warehouse>,
});

function openCreate() {
  formModalApi.setData({}).open();
}

function openEdit(row: ErpWarehouseApi.Warehouse) {
  formModalApi
    .setData({
      rowVersion: row.rowVersion,
      warehouseId: row.warehouseId,
    })
    .open();
}

function openZones(row: ErpWarehouseApi.Warehouse) {
  zoneDrawerApi.setData(row).open();
}

async function deleteWarehouse(row: ErpWarehouseApi.Warehouse) {
  await deleteWarehouseApi(row.warehouseId, {
    expectedRowVersion: row.rowVersion,
  });
  message.success($t('erp.warehouse.deleteSuccess'));
  await gridApi.query();
}
</script>

<template>
  <Page auto-content-height>
    <FormModal @success="gridApi.query()" />
    <ZoneDrawer @success="gridApi.query()" />
    <Grid :table-title="$t('erp.warehouse.list')">
      <template #toolbar-tools>
        <Button
          v-if="hasAccessByCodes(['erp:warehouse:create'])"
          type="primary"
          @click="openCreate"
        >
          <Plus class="size-5" />
          {{ $t('erp.warehouse.create') }}
        </Button>
      </template>
      <template #action="{ row }">
        <VbenTableAction
          :actions="[
            {
              auth: 'erp:warehouse:update',
              icon: 'lucide:edit',
              text: $t('common.edit'),
              onClick: () => openEdit(row),
            },
            {
              auth: 'erp:warehouseZone:list',
              icon: 'lucide:layout-grid',
              text: `${$t('erp.warehouseZone.title')}(${row.zoneCount || 0})`,
              onClick: () => openZones(row),
            },
            {
              auth: 'erp:warehouse:delete',
              danger: true,
              icon: 'lucide:trash-2',
              popConfirm: {
                title: $t('erp.warehouse.deleteConfirm'),
                confirm: () => deleteWarehouse(row),
              },
              text: $t('common.delete'),
            },
          ]"
          align="center"
        />
      </template>
    </Grid>
  </Page>
</template>
