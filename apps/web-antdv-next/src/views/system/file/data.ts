import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { $t } from '#/locales';
import { formatFileSize } from '#/utils';

/**
 * 文件状态选项（0=正式，1=临时未绑定），供查询条件和表格列共用
 */
function useStatusOptions() {
  return [
    { label: $t('system.file.statusFormal'), value: 0, color: 'success' },
    { label: $t('system.file.statusTemp'), value: 1, color: 'warning' },
  ];
}

/**
 * 搜索表单配置
 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'originalName',
      label: $t('system.file.fileName'),
      componentProps: {
        placeholder: $t('system.file.searchFileName'),
        allowClear: true,
      },
    },
    {
      component: 'Input',
      fieldName: 'type',
      label: $t('system.file.mimeType'),
      componentProps: {
        placeholder: $t('system.file.searchMimeType'),
        allowClear: true,
      },
    },
    {
      component: 'Input',
      fieldName: 'fileExt',
      label: $t('system.file.fileExt'),
      componentProps: {
        placeholder: $t('system.file.searchFileExt'),
        allowClear: true,
      },
    },
    {
      component: 'Select',
      fieldName: 'status',
      label: $t('system.file.status'),
      componentProps: {
        options: useStatusOptions(),
        allowClear: true,
      },
    },
  ];
}

/**
 * 表格列配置
 */
export function useColumns(): VxeTableGridOptions['columns'] {
  return [
    {
      field: 'url',
      title: $t('system.file.imagePreview'),
      width: 90,
      align: 'center',
      cellRender: { name: 'CellImage' },
    },
    {
      field: 'originalName',
      title: $t('system.file.fileName'),
      minWidth: 200,
      sortable: true,
      sortBy: 'originalName',
    },
    {
      field: 'fileExt',
      title: $t('system.file.fileExt'),
      width: 100,
      sortable: true,
      sortBy: 'fileExt',
    },
    {
      field: 'type',
      title: $t('system.file.mimeType'),
      width: 160,
      sortable: true,
      sortBy: 'type',
    },
    {
      field: 'size',
      title: $t('system.file.fileSize'),
      width: 120,
      sortable: true,
      sortBy: 'size',
      formatter: ({ row }: any) => formatFileSize(row.size),
    },
    {
      field: 'fullPath',
      title: $t('system.file.fullPath'),
      minWidth: 200,
    },
    {
      field: 'creatorName',
      title: $t('system.file.uploader'),
      width: 120,
      sortable: true,
      sortBy: 'creatorName',
    },
    {
      field: 'status',
      title: $t('system.file.status'),
      width: 100,
      align: 'center',
      cellRender: { name: 'CellTag', options: useStatusOptions() },
    },
    {
      field: 'createDate',
      title: $t('system.file.uploadTime'),
      width: 180,
      sortable: true,
      sortBy: 'createDate',
    },
    {
      align: 'center',
      field: 'operation',
      fixed: 'right',
      slots: { default: 'action' },
      title: $t('system.file.operation'),
      width: 150,
    },
  ];
}
