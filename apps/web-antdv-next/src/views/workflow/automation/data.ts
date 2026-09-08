import type { VxeTableGridOptions } from '@vben/plugins/vxe-table';

import type { VbenFormSchema } from '#/adapter/form';
import type { WorkflowAutomationApi } from '#/api/workflow';

import { getLocalDictList } from '#/dicts';

/** 动作类型选项:版本1仅修改字段值,预留插入记录等 */
export const automationActionTypeOptions = [
  { label: '修改字段值', value: 'update_field' },
];

/** 按动作类型返回展示文本。 */
export function getActionTypeText(actionType?: string) {
  return (
    automationActionTypeOptions.find((item) => item.value === actionType)
      ?.label ?? actionType ?? '-'
  );
}

/** 动作摘要:目标字段 → 目标值。 */
export function getAutomationSummary(
  row: WorkflowAutomationApi.AutomationResponse,
) {
  const field = row.targetFieldLabel || row.targetField;
  return `${field} → ${row.targetValue}`;
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'automationName',
      label: '动作名称',
      componentProps: {
        allowClear: true,
      },
    },
    {
      component: 'Select',
      fieldName: 'businessType',
      label: '业务类型',
      componentProps: {
        allowClear: true,
        options: getLocalDictList('BUSINESS_TYPE'),
      },
    },
    {
      component: 'Select',
      fieldName: 'status',
      label: '状态',
      componentProps: {
        allowClear: true,
        options: [
          { label: '启用', value: '0' },
          { label: '停用', value: '1' },
        ],
      },
    },
  ];
}

export function useColumns(): VxeTableGridOptions<WorkflowAutomationApi.AutomationResponse>['columns'] {
  return [
    {
      field: 'automationName',
      title: '动作名称',
      minWidth: 140,
    },
    {
      field: 'businessType',
      title: '业务类型',
      width: 100,
      cellRender: {
        name: 'DictTag',
        props: {
          type: 'BUSINESS_TYPE',
        },
      },
    },
    {
      field: 'actionType',
      title: '动作类型',
      width: 110,
      formatter: ({ row }) => getActionTypeText(row.actionType),
    },
    {
      field: 'summary',
      title: '动作摘要',
      minWidth: 160,
      formatter: ({ row }) => getAutomationSummary(row),
    },
    {
      field: 'status',
      title: '状态',
      width: 80,
      formatter: ({ row }) => (row.status === '0' ? '启用' : '停用'),
    },
    {
      field: 'remark',
      title: '备注',
      minWidth: 140,
      showOverflow: true,
    },
    {
      field: 'updateDate',
      title: '更新时间',
      sortable: true,
      width: 160,
    },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: '操作',
      width: 140,
    },
  ];
}
