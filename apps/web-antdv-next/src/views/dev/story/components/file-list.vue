<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { DevStoryApi } from '#/api/dev';

import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';
import { formatFileSize, onPreview } from '#/utils';

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
              onClick: () => onPreview(row.url),
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
