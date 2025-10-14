<script lang="ts" setup>
import type { VbenFormProps } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { useVbenModal, Page, useVbenDrawer } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

import { getExampleTableApi } from '../mock-api';
import FormModalDemo from './form-modal.vue';
import { getDictList } from '#/dicts';
import { getTestData } from './testdata';
import ExtraTrackDrawer from './track-drawer.vue';

const formOptions: VbenFormProps = {
  // 默认展开
  wrapperClass: 'grid-cols-4',
  commonConfig: {
    componentProps: {
      allowClear: true,
    },
  },
  collapsed: true,
  schema: [
    {
      component: 'Select',
      fieldName: 'bugStatus',
      label: '状态',
      componentProps: {
        options: getDictList('BUG_STATUS'),
      },
    },
    {
      component: 'Input',
      fieldName: 'bugTitle',
      label: '标题',
    },
    {
      component: 'Input',
      fieldName: 'bugNum',
      label: '编号',
    },
    {
      component: 'Select',
      fieldName: 'bugConfirmStatus',
      label: '确认状态',
      componentProps: {
        options: getDictList('BUG_CONFIRM_STATUS'),
      },
    },
    {
      component: 'Select',
      fieldName: 'bugLevel',
      label: '级别',
      componentProps: {
        options: getDictList('BUG_LEVEL'),
      },
    },
    {
      component: 'Select',
      fieldName: 'bugType',
      label: '类型',
      componentProps: {
        options: getDictList('BUG_TYPE'),
      },
    },
    {
      component: 'Select',
      fieldName: 'bugEnv',
      label: '环境',
      componentProps: {
        options: getDictList('BUG_ENV'),
      },
    },
    {
      component: 'Select',
      fieldName: 'bugSource',
      label: '来源',
      componentProps: {
        options: getDictList('BUG_SOURCE'),
      },
    },
  ],
  // 是否在字段值改变时提交表单
  submitOnChange: false,
  // 按下回车时是否提交表单
  submitOnEnter: true,
};

const gridOptions: VxeGridProps = {
  data: getTestData(5),
  align: 'left',
  toolbarConfig: {
    // 是否显示搜索表单控制按钮
    // @ts-ignore 正式环境时有完整的类型声明
    search: true,
    refresh: true,
    import: false,
    export: false,
    print: false,
    zoom: true,
    custom: true,
  },
  columns: [
    {
      title: '编号',
      field: 'bugNum',
      width: 65,
      formatter: (row: any) => {
        return '#' + row.cellValue;
      },
    },
    {
      width: 80,
      align: 'center',
      title: '关联版本',
      field: 'version',
    },
    {
      width: 100,
      title: '关联模块',
      field: 'moduleTitle',
    },
    {
      title: '修复人',
      width: 100,
      showOverflow: true,
      cellRender: {
        name: 'UserAvatar',
        props: {
          avatarField: 'avatar',
          nameField: 'fixUserName',
        },
      },
    },
    { title: '标题', field: 'bugTitle', minWidth: 200, maxWidth: 400 },
    {
      title: '确认状态',
      field: 'bugConfirmStatus',
      width: 100,
      cellRender: {
        name: 'DictTag',
        props: {
          type: 'BUG_CONFIRM_STATUS',
        },
      },
    },
    {
      title: '状态',
      field: 'bugStatus',
      width: 100,
      cellRender: {
        name: 'DictTag',
        props: {
          type: 'BUG_STATUS',
        },
      },
    },

    {
      title: '级别',
      field: 'bugLevel',
      width: 100,
      cellRender: {
        name: 'DictTag',
        props: {
          type: 'BUG_LEVEL',
        },
      },
    },
    {
      title: '环境',
      field: 'bugEnv',
      width: 100,
      cellRender: {
        name: 'DictTag',
        props: {
          type: 'BUG_ENV',
        },
      },
    },
    {
      title: '类型',
      field: 'bugType',
      width: 100,
      cellRender: {
        name: 'DictTag',
        props: {
          type: 'BUG_TYPE',
        },
      },
    },
    {
      title: '来源',
      field: 'bugSource',
      width: 100,
      cellRender: {
        name: 'DictTag',
        props: {
          type: 'BUG_SOURCE',
        },
      },
    },

    {
      field: 'action',
      fixed: 'right',
      align: 'center',
      slots: { default: 'action' },
      title: '操作',
      width: 150,
    },
  ],
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {},
};

const [Grid] = useVbenVxeGrid({ formOptions, gridOptions });

// #region 单个添加
const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: FormModalDemo,
  destroyOnClose: true,
});

/** 打开表单弹窗 */
function openFormModal(row: any) {
  formModalApi.setData(row).open();
}

// #endregion

// #region 抽屉组件
const [TrackDrawer, TrackDrawerApi] = useVbenDrawer({
  // 连接抽离的组件
  connectedComponent: ExtraTrackDrawer,
});

/** 打开抽屉 */
function openDrawer(row: any) {
  TrackDrawerApi.setData({
    values: row,
  }).open();
}
// #endregion
</script>

<template>
  <Page auto-content-height>
    <Grid>
      <template #action="{ row }">
        <a-space :size="0">
          <a-button type="link" size="small" @click="openFormModal(row)">
            流转
          </a-button>
          <a-button type="link" size="small" @click="openFormModal(row)">
            编辑
          </a-button>
          <a-button type="link" size="small" @click="openDrawer(row)">
            轨迹
          </a-button>
        </a-space>
      </template>
      <template #toolbar-actions>
        <a-button type="primary" @click="openFormModal">新建缺陷</a-button>
      </template>
    </Grid>
    <FormModal />
    <TrackDrawer />
  </Page>
</template>
