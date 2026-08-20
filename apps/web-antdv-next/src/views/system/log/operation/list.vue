<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemLogApi } from '#/api/system';

import { Page, useVbenDrawer } from '@vben/common-ui';

import { Tag } from 'antdv-next';

import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';
import { getOperationLogsApi } from '#/api/system';
import { $t } from '#/locales';
import { formatVxeTableSorts } from '#/utils';

import { useColumns, useSearchSchema } from './data';
import Detail from './detail.vue';

const [DetailDrawer, detailDrawerApi] = useVbenDrawer({
  connectedComponent: Detail,
  destroyOnClose: true,
});

const [Grid] = useVbenVxeGrid({
  formOptions: {
    fieldMappingTime: [['createDate', ['startDate', 'endDate']]],
    schema: useSearchSchema(),
    wrapperClass: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
  },
  gridOptions: {
    columns: useColumns(),
    proxyConfig: {
      sort: true,
      ajax: {
        query: async ({ page, sorts }, formValues) =>
          getOperationLogsApi({
            ...formValues,
            page: page.currentPage,
            pageSize: page.pageSize,
            sorts: formatVxeTableSorts(sorts),
          }),
      },
    },
    rowConfig: { keyField: 'logId' },
    sortConfig: { multiple: true, remote: true },
    toolbarConfig: { custom: true, refresh: true, zoom: true },
  } as VxeTableGridOptions<SystemLogApi.OperationLog>,
});

function openDetail(row: SystemLogApi.OperationLog) {
  detailDrawerApi.setData({ logId: row.logId }).open();
}
</script>

<template>
  <Page auto-content-height>
    <DetailDrawer />
    <Grid :table-title="$t('system.log.operationTitle')">
      <template #status="{ row }">
        <Tag :color="row.status === 1 ? 'success' : 'error'">
          {{
            $t(row.status === 1 ? 'system.log.success' : 'system.log.failed')
          }}
        </Tag>
      </template>
      <template #action="{ row }">
        <VbenTableAction
          :actions="[
            {
              auth: 'system:operationLog:detail',
              icon: 'lucide:eye',
              onClick: () => openDetail(row),
              text: $t('common.detail'),
            },
          ]"
          align="center"
        />
      </template>
    </Grid>
  </Page>
</template>
