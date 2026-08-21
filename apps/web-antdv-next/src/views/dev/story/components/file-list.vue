<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { DevStoryApi } from '#/api/dev';

import { ref } from 'vue';

import { message } from 'antdv-next';

import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';
import { formatFileSize, previewWithKkFileView } from '#/utils';

/**
 * 附件列表组件
 * @property {Array} fileList - 附件列表数据
 */
const props = defineProps({
  fileList: {
    type: Array as () => DevStoryApi.DevStoryFileFace[],
    default: () => [],
  },
});

// 当前正在准备预览的文件 id，用于控制操作按钮 loading 状态
const previewingId = ref<string | null>(null);

/**
 * 将后端相对 URL 拼接为同源绝对 URL
 * @param url 后端返回的相对路径或绝对 URL
 * @returns kkFileView 服务端可 fetch 的绝对 URL
 */
function resolveUrl(url: string): string {
  if (!url) return '';
  if (/^(https?:)?\/\//i.test(url)) return url;
  return `${window.location.origin}${url}`;
}

/**
 * 预览附件，参考下载中心：先 loading 提示，再用 kkFileView 在新窗口打开。
 * 后端返回的相对路径用 window.location.origin 拼接为同源绝对 URL，
 * /uploads/** 为公开静态 URL，无需短时 token。
 * @param file 文件对象
 */
function onPreview(file: DevStoryApi.DevStoryFileFace) {
  const hideLoading = message.loading({
    content: '正在准备预览...',
    duration: 0,
  });
  previewingId.value = file.fileId;
  try {
    previewWithKkFileView(resolveUrl(file.url), file.originalName || file.name);
  } catch (error) {
    message.error((error as Error).message || '预览失败');
  } finally {
    hideLoading();
    previewingId.value = null;
  }
}

// 表格配置：附件数据由父组件 props 传入，禁用分页、工具栏与远程加载
const [Grid] = useVbenVxeGrid({
  gridOptions: {
    columns: [
      {
        field: 'originalName',
        title: '文件名',
        minWidth: 200,
        showOverflow: true,
      },
      {
        field: 'fileExt',
        title: '类型',
        width: 90,
        align: 'center',
      },
      {
        field: 'size',
        title: '大小',
        width: 100,
        align: 'center',
        formatter: ({ row }: any) => formatFileSize(row.size),
      },
      {
        field: 'creatorName',
        title: '上传人',
        width: 110,
        align: 'center',
      },
      {
        field: 'createDate',
        title: '上传时间',
        width: 160,
        align: 'center',
      },
      {
        field: 'operation',
        title: '操作',
        width: 100,
        fixed: 'right',
        align: 'center',
        slots: { default: 'action' },
      },
    ],
    rowConfig: {
      keyField: 'fileId',
    },
    height: 'auto',
    pagerConfig: { enabled: false },
    toolbarConfig: { enabled: false },
    proxyConfig: {
      autoLoad: false,
    },
  } as VxeTableGridOptions<DevStoryApi.DevStoryFileFace>,
});
</script>

<template>
  <div class="file-list-wrapper">
    <div class="file-list-title">附件</div>
    <Grid :table-data="props.fileList">
      <template #action="{ row }">
        <VbenTableAction
          :actions="[
            {
              text: '预览',
              icon: 'lucide:eye',
              loading: previewingId === row.fileId,
              onClick: () => onPreview(row),
            },
          ]"
          align="center"
        />
      </template>
    </Grid>
  </div>
</template>

<style scoped>
.file-list-wrapper {
  margin-top: 16px;
}

.file-list-title {
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
}
</style>
