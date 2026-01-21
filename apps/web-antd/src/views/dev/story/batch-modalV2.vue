<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal, VbenButton, VbenButtonGroup } from '@vben/common-ui';

import {
  useVbenVxeGrid,
  type VxeTableGridOptions,
  type OnActionClickParams,
} from '#/adapter/vxe-table';

import * as VTable from '@visactor/vtable';
import { message } from 'ant-design-vue';

import { getDictList } from '#/dicts';

import {
  getVersionsList,
  getModulesList,
  getProjectsList,
  type SystemStoryApi,
} from '#/api/dev';

defineOptions({
  name: 'StoryBatchFormModelV2',
});

// 表格分页
const [Grid, gridApi] = useVbenVxeGrid({
  showSearchForm: false,
  gridOptions: {
    editConfig: {
      trigger: 'click',
      mode: 'cell',
    },
    pagerConfig: {
      enabled: false,
    },
    toolbarConfig: {
      enabled: false,
    },
    height: 600,
    data: [{}],
    columns: [
      {
        field: 'projectTitle',
        title: '关联项目',
        /* editRender: {
          name: 'ApiSelect',
          labelField: 'projectTitle',
          valueField: 'projectId',
          resultField:"",
          api: () => getProjectsList(),
        }, */
      },
      {
        field: 'moduleTitle',
        title: '关联模块',
      },
      {
        field: 'version',
        title: '迭代版本',
      },
      {
        field: 'storyTitle',
        title: '需求标题',
      },
      {
        field: 'storyStatus',
        title: '需求状态',
      },
      {
        field: 'storyType',
        title: '需求类别',
      },
      {
        field: 'storyPriority',
        title: '需求优先级',
      },
      {
        field: 'storyRichText',
        title: '需求描述',
      },
      {
        field: 'files',
        title: '需求附件',
      },
    ],
  },
  gridEvents: {},
});

const [Modal, modalApi] = useVbenModal({
  onConfirm: async () => {
    modalApi.close();
  },
  onOpened() {},
});
</script>
<template>
  <Modal class="w-[1258px]">
    <Grid> </Grid>
    <template #center-footer>
      <VbenButtonGroup v-bind="{ gap: 10 }" :border="true"> </VbenButtonGroup>
    </template>
  </Modal>
</template>

<style scoped>
/* Add your styles here */
</style>
