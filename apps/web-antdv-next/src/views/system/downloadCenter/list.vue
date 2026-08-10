<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemDownloadApi } from '#/api/system';

import { onBeforeUnmount, watch } from 'vue';

import { Page } from '@vben/common-ui';
import { downloadFileFromBlob } from '@vben/utils';

import { Alert, Button, message, Progress, Tag } from 'antdv-next';
import dayjs from 'dayjs';
import { storeToRefs } from 'pinia';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { downloadTaskFileApi, getDownloadTaskListApi } from '#/api/system';
import { $t } from '#/locales';
import { useMenuMessageStore } from '#/store/menu-message';

import { useColumns, useSearchSchema } from './data';

const menuMessageStore = useMenuMessageStore();
const { downloadTaskRevision } = storeToRefs(menuMessageStore);

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    fieldMappingTime: [
      ['createDate', ['createDateStart', 'createDateEnd']],
    ],
    schema: useSearchSchema(),
    showCollapseButton: false,
    wrapperClass: 'sm:grid-cols-2 lg:grid-cols-3',
  },
  gridOptions: {
    columns: useColumns(),
    height: 'auto',
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) =>
          getDownloadTaskListApi({
            ...formValues,
            page: page.currentPage,
            pageSize: page.pageSize,
          }),
      },
    },
    rowConfig: { keyField: 'id' },
    toolbarConfig: { custom: true, refresh: true, zoom: true },
  } as VxeTableGridOptions<SystemDownloadApi.DownloadTask>,
});

let refreshTimer: number | undefined;
watch(downloadTaskRevision, () => {
  window.clearTimeout(refreshTimer);
  refreshTimer = window.setTimeout(() => gridApi.query(), 300);
});
onBeforeUnmount(() => window.clearTimeout(refreshTimer));

function statusColor(status: SystemDownloadApi.TaskStatus) {
  return {
    failed: 'error',
    pending: 'default',
    running: 'processing',
    succeeded: 'success',
  }[status];
}

function statusText(status: SystemDownloadApi.TaskStatus) {
  return $t(`system.downloadCenter.${status}`);
}

function formatFileSize(size: number) {
  if (!size) return '-';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function canDownload(row: SystemDownloadApi.DownloadTask) {
  return (
    row.status === 'succeeded' &&
    !!row.fileName &&
    !!row.expireDate &&
    dayjs(row.expireDate).isAfter(dayjs())
  );
}

async function downloadFile(row: SystemDownloadApi.DownloadTask) {
  const hideLoading = message.loading({
    content: $t('system.downloadCenter.downloading'),
    duration: 0,
  });
  try {
    const blob = await downloadTaskFileApi(row.id);
    downloadFileFromBlob({
      fileName: row.fileName || `${row.taskName}.xlsx`,
      source: blob,
    });
  } finally {
    hideLoading();
  }
}
</script>

<template>
  <Page auto-content-height>
    <Alert
      class="mb-4"
      :message="$t('system.downloadCenter.retentionHelp')"
      show-icon
      type="info"
    />
    <Grid :table-title="$t('system.downloadCenter.title')">
      <template #status="{ row }">
        <Tag :color="statusColor(row.status)">
          {{ statusText(row.status) }}
        </Tag>
        <div
          v-if="row.status === 'failed' && row.errorMessage"
          class="mt-1 text-xs text-red-500"
        >
          {{ row.errorMessage }}
        </div>
      </template>
      <template #progress="{ row }">
        <Progress
          :percent="row.progress"
          :status="row.status === 'failed' ? 'exception' : undefined"
          size="small"
        />
      </template>
      <template #rowCount="{ row }">
        {{ row.processedRows }}/{{ row.totalRows }}
      </template>
      <template #fileSize="{ row }">
        {{ formatFileSize(row.fileSize) }}
      </template>
      <template #action="{ row }">
        <Button
          :disabled="!canDownload(row)"
          size="small"
          type="link"
          @click="downloadFile(row)"
        >
          {{ $t('system.downloadCenter.download') }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>
