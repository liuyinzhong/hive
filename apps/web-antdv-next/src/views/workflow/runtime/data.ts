import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { VbenFormSchema } from '#/adapter/form';
import type { WorkflowRuntimeApi } from '#/api/workflow';

import { $t } from '#/locales';

export function getInstanceStatusOptions() {
  return [
    {
      color: 'processing',
      label: $t('flow.runtime.instance.running'),
      value: '0',
    },
    {
      color: 'success',
      label: $t('flow.runtime.instance.completed'),
      value: '1',
    },
    { color: 'error', label: $t('flow.runtime.instance.rejected'), value: '2' },
    {
      color: 'default',
      label: $t('flow.runtime.instance.canceled'),
      value: '3',
    },
  ];
}

export function getTaskStatusOptions() {
  return [
    { color: 'processing', label: $t('flow.runtime.task.pending'), value: '0' },
    { color: 'success', label: $t('flow.runtime.task.approved'), value: '1' },
    { color: 'error', label: $t('flow.runtime.task.rejected'), value: '2' },
    { color: 'default', label: $t('flow.runtime.task.canceled'), value: '3' },
  ];
}

export function getCopyStatusOptions() {
  return [
    { color: 'warning', label: $t('flow.runtime.copy.unread'), value: '0' },
    { color: 'success', label: $t('flow.runtime.copy.read'), value: '1' },
  ];
}

export function getStatusText(
  options: Array<{ label: string; value: string }>,
  status?: string,
) {
  return (
    options.find((item) => item.value === status)?.label ??
    $t('flow.runtime.common.unknown')
  );
}

export function useInstanceGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Select',
      fieldName: 'status',
      label: $t('flow.runtime.common.status'),
      componentProps: {
        allowClear: true,
        mode: 'multiple',
        options: getInstanceStatusOptions(),
      },
    },
  ];
}

export function useTaskGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Select',
      fieldName: 'status',
      label: $t('flow.runtime.common.status'),
      componentProps: {
        allowClear: true,
        mode: 'multiple',
        options: getTaskStatusOptions(),
      },
    },
  ];
}

export function useCopyGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Select',
      fieldName: 'status',
      label: $t('flow.runtime.common.status'),
      componentProps: {
        allowClear: true,
        mode: 'multiple',
        options: getCopyStatusOptions(),
      },
    },
  ];
}

export function useInstanceColumns(): VxeTableGridOptions<WorkflowRuntimeApi.WorkflowInstance>['columns'] {
  return [
    {
      field: 'instanceNo',
      minWidth: 170,
      title: $t('flow.runtime.common.instanceNo'),
    },
    { field: 'title', minWidth: 200, title: $t('flow.runtime.common.title') },
    {
      field: 'definitionName',
      minWidth: 160,
      title: $t('flow.runtime.common.definition'),
    },
    {
      field: 'starterName',
      width: 120,
      title: $t('flow.runtime.common.starter'),
    },
    {
      cellRender: { name: 'CellTag', options: getInstanceStatusOptions() },
      field: 'status',
      title: $t('flow.runtime.common.status'),
      width: 100,
    },
    {
      field: 'createDate',
      title: $t('flow.runtime.common.createDate'),
      width: 170,
    },
    {
      field: 'operation',
      fixed: 'right',
      slots: { default: 'action' },
      title: $t('flow.runtime.common.operation'),
      width: 150,
    },
  ];
}

