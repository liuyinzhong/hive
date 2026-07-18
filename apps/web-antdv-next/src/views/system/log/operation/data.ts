import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemLogApi } from '#/api/system';

import dayjs from 'dayjs';

import { $t } from '#/locales';

const dateTimeFormat = 'YYYY-MM-DD HH:mm:ss';

export function useSearchSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'username',
      label: $t('system.log.username'),
    },
    {
      component: 'Input',
      fieldName: 'requestUrl',
      label: $t('system.log.requestUrl'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: ['POST', 'PUT', 'PATCH', 'DELETE'].map((value) => ({
          label: value,
          value,
        })),
      },
      fieldName: 'requestMethod',
      label: $t('system.log.requestMethod'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          { label: $t('system.log.success'), value: 1 },
          { label: $t('system.log.failed'), value: 0 },
        ],
      },
      fieldName: 'status',
      label: $t('system.log.status'),
    },
    {
      component: 'RangePicker',
      componentProps: { showTime: true, valueFormat: dateTimeFormat },
      defaultValue: [
        dayjs().subtract(7, 'day').startOf('day').format(dateTimeFormat),
        dayjs().endOf('day').format(dateTimeFormat),
      ],
      fieldName: 'createDate',
      label: $t('system.log.createDate'),
    },
  ];
}

export function useColumns(): VxeTableGridOptions<SystemLogApi.OperationLog>['columns'] {
  return [
    { field: 'username', title: $t('system.log.username'), width: 140 },
    { field: 'realName', title: $t('system.log.realName'), width: 120 },
    {
      field: 'requestMethod',
      title: $t('system.log.requestMethod'),
      width: 100,
    },
    { field: 'requestUrl', minWidth: 280, title: $t('system.log.requestUrl') },
    { field: 'httpStatus', title: $t('system.log.httpStatus'), width: 100 },
    {
      field: 'status',
      slots: { default: 'status' },
      title: $t('system.log.status'),
      width: 100,
    },
    {
      field: 'durationMs',
      sortable: true,
      title: $t('system.log.duration'),
      width: 120,
    },
    { field: 'ip', title: $t('system.log.ip'), width: 150 },
    {
      field: 'createDate',
      sortable: true,
      title: $t('system.log.createDate'),
      width: 180,
    },
    {
      align: 'center',
      field: 'operation',
      fixed: 'right',
      slots: { default: 'action' },
      title: $t('system.log.operation'),
      width: 100,
    },
  ];
}
