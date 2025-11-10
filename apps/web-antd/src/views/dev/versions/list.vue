<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { VbenFormProps } from '#/adapter/form';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { Page, useVbenModal } from '@vben/common-ui';
import addFormModal from './add-modal.vue';
import { getDictList } from '#/dicts';

//#region 表格搜索,配置

/** 搜索表单配置 */
const querySearch = () => {
  gridApi.formApi.resetForm();
};

const formOptions: VbenFormProps = {
  handleSubmit: querySearch,
  handleReset: querySearch,
  // 控制表单是否显示折叠按钮
  showCollapseButton: false,
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
      fieldName: 'version',
      label: '版本号',
    },
    {
      component: 'ApiSelect',
      fieldName: 'releaseStatus',
      label: '发布状态',
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
  border: true,
  columns: [
    {
      field: 'version',
      title: '版本号',
    },
    {
      field: 'releaseStatus',
      title: '发布状态',
    },
    {
      field: 'releaseDate',
      title: '发布时间',
    },
    {
      field: 'changeLog',
      title: '发布日志',
    },
    {
      field: 'creatorName',
      title: '创建人',
    },
    {
      field: 'createTime',
      title: '创建时间',
    },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: '操作',
      width: 150,
    },
  ],
  data: [],
};

// 表格分页
const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions,
  formOptions,
  gridEvents: {},
});

//#endregion

// #region 单个添加，编辑 表单弹窗

const [FormModal, FormModalApi] = useVbenModal({
  connectedComponent: addFormModal,
  destroyOnClose: true,
});

/** 打开表单弹窗 */
function openFormModal(row: any) {
  FormModalApi.setData(row).open();
}

// #endregion
</script>

<template>
  <Page auto-content-height>
    <Grid>
      <template #toolbar-actions>
        <a-button class="mr-2" type="primary" @click="openFormModal({})">
          新建
        </a-button>
      </template>
      <template #action="{ row }">
        <a-space :size="0">
          <a-button type="link" @click="openFormModal(row)" size="small"
            >编辑</a-button
          >
          <a-button type="link" @click="openFormModal(row)" size="small"
            >查看</a-button
          >
        </a-space>
      </template>
    </Grid>
    <FormModal />
  </Page>
</template>
