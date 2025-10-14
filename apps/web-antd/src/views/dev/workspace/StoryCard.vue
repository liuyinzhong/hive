<script lang="ts" setup>
import { Card } from 'ant-design-vue';
import { reactive, ref } from 'vue';
import type { VxeGridProps } from '#/adapter/vxe-table';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getExampleTableApi } from '../mock-api2';
/** 表格配置 */
const gridOptions: VxeGridProps = {
  pagerConfig: {
    enabled: true,
  },
  columns: [
    {
      field: 'version',
      title: '迭代',
      width: 100,
    },
    { field: 'storyTitle', align: 'left', title: '需求名称', width: 300 },
    {
      field: 'status',
      title: '需求状态',
      width: 100,
      cellRender: {
        name: 'DictTag',
        props: {
          type: 'STORY_STATUS',
        },
      },
    },
    {
      field: 'userList',
      title: '参与人员',
      minWidth: 120,
      cellRender: {
        name: 'UserAvatar',
      },
    },

    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: '操作',
      width: 70,
    },
  ],
  keepSource: true,
  proxyConfig: {},
};

// 表格分页
const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions,
});
</script>

<template>
  <Card
    class="mb-2 min-h-[300px] w-full"
    title="我参与的需求"
    :bodyStyle="{ padding: 0, overflow: 'auto' }"
  >
    <Grid>
      <template #action="{ row }">
        <a-space :size="0">
          <a-button type="link" size="small">流转</a-button>
        </a-space>
      </template>
    </Grid>
  </Card>
</template>
