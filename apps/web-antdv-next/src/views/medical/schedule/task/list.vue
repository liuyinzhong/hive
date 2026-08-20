<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { MedicalScheduleApi } from '#/api/medical';

import { Page } from '@vben/common-ui';

import { Empty, Popover, Tag } from 'antdv-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getScheduleAutoTaskListApi } from '#/api/medical';
import { $t } from '#/locales';
import { formatVxeTableSorts } from '#/utils';

import { useTaskColumns, useTaskSearchSchema } from './data';

const [Grid] = useVbenVxeGrid({
  formOptions: {
    schema: useTaskSearchSchema(),
    showCollapseButton: false,
    wrapperClass: 'sm:grid-cols-2 xl:grid-cols-4',
  },
  gridOptions: {
    columns: useTaskColumns(),
    proxyConfig: {
      sort: true,
      ajax: {
        query: async ({ page, sorts }, formValues) =>
          getScheduleAutoTaskListApi({
            ...formValues,
            page: page.currentPage,
            pageSize: page.pageSize,
            sorts: formatVxeTableSorts(sorts),
          }),
      },
    },
    sortConfig: { multiple: true, remote: true },
    toolbarConfig: { custom: true, refresh: true, zoom: true },
  } as VxeTableGridOptions<MedicalScheduleApi.AutoTask>,
});

function statusColor(status: number) {
  return ['success', 'warning', 'error', 'processing'][status] ?? 'default';
}
</script>

<template>
  <Page auto-content-height>
    <Grid :table-title="$t('medical.schedule.taskTitle')">
      <template #status="{ row }">
        <Tag :color="statusColor(row.status)">
          {{ $t(`medical.schedule.taskStatus${row.status}`) }}
        </Tag>
      </template>
      <template #failures="{ row }">
        <span v-if="row.failureDoctorCount === 0">0</span>
        <Popover v-else placement="left">
          <template #content>
            <div class="max-h-72 w-96 space-y-2 overflow-auto">
              <div
                v-for="failure in row.failures"
                :key="failure.doctorId"
                class="rounded border p-2"
              >
                <div class="font-medium">{{ failure.doctorName }}</div>
                <div class="text-sm text-red-500">{{ failure.reason }}</div>
              </div>
              <Empty v-if="row.failures.length === 0" />
            </div>
          </template>
          <a>{{ row.failureDoctorCount }}</a>
        </Popover>
      </template>
    </Grid>
  </Page>
</template>
