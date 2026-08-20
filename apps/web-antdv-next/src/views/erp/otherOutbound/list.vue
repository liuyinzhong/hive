<script lang="ts" setup>
import type { Recordable } from '@vben/types';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { ErpOtherOutboundApi } from '#/api/erp';

import { useAccess } from '@vben/access';
import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button } from 'antdv-next';

import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';
import { getOtherOutboundListApi } from '#/api/erp';
import { $t } from '#/locales';
import { formatVxeTableSorts } from '#/utils';

import { useOtherOutboundColumns, useOtherOutboundSearchSchema } from './data';
import DetailDrawerComponent from './detail-drawer.vue';
import FormDrawerComponent from './form-drawer.vue';
import MovementDrawerComponent from '../inventory/movement-drawer.vue';

const { hasAccessByCodes } = useAccess();

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: FormDrawerComponent,
  destroyOnClose: true,
});

const [DetailDrawer, detailDrawerApi] = useVbenDrawer({
  connectedComponent: DetailDrawerComponent,
  destroyOnClose: true,
});

const [MovementDrawer, movementDrawerApi] = useVbenDrawer({
  connectedComponent: MovementDrawerComponent,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useOtherOutboundSearchSchema(),
    showCollapseButton: false,
    wrapperClass: 'sm:grid-cols-2 xl:grid-cols-4',
  },
  gridOptions: {
    columns: useOtherOutboundColumns(),
    height: 'auto',
    proxyConfig: {
      sort: true,
      ajax: {
        query: async ({ page, sorts }, formValues: Recordable<unknown>) => {
          return getOtherOutboundListApi({
            ...formValues,
            page: page.currentPage,
            pageSize: page.pageSize,
            sorts: formatVxeTableSorts(sorts),
          });
        },
      },
    },
    rowConfig: { keyField: 'outboundId' },
    sortConfig: { multiple: true, remote: true },
    toolbarConfig: { custom: true, refresh: true, zoom: true },
  } as VxeTableGridOptions<ErpOtherOutboundApi.OtherOutboundListItem>,
});

function openCreate() {
  formDrawerApi.setData({}).open();
}

function openDetail(row: ErpOtherOutboundApi.OtherOutboundListItem) {
  detailDrawerApi.setData({ outboundId: row.outboundId }).open();
}

function openMovements(row: ErpOtherOutboundApi.OtherOutboundListItem) {
  movementDrawerApi
    .setData({
      sourceBillId: row.outboundId,
      sourceBillNo: row.outboundNo,
      sourceBillType: 'OTHER_OUTBOUND',
    })
    .open();
}
</script>

<template>
  <Page auto-content-height>
    <FormDrawer @success="gridApi.query()" />
    <DetailDrawer />
    <MovementDrawer />
    <Grid :table-title="$t('erp.otherOutbound.list')">
      <template #toolbar-tools>
        <Button
          v-if="hasAccessByCodes(['erp:otherOutbound:create'])"
          type="primary"
          @click="openCreate"
        >
          <Plus class="size-5" />
          {{ $t('erp.otherOutbound.create') }}
        </Button>
      </template>
      <template #action="{ row }">
        <VbenTableAction
          :actions="[
            {
              auth: 'erp:otherOutbound:detail',
              icon: 'lucide:eye',
              text: $t('common.detail'),
              onClick: () => openDetail(row),
            },
            {
              auth: 'erp:inventorySourceMovement:list',
              icon: 'lucide:list',
              text: $t('erp.inventory.movement'),
              onClick: () => openMovements(row),
            },
          ]"
          align="center"
        />
      </template>
    </Grid>
  </Page>
</template>
