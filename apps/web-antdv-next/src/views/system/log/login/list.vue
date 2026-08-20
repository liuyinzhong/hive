<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemLogApi } from '#/api/system';

import { useAccess } from '@vben/access';
import { Page, useVbenDrawer } from '@vben/common-ui';
import { Download } from '@vben/icons';

import { Button, message, Tag } from 'antdv-next';

import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';
import { createLoginLogExportApi, getLoginLogsApi } from '#/api/system';
import { $t } from '#/locales';
import { formatSorts } from '#/utils';

import { useColumns, useSearchSchema } from './data';
import Detail from './detail.vue';

const [DetailDrawer, detailDrawerApi] = useVbenDrawer({
  connectedComponent: Detail,
  destroyOnClose: true,
});

const { hasAccessByCodes } = useAccess();
let currentSorts = '';

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    fieldMappingTime: [['createDate', ['startDate', 'endDate']]],
    schema: useSearchSchema(),
    showCollapseButton: false,
    wrapperClass: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
  },
  gridOptions: {
    columns: useColumns(),
    proxyConfig: {
      sort: true,
      ajax: {
        query: async ({ page, sorts }, formValues) => {
          currentSorts = formatSorts(sorts);
          return getLoginLogsApi({
            ...formValues,
            page: page.currentPage,
            pageSize: page.pageSize,
            sorts: currentSorts,
          });
        },
      },
    },
    rowConfig: { keyField: 'logId' },
    sortConfig: { multiple: true, remote: true },
    toolbarConfig: { custom: true, refresh: true, zoom: true },
  } as VxeTableGridOptions<SystemLogApi.LoginLog>,
});

function openDetail(row: SystemLogApi.LoginLog) {
  detailDrawerApi.setData({ logId: row.logId }).open();
}

async function createExport() {
  const formValues = (await gridApi.formApi.getValues()) as
    SystemLogApi.LoginLogExportRequest;
  await createLoginLogExportApi({
    ...formValues,
    sorts: currentSorts,
  });
  message.success($t('system.log.exportCreated'));
}
</script>

<template>
  <Page auto-content-height>
    <DetailDrawer />
    <Grid :table-title="$t('system.log.loginTitle')">
      <template #toolbar-actions>
        <Button
          v-if="hasAccessByCodes(['system:loginLog:export'])"
          class="mr-2"
          @click="createExport"
        >
          <Download class="size-5" />
          {{ $t('system.log.export') }}
        </Button>
      </template>
      <template #eventType="{ row }">
        <Tag :color="row.eventType === 'login' ? 'blue' : 'default'">
          {{
            $t(
              row.eventType === 'login'
                ? 'system.log.login'
                : 'system.log.logout',
            )
          }}
        </Tag>
      </template>
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
              auth: 'system:loginLog:detail',
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
