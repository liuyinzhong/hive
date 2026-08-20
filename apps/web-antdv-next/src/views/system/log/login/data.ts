import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemLogApi } from '#/api/system';

import dayjs from 'dayjs';

import { message } from 'antdv-next';

import { createLoginLogExportApi } from '#/api/system';
import { $t } from '#/locales';
import { formatVxeTableExportOptions } from '#/utils';

const dateTimeFormat = 'YYYY-MM-DD HH:mm:ss';

export function useSearchSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'username',
      label: $t('system.log.username'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          { label: $t('system.log.login'), value: 'login' },
          { label: $t('system.log.logout'), value: 'logout' },
        ],
      },
      fieldName: 'eventType',
      label: $t('system.log.eventType'),
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
      component: 'Input',
      fieldName: 'ip',
      label: $t('system.log.ip'),
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

export async function createExport(formValues: any, exportOptions: any) {
  await createLoginLogExportApi({
    ...formatVxeTableExportOptions(exportOptions),
    endDate: formValues.endDate as string | undefined,
    eventType: formValues.eventType as 'login' | 'logout' | undefined,
    ip: formValues.ip as string | undefined,
    startDate: formValues.startDate as string | undefined,
    status: formValues.status as 0 | 1 | undefined,
    username: formValues.username as string | undefined,
  });
  message.success($t('system.log.exportCreated'));
}

export function useColumns(): VxeTableGridOptions<SystemLogApi.LoginLog>['columns'] {
  return [
    { field: 'username', title: $t('system.log.username'), width: 150 },
    {
      field: 'eventType',
      slots: { default: 'eventType' },
      title: $t('system.log.eventType'),
      width: 100,
    },
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
    { field: 'userAgent', minWidth: 280, title: $t('system.log.userAgent') },
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
