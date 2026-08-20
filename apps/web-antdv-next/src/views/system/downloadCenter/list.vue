<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemDownloadApi } from '#/api/system';

import { onBeforeUnmount, watch } from 'vue';

import { Page } from '@vben/common-ui';
import { downloadFileFromBlob, debounce } from '@vben/utils';

import { Alert, Button, message, Progress, Tag } from 'antdv-next';
import dayjs from 'dayjs';
import { storeToRefs } from 'pinia';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  downloadTaskFileApi,
  getDownloadTaskListApi,
  getDownloadTaskPreviewUrlApi,
} from '#/api/system';
import { $t } from '#/locales';
import { useMenuMessageStore } from '#/store/menu-message';

import { useColumns, useSearchSchema } from './data';
import { previewWithKkFileView } from '#/utils';

const menuMessageStore = useMenuMessageStore();
const { downloadTaskRevision } = storeToRefs(menuMessageStore);

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    fieldMappingTime: [['createDate', ['createDateStart', 'createDateEnd']]],
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

/**
 * 防抖刷新下载任务列表
 *
 * SSE 在短时间内可能推送多次 downloadTaskChanged 事件，
 * 使用 debounce 合并为 300ms 内的最后一次触发，避免重复请求。
 */
const refreshListDebounced = debounce(() => gridApi.query(), 300);
watch(downloadTaskRevision, () => {
  refreshListDebounced();
});
onBeforeUnmount(() => refreshListDebounced.cancel());

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

/**
 * 通过 kkFileView 预览文件。
 * 先调用后端获取临时签名 URL（5 分钟内有效），用 window.location.origin 拼接为完整 URL（dev 走 vite proxy、生产走 nginx 反代），
 * 再通过公共方法 previewWithKkFileView 在新窗口打开预览，公共方法负责附加 fullfilename、base64 编码和 openWindow。
 * @param row 当前行数据
 */
async function previewFile(row: SystemDownloadApi.DownloadTask) {
  const hideLoading = message.loading({
    content: $t('system.downloadCenter.preparingPreview'),
    duration: 0,
  });
  try {
    const { previewUrl } = await getDownloadTaskPreviewUrlApi(row.id);
    debugger;
    // 用当前 origin 拼接（dev 走 vite proxy 到后端，生产走 nginx 反代）
    const absoluteUrl = `${window.location.origin}${previewUrl}`;
    // 下载中心文件均为 xlsx，fileName 缺失时用任务名兜底
    const fileName = row.fileName || `${row.taskName}.xlsx`;
    previewWithKkFileView(absoluteUrl, fileName);
  } catch (error: any) {
    message.error(error.message || '预览失败');
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
          @click="previewFile(row)"
        >
          {{ $t('system.downloadCenter.preview') }}
        </Button>
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
