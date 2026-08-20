<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemLogApi } from '#/api/system';

import { useAccess } from '@vben/access';
import { Page, useVbenDrawer } from '@vben/common-ui';

import { Tag } from 'antdv-next';

import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';
import { getLoginLogsApi } from '#/api/system';
import { $t } from '#/locales';
import { formatVxeTableSorts } from '#/utils';

import { createExport, useColumns, useSearchSchema } from './data';
import Detail from './detail.vue';

const [DetailDrawer, detailDrawerApi] = useVbenDrawer({
  connectedComponent: Detail,
  destroyOnClose: true,
});

const { hasAccessByCodes } = useAccess();

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
          return getLoginLogsApi({
            ...formValues,
            page: page.currentPage,
            pageSize: page.pageSize,
            sorts: formatVxeTableSorts(sorts),
          });
        },
      },
    },
    rowConfig: { keyField: 'logId' },
    sortConfig: { multiple: true, remote: true },
    toolbarConfig: {
      custom: true,
      export: hasAccessByCodes(['system:loginLog:export']),
      refresh: true,
      zoom: true,
    },
    exportConfig: {
      exportMethod: async (exportOptions: any) => {
        const formValues = await gridApi.formApi.getValues();
        await createExport(formValues, exportOptions);
      },
    },
  } as VxeTableGridOptions<SystemLogApi.LoginLog>,
});

function openDetail(row: SystemLogApi.LoginLog) {
  detailDrawerApi.setData({ logId: row.logId }).open();
}

</script>

<template>
  <Page auto-content-height>
    <DetailDrawer />
    <Grid :table-title="$t('system.log.loginTitle')">
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
