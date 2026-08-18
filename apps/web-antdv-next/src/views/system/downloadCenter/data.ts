import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemDownloadApi } from '#/api/system';

import { $t } from '#/locales';

export function useSearchSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'taskName',
      label: $t('system.downloadCenter.taskName'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          { label: $t('system.downloadCenter.pending'), value: 'pending' },
          { label: $t('system.downloadCenter.running'), value: 'running' },
          {
            label: $t('system.downloadCenter.succeeded'),
            value: 'succeeded',
          },
          { label: $t('system.downloadCenter.failed'), value: 'failed' },
        ],
      },
      fieldName: 'status',
      label: $t('system.downloadCenter.status'),
    },
    {
      component: 'RangePicker',
      componentProps: {
        showTime: true,
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
      },
      fieldName: 'createDate',
      label: $t('system.downloadCenter.createDate'),
    },
  ];
}

export function useColumns(): VxeTableGridOptions<SystemDownloadApi.DownloadTask>['columns'] {
  return [
    {
      field: 'taskName',
      minWidth: 180,
      title: $t('system.downloadCenter.taskName'),
    },
    {
      field: 'fileName',
      minWidth: 180,
      title: $t('system.downloadCenter.fileName'),
    },
    {
      field: 'sourceModule',
      title: $t('system.downloadCenter.sourceModule'),
      width: 130,
    },
    {
      field: 'createDate',
      title: $t('system.downloadCenter.createDate'),
      width: 180,
    },
    {
      field: 'status',
      slots: { default: 'status' },
      title: $t('system.downloadCenter.status'),
      width: 110,
    },
    {
      field: 'progress',
      slots: { default: 'progress' },
      title: $t('system.downloadCenter.progress'),
      width: 160,
    },
    {
      field: 'processedRows',
      slots: { default: 'rowCount' },
      title: $t('system.downloadCenter.rowCount'),
      width: 120,
    },
    {
      field: 'fileSize',
      slots: { default: 'fileSize' },
      title: $t('system.downloadCenter.fileSize'),
      width: 110,
    },
    {
      field: 'completedDate',
      title: $t('system.downloadCenter.completedDate'),
      width: 180,
    },
    {
      field: 'expireDate',
      title: $t('system.downloadCenter.expireDate'),
      width: 180,
    },
    {
      align: 'center',
      field: 'operation',
      fixed: 'right',
      slots: { default: 'action' },
      title: $t('system.downloadCenter.operation'),
      width: 160,
    },
  ];
}