export function useTaskColumns(): VxeTableGridOptions<WorkflowRuntimeApi.WorkflowTask>['columns'] {
  return [
    {
      field: 'instanceTitle',
      minWidth: 200,
      title: $t('flow.runtime.common.title'),
    },
    { field: 'nodeName', minWidth: 140, title: $t('flow.runtime.common.node') },
    {
      field: 'starterName',
      width: 120,
      title: $t('flow.runtime.common.starter'),
    },
    {
      field: 'approvalMode',
      formatter: ({ row }) =>
        row.approvalMode === 'all'
          ? $t('flow.runtime.task.approvalAll')
          : $t('flow.runtime.task.approvalAny'),
      title: $t('flow.runtime.task.approvalMode'),
      width: 110,
    },
    {
      cellRender: { name: 'CellTag', options: getTaskStatusOptions() },
      field: 'status',
      title: $t('flow.runtime.common.status'),
      width: 100,
    },
    {
      field: 'createDate',
      title: $t('flow.runtime.common.createDate'),
      width: 170,
    },
    {
      field: 'finishDate',
      title: $t('flow.runtime.common.finishDate'),
      width: 170,
    },
    {
      field: 'operation',
      fixed: 'right',
      slots: { default: 'action' },
      title: $t('flow.runtime.common.operation'),
      width: 250,
    },
  ];
}

export function useTaskDetailColumns(): VxeTableGridOptions<WorkflowRuntimeApi.WorkflowTask>['columns'] {
  return [
    { field: 'nodeName', minWidth: 160, title: $t('flow.runtime.common.node') },
    {
      field: 'assigneeName',
      minWidth: 130,
      title: $t('flow.runtime.detail.assignee'),
    },
    {
      field: 'approvalMode',
      formatter: ({ row }) =>
        row.approvalMode === 'all'
          ? $t('flow.runtime.task.approvalAll')
          : $t('flow.runtime.task.approvalAny'),
      title: $t('flow.runtime.task.approvalMode'),
      width: 110,
    },
    {
      cellRender: { name: 'CellTag', options: getTaskStatusOptions() },
      field: 'status',
      title: $t('flow.runtime.common.status'),
      width: 100,
    },
    {
      field: 'comment',
      minWidth: 180,
      title: $t('flow.runtime.common.comment'),
    },
    {
      field: 'createDate',
      title: $t('flow.runtime.common.createDate'),
      width: 170,
    },
    {
      field: 'finishDate',
      title: $t('flow.runtime.common.finishDate'),
      width: 170,
    },
  ];
}

export function useCopyColumns(): VxeTableGridOptions<WorkflowRuntimeApi.WorkflowCopy>['columns'] {
  return [
    {
      field: 'instanceTitle',
      minWidth: 200,
      title: $t('flow.runtime.common.title'),
    },
    { field: 'nodeName', minWidth: 140, title: $t('flow.runtime.common.node') },
    {
      field: 'starterName',
      width: 120,
      title: $t('flow.runtime.common.starter'),
    },
    {
      cellRender: { name: 'CellTag', options: getCopyStatusOptions() },
      field: 'status',
      title: $t('flow.runtime.common.status'),
      width: 100,
    },
    {
      field: 'createDate',
      title: $t('flow.runtime.common.createDate'),
      width: 170,
    },
    {
      field: 'readDate',
      title: $t('flow.runtime.common.readDate'),
      width: 170,
    },
    {
      field: 'operation',
      fixed: 'right',
      slots: { default: 'action' },
      title: $t('flow.runtime.common.operation'),
      width: 170,
    },
  ];
}

export function useCopyDetailColumns(): VxeTableGridOptions<WorkflowRuntimeApi.WorkflowCopy>['columns'] {
  return [
    { field: 'nodeName', minWidth: 160, title: $t('flow.runtime.common.node') },
    {
      field: 'receiverName',
      minWidth: 130,
      title: $t('flow.runtime.detail.receiver'),
    },
    {
      cellRender: { name: 'CellTag', options: getCopyStatusOptions() },
      field: 'status',
      title: $t('flow.runtime.common.status'),
      width: 100,
    },
    {
      field: 'createDate',
      title: $t('flow.runtime.common.createDate'),
      width: 170,
    },
    {
      field: 'readDate',
      title: $t('flow.runtime.common.readDate'),
      width: 170,
    },
  ];
}
