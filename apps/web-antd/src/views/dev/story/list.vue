<script lang="ts" setup>
import type { VbenFormProps } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { useRouter } from 'vue-router';

import {
  useVbenDrawer,
  useVbenModal,
  VbenCountToAnimator,
  Page,
} from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getDictList } from '#/dicts';

import { getExampleTableApi } from '../mock-api2';
import ExtraDrawer from './drawer.vue';
import ExtraAddStoryModal from './add-modal.vue';
import ExtraAddBatchStoryModal from './add-batch.vue';

// 跳转路由
const router = useRouter();

// #region 表格搜索,配置
const querySearch = () => {
  gridApi.formApi.resetForm();
};
/** 搜索表单配置 */
const formOptions: VbenFormProps = {
  handleSubmit: querySearch,
  handleReset: querySearch,
  // 控制表单是否显示折叠按钮
  showCollapseButton: true,
  submitButtonOptions: {},
  // 是否在字段值改变时提交表单
  submitOnChange: false,
  // 按下回车时是否提交表单
  submitOnEnter: true,
  // 默认展开
  collapsed: false,
  schema: [
    {
      component: 'Input',
      defaultValue: '',
      fieldName: 'storyTitle',
      label: '需求名称',
    },
    {
      component: 'ApiSelect',
      fieldName: 'storyStatus',
      label: '需求状态',
      componentProps: {
        allowClear: true,
        filterOption: true,
        showSearch: true,
        api: () => getDictList('STORY_STATUS'),
      },
    },
  ],
};

/** 表格配置 */
const gridOptions: VxeGridProps = {
  checkboxConfig: {
    highlight: true,
    labelField: 'id',
  },
  editConfig: {
    trigger: 'click',
    mode: 'cell',
  },
  toolbarConfig: {
    // 是否显示搜索表单控制按钮
    // @ts-ignore 正式环境时有完整的类型声明
    search: true,
    refresh: true,
    import: true,
    export: true,
    print: true,
    zoom: true,
    custom: true,
  },

  columns: [
    { type: 'checkbox', title: 'id', width: 80, headerAlign: 'left' },
    { field: 'storyTitle', align: 'left', title: '需求名称', width: 200 },
    {
      field: 'pmLink',
      align: 'left',
      title: '原型链接',
      width: 200,
      cellRender: {
        name: 'CellLink',
        events: {
          click: () => {},
        },
      },
    },
    {
      field: 'step',
      title: '需求阶段',
      cellRender: {
        name: 'CellLink',
        props: {
          text: '阶段',
        },
        events: {
          click: (row: any) => {
            openDrawer(row);
          },
        },
      },
    },
    {
      field: 'storyType',
      title: '需求类别',
      cellRender: {
        name: 'DictTag',
        props: {
          type: 'STORE_TYPE',
        },
      },
    },
    {
      field: 'storyStatus',
      title: '需求状态',
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
      editRender: {
        name: 'UserSelect',
        props: {
          listField: 'userList',
          labelField: 'realName',
          valueField: 'userId',
          avatarField: 'avatar',
        },
      },
    },
    {
      field: 'version',
      title: '迭代',
      cellRender: {
        name: 'CellLink',
        events: {
          click: () => {},
        },
      },
    },
    {
      field: 'storyLevel',
      title: '优先级',
      cellRender: {
        name: 'DictTag',
        props: {
          type: 'STORE_LEVEL',
        },
      },
    },
    {
      field: 'moduleTitle',
      title: '项目模块',
    },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: '操作',
      width: 130,
    },
  ],
  keepSource: true,
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        message.success(`Query params: ${JSON.stringify(formValues)}`);
        return await getExampleTableApi({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },
  printConfig: {},
  importConfig: {
    types: ['csv', 'xls', 'xlsx'],
  },
  exportConfig: {
    types: ['csv', 'xls', 'xlsx'],
  },
};

// 表格分页
const [Grid, gridApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
  gridEvents: {},
});

// #endregion

// #region 单个添加需求

const [AddStoryModal, AddStoryModalApi] = useVbenModal({
  title: '添加需求',
  connectedComponent: ExtraAddStoryModal,
  destroyOnClose: true,
});
function openAddStoryModal(row: any) {
  AddStoryModalApi.setData(row).open();
}

// #endregion

// #region 批量添加需求

const [AddBatchStoryModal, addBatchStoryModalApi] = useVbenModal({
  title: '批量添加需求',
  connectedComponent: ExtraAddBatchStoryModal,
  destroyOnClose: true,
});

/** 打开批量添加弹窗 */
function openAddBatchStoryModal() {
  addBatchStoryModalApi.open();
}

// #endregion

// #region 抽屉组件

const [Drawer, drawerApi] = useVbenDrawer({
  // 连接抽离的组件
  connectedComponent: ExtraDrawer,
});

/** 打开抽屉 */
function openDrawer(row: any) {
  drawerApi
    .setData({
      values: row,
    })
    .open();
}
// #endregion
</script>

<template>
  <Page auto-content-height>
    <Grid @toolbar-click="querySearch">
      <template #action="{ row }">
        <a-space :size="0">
          <a-button type="link" @click="openAddStoryModal(row)" size="small">
            编辑
          </a-button>
          <a-button type="link" @click="openAddStoryModal(row)" size="small">
            添加任务
          </a-button>
        </a-space>
      </template>
      <template #toolbar-actions>
        <a-button class="mr-2" type="primary" @click="openAddStoryModal({})">
          新建
        </a-button>
        <a-button class="mr-2" type="primary" @click="openAddBatchStoryModal">
          批量新建
        </a-button>
      </template>
    </Grid>
    <AddStoryModal />
    <Drawer />
    <AddBatchStoryModal />
  </Page>
</template>
