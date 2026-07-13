import type { VxeTableGridOptions } from '@vben/plugins/vxe-table';

import type { VbenFormSchema } from '#/adapter/form';
import type { WorkflowDefinitionApi } from '#/api/workflow';

const statusOptions = [
  { label: '草稿', value: '0' },
  { label: '已发布', value: '1' },
  { label: '已停用', value: '2' },
];

export function getWorkflowStatusOptions() {
  return statusOptions;
}

export function getWorkflowStatusText(status?: string) {
  return statusOptions.find((item) => item.value === status)?.label ?? '未知';
}

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'definitionId',
      label: '流程定义ID',
      dependencies: {
        triggerFields: ['definitionId'],
        show() {
          return false;
        },
      },
    },
    {
      component: 'Input',
      fieldName: 'definitionName',
      label: '流程名称',
      rules: 'required',
      componentProps: {
        allowClear: true,
        maxlength: 128,
      },
    },
    {
      component: 'Input',
      fieldName: 'definitionKey',
      label: '流程标识',
      rules: 'required',
      componentProps: {
        allowClear: true,
        maxlength: 128,
        placeholder: '如 story_approval',
      },
    },
    {
      component: 'Input',
      fieldName: 'category',
      label: '流程分类',
      componentProps: {
        allowClear: true,
        maxlength: 64,
        placeholder: '如 dev、system',
      },
    },
    {
      component: 'Textarea',
      fieldName: 'remark',
      label: '备注',
      componentProps: {
        maxlength: 256,
        rows: 3,
        showCount: true,
      },
    },
  ];
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
      component: 'Input',
      fieldName: 'category',
      label: '流程分类',
      componentProps: {
        allowClear: true,
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
      minWidth: 180,
      sortable: true,
    },
    {
      field: 'definitionKey',
      title: '流程标识',
      minWidth: 180,
      sortable: true,
    },
    {
      field: 'category',
      title: '分类',
      width: 110,
      sortable: true,
      cellRender: {
        name: 'CellTag',
      },
    },
    {
      field: 'status',
      title: '状态',
      width: 100,
      sortable: true,
      formatter: ({ row }) => getWorkflowStatusText(row.status),
    },
    {
      field: 'version',
      title: '版本',
      width: 90,
      sortable: true,
      formatter: ({ row }) => `v${row.version ?? 0}`,
    },
    {
      field: 'creatorName',
      title: '创建人',
      width: 110,
    },
    {
      field: 'updateDate',
      title: '更新时间',
      width: 170,
      sortable: true,
    },
    {
      field: 'remark',
      title: '备注',
      minWidth: 180,
      showOverflow: true,
    },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: '操作',
      width: 230,
    },
  ];
}
