import type { VxeTableGridOptions } from '@vben/plugins/vxe-table';

import type { VbenFormSchema } from '#/adapter/form';
import type { WorkflowDefinitionApi } from '#/api/workflow';

import { getLocalDictList } from '#/dicts';

const statusOptions = [
  { label: '草稿', value: '0' },
  { label: '已发布', value: '1' },
  { label: '已停用', value: '2' },
];

const startTypeOptions = [
  { label: '手动发起流程', value: 0 },
  { label: '被动触发流程', value: 1 },
];

export function getWorkflowStatusOptions() {
  return statusOptions;
}

export function getWorkflowStatusText(status?: string) {
  return statusOptions.find((item) => item.value === status)?.label ?? '未知';
}

export function getWorkflowStartTypeText(startType?: number) {
  return (
    startTypeOptions.find((item) => item.value === startType)?.label ?? '未知'
  );
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'definitionName',
      label: '流程名称',
      componentProps: {
        allowClear: true,
      },
    },
    {
      component: 'Input',
      fieldName: 'definitionKey',
      label: '流程标识',
      componentProps: {
        allowClear: true,
      },
    },
    {
      component: 'Select',
      fieldName: 'category',
      label: '流程分类',
      componentProps: {
        options: getLocalDictList('WORKFLOW_CATEGORY'),
      },
    },
    {
      component: 'Select',
      fieldName: 'status',
      label: '状态',
      componentProps: {
        allowClear: true,
        mode: 'multiple',
        options: statusOptions,
      },
    },
  ];
}

export function useColumns(): VxeTableGridOptions<WorkflowDefinitionApi.WorkflowDefinition>['columns'] {
  return [
    {
      field: 'definitionName',
      title: '流程名称',
      sortable: true,
    },
    {
      field: 'definitionKey',
      title: '流程标识',
      sortable: true,
    },

    {
      field: 'businessType',
      title: '业务类型',
      cellRender: {
        name: 'DictTag',
        props: {
          type: 'BUSINESS_TYPE',
        },
      },
    },
    {
      field: 'startType',
      title: '启动类型',
      width: 120,
      formatter: ({ row }) => getWorkflowStartTypeText(row.startType),
    },
    {
      field: 'isDefault',
      title: '默认流程',
      width: 90,
      slots: { default: 'defaultFlag' },
    },
    {
      field: 'category',
      title: '分类',
      sortable: true,
      cellRender: {
        name: 'DictTag',
        props: {
          type: 'WORKFLOW_CATEGORY',
        },
      },
    },
    {
      field: 'status',
      title: '状态',
      sortable: true,
      formatter: ({ row }) => getWorkflowStatusText(row.status),
    },
    {
      field: 'version',
      title: '版本',
      sortable: true,
      formatter: ({ row }) => `v${row.version ?? 0}`,
    },
    {
      field: 'creatorName',
      title: '创建人',
    },
    {
      field: 'updateDate',
      title: '更新时间',
      sortable: true,
    },
    {
      field: 'remark',
      title: '备注',
      showOverflow: true,
    },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: '操作',
      width: 240,
    },
  ];
}
